import { glslFragment, glslVertex, UNIFORM_FLOATS, wgsl } from "./shaders.ts";

type Surface = HTMLCanvasElement | OffscreenCanvas;

/** What the renderer needs from a GPU API: one full-screen draw with six vec4 uniforms. */
export interface Backend {
	name: "webgpu" | "webgl";
	/** CPU emulation (SwiftShader, llvmpipe, WebGPU fallback adapter): draw once, never animate. */
	software: boolean;
	resize(width: number, height: number): void;
	draw(uniforms: Float32Array): void;
	/**
	 * True while the GPU is still on the last frame. Drawing again would queue work faster
	 * than the GPU finishes it, and a growing queue freezes the whole browser, not just
	 * this page.
	 */
	busy(): boolean;
	/** How long the GPU took for the last finished frame, in ms, or 0 when unknown. */
	cost(): number;
	destroy(): void;
}

/* A frame the GPU never reports finished (a driver bug, a lost device) must not stop the
   nebula forever. */
const STALE = 500;

/** Tracks one frame in flight: when it was sent and how long the GPU took for it. */
function inflight() {
	let sent = 0;
	let pending = false;
	let cost = 0;

	return {
		send() {
			sent = performance.now();
			pending = true;
		},
		done() {
			if (!pending) return;
			pending = false;
			cost = performance.now() - sent;
		},
		busy: () => pending && performance.now() - sent < STALE,
		cost: () => cost,
	};
}

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i;

/** WebGPU first: it is the faster API, and the GPU here is entirely the nebula's. */
async function webgpu(surface: Surface, transparent: boolean): Promise<Backend | undefined> {
	const gpu = (globalThis.navigator as Navigator & { gpu?: GPU }).gpu;

	if (!gpu) return undefined;

	const adapter = await gpu.requestAdapter({ powerPreference: "low-power" }).catch(() => null);

	if (!adapter) return undefined;

	// Ask for the device before touching the canvas: once a canvas has a context it
	// cannot take another kind, and WebGL still needs to be possible if this fails.
	const device = await adapter.requestDevice().catch(() => null);

	if (!device) return undefined;

	const format = gpu.getPreferredCanvasFormat();
	const module = device.createShaderModule({ code: wgsl });
	// Compile and validate before claiming the canvas: if the shader fails here, the
	// canvas is still free for WebGL.
	const pipeline = await device
		.createRenderPipelineAsync({
			layout: "auto",
			vertex: { module, entryPoint: "vertex_main" },
			fragment: { module, entryPoint: "fragment_main", targets: [{ format }] },
			primitive: { topology: "triangle-list" },
		})
		.catch(() => null);

	if (!pipeline) {
		device.destroy();
		return undefined;
	}

	const context = surface.getContext("webgpu") as GPUCanvasContext | null;

	if (!context) {
		device.destroy();
		return undefined;
	}

	// The band lets the page show through where there is no cloud (premultiplied colors).
	context.configure({ device, format, alphaMode: transparent ? "premultiplied" : "opaque" });

	const buffer = device.createBuffer({
		size: UNIFORM_FLOATS * 4,
		// GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, as numbers: the constants are
		// not in every TypeScript DOM library yet.
		usage: 0x40 | 0x08,
	});
	const bindings = device.createBindGroup({
		layout: pipeline.getBindGroupLayout(0),
		entries: [{ binding: 0, resource: { buffer } }],
	});
	const info = (
		adapter as GPUAdapter & {
			info?: {
				isFallbackAdapter?: boolean;
				vendor?: string;
				architecture?: string;
				description?: string;
			};
		}
	).info;
	const software =
		Boolean((adapter as GPUAdapter & { isFallbackAdapter?: boolean }).isFallbackAdapter) ||
		Boolean(info?.isFallbackAdapter) ||
		SOFTWARE.test(`${info?.vendor} ${info?.architecture} ${info?.description}`);
	const frame = inflight();

	return {
		name: "webgpu",
		software,
		resize(width, height) {
			surface.width = width;
			surface.height = height;
		},
		draw(uniforms) {
			device.queue.writeBuffer(buffer, 0, uniforms);

			const encoder = device.createCommandEncoder();
			const pass = encoder.beginRenderPass({
				colorAttachments: [
					{ view: context.getCurrentTexture().createView(), loadOp: "clear", storeOp: "store" },
				],
			});

			pass.setPipeline(pipeline);
			pass.setBindGroup(0, bindings);
			pass.draw(3);
			pass.end();
			device.queue.submit([encoder.finish()]);
			// Older implementations lack it: then nothing is in flight, as far as anyone knows.
			if (typeof device.queue.onSubmittedWorkDone !== "function") return;
			frame.send();
			device.queue.onSubmittedWorkDone().then(frame.done, frame.done);
		},
		busy: frame.busy,
		cost: frame.cost,
		destroy() {
			context.unconfigure();
			device.destroy();
		},
	};
}

