import { afterEach, describe, expect, it, vi } from "vitest";

import { pickBackend } from "./backends.ts";

const FIREFOX =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:159.0) Gecko/20100101 Firefox/159.0";
const CHROME =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36";

function fakeGl() {
	const noop = () => undefined;

	return {
		VERTEX_SHADER: 1,
		FRAGMENT_SHADER: 2,
		LINK_STATUS: 3,
		ARRAY_BUFFER: 4,
		STATIC_DRAW: 5,
		createShader: () => ({}),
		shaderSource: noop,
		compileShader: noop,
		createProgram: () => ({}),
		attachShader: noop,
		linkProgram: noop,
		getProgramParameter: () => true,
		useProgram: noop,
		bindBuffer: noop,
		createBuffer: () => ({}),
		bufferData: noop,
		getAttribLocation: () => 0,
		enableVertexAttribArray: noop,
		vertexAttribPointer: noop,
		getUniformLocation: () => ({}),
		getExtension: () => null,
	};
}

function setup(userAgent: string) {
	const requestAdapter = vi.fn(async () => null);
	const surface = { getContext: vi.fn(() => fakeGl()) } as unknown as OffscreenCanvas;

	vi.stubGlobal("navigator", { userAgent, gpu: { requestAdapter } });

	return { requestAdapter, surface };
}

describe("pickBackend", () => {
	afterEach(() => vi.unstubAllGlobals());

	it("draws with WebGL in Gecko, where WebGPU canvases are far slower", async () => {
		const { requestAdapter, surface } = setup(FIREFOX);

		expect((await pickBackend(surface))?.name).toBe("webgl");
		expect(requestAdapter).not.toHaveBeenCalled();
	});

	it("still tries WebGPU first in Chromium, despite its “like Gecko”", async () => {
		const { requestAdapter, surface } = setup(CHROME);

		await pickBackend(surface);

		expect(requestAdapter).toHaveBeenCalled();
	});

	it("lets a test force WebGPU in Gecko", async () => {
		const { requestAdapter, surface } = setup(FIREFOX);

		await pickBackend(surface, "webgpu");

		expect(requestAdapter).toHaveBeenCalled();
	});
});
