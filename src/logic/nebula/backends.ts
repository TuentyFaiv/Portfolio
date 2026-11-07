import { glslFragment, glslVertex, UNIFORM_FLOATS, wgsl } from "./shaders.ts";

type Surface = HTMLCanvasElement | OffscreenCanvas;

export interface Backend {
	name: "webgpu" | "webgl";
	software: boolean;
	resize(width: number, height: number): void;
	draw(uniforms: Float32Array): void;
	// Queuing frames faster than the GPU finishes them freezes the whole browser.
	busy(): boolean;
	cost(): number;
	destroy(): void;
}

// A frame the GPU never reports done (driver bug, lost device) must not stop drawing forever.
const STALE = 500;

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

async function webgpu(surface: Surface, transparent: boolean): Promise<Backend | undefined> {
	const gpu = (globalThis.navigator as Navigator & { gpu?: GPU }).gpu;

	if (!gpu) return undefined;

	const adapter = await gpu.requestAdapter({ powerPreference: "low-power" }).catch(() => null);

	if (!adapter) return undefined;

	const device = await adapter.requestDevice().catch(() => null);

	if (!device) return undefined;

	const format = gpu.getPreferredCanvasFormat();
	const module = device.createShaderModule({ code: wgsl });
	// Validate the pipeline before claiming the canvas, so WebGL can still take it if this fails.
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

	context.configure({ device, format, alphaMode: transparent ? "premultiplied" : "opaque" });

	const buffer = device.createBuffer({
		size: UNIFORM_FLOATS * 4,
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
	const options = {
		alpha: transparent,
		antialias: false,
		powerPreference: "low-power",
		premultipliedAlpha: true,
	} as const;
	const context = (surface.getContext("webgl2", options) ?? surface.getContext("webgl", options)) as
		| WebGL2RenderingContext
		| WebGLRenderingContext
		| null;

	if (!context) return undefined;

	const gl = context;
	const gl2 = "fenceSync" in gl ? gl : undefined;
	let fence: WebGLSync | null = null;
	const frame = inflight();

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
		cost: () => 0,
		destroy() {
			gl.getExtension("WEBGL_lose_context")?.loseContext();
		},
	};
}

// Gecko draws WebGPU canvases ~6x slower than WebGL (Zen 1.24, M4 Pro).
const GECKO = /\bGecko\/\d/;

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