function compile(gl: WebGLRenderingContext | WebGL2RenderingContext, type: number, source: string) {
	const shader = gl.createShader(type) as WebGLShader;

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	return shader;
}

function webgl(surface: Surface, transparent: boolean): Backend | undefined {
	// The band lets the page show through where there is no cloud (premultiplied colors).
	const options = {
		alpha: transparent,
		antialias: false,
		powerPreference: "low-power",
		premultipliedAlpha: true,
	} as const;
	// WebGL 2 runs the same GLSL ES 1.0 shaders and adds fences, which tell when the GPU is
	// done with a frame. WebGL 1 has no way to know, so it relies on frame timing alone.
	const context = (surface.getContext("webgl2", options) ?? surface.getContext("webgl", options)) as
		| WebGL2RenderingContext
		| WebGLRenderingContext
		| null;

	if (!context) return undefined;

	const gl = context;
	const gl2 = "fenceSync" in gl ? gl : undefined;
	let fence: WebGLSync | null = null;
	const frame = inflight();

	/** Polls the fence of the frame in flight, without waiting. */
	function check() {
		if (!gl2 || !fence) return;
		if (gl2.getSyncParameter(fence, gl2.SYNC_STATUS) !== gl2.SIGNALED) return;
		gl2.deleteSync(fence);
		fence = null;
		frame.done();
	}
	const program = gl.createProgram() as WebGLProgram;

	gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, glslVertex));
	gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, glslFragment));
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;

	// biome-ignore lint/correctness/useHookAtTopLevel: a WebGL call, not a React hook
	gl.useProgram(program);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

	const position = gl.getAttribLocation(program, "a_position");

	gl.enableVertexAttribArray(position);
	gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

	const names = ["u_a", "u_b", "u_c", "u_r0", "u_r1", "u_r2"];
	const locations = names.map((name) => gl.getUniformLocation(program, name));
	const info = gl.getExtension("WEBGL_debug_renderer_info");
	const software = info
		? SOFTWARE.test(String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)))
		: false;

	return {
		name: "webgl",
		software,
		resize(width, height) {
			surface.width = width;
			surface.height = height;
			gl.viewport(0, 0, width, height);
		},
		draw(uniforms) {
			locations.forEach((location, index) => {
				gl.uniform4fv(location, uniforms.subarray(index * 4, index * 4 + 4));
			});
			gl.drawArrays(gl.TRIANGLES, 0, 3);
			if (!gl2) return;
			if (fence) gl2.deleteSync(fence);
			fence = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
			gl2.flush();
			frame.send();
		},
		busy() {
			check();
			return frame.busy();
		},
		// The fence is only polled once per animation frame, so its timing is rounded up
		// to a whole frame: too coarse to judge cost by. Frame timing and `busy` do instead.
		cost: () => 0,
		destroy() {
			gl.getExtension("WEBGL_lose_context")?.loseContext();
		},
	};
}

/*
 * Gecko (Firefox, Zen, LibreWolf…) shows WebGPU canvases far slower than WebGL ones: in
 * Zen 1.24 (Gecko 159) on an M4 Pro the nebula drew 10 frames a second with WebGPU, even
 * at half resolution, and 62 with WebGL at full. Chromium and WebKit draw both alike.
 * "like Gecko" in other engines' user agents never has the slash and build date.
 */
const GECKO = /\bGecko\/\d/;

/**
 * The best API this browser offers for this canvas, or none at all. A transparent canvas
 * shows the page wherever the shader draws nothing.
 */
export async function pickBackend(
	surface: Surface,
	prefer?: "webgpu" | "webgl",
	transparent = false
) {
	const gecko = GECKO.test(globalThis.navigator?.userAgent ?? "");

	if (prefer === "webgpu" || (prefer !== "webgl" && !gecko)) {
		const gpu = await webgpu(surface, transparent).catch(() => undefined);

		if (gpu) return gpu;
	}

	return webgl(surface, transparent);
}
