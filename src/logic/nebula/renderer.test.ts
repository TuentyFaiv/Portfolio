import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Backend } from "./backends.ts";
import type { NebulaOutput } from "./renderer.ts";

const gpu = vi.hoisted(() => ({ busy: false, cost: 0, sizes: [] as number[][] }));

vi.mock("./backends.ts", () => ({
	pickBackend: async (): Promise<Backend> => ({
		name: "webgpu",
		software: false,
		resize: (width, height) => gpu.sizes.push([width, height]),
		draw: () => undefined,
		busy: () => gpu.busy,
		cost: () => gpu.cost,
		destroy: () => undefined,
	}),
}));

const { createNebula } = await import("./renderer.ts");

const REFRESH = 1000 / 120;
let clock = 0;
let callbacks: ((now: number) => void)[] = [];

function tick(count: number, each?: (index: number) => void) {
	for (let index = 0; index < count; index += 1) {
		each?.(index);
		clock += REFRESH;
		for (const callback of callbacks.splice(0)) callback(clock);
	}
}

async function open() {
	const messages: NebulaOutput[] = [];
	const surface = {
		width: 0,
		height: 0,
		addEventListener: () => undefined,
		removeEventListener: () => undefined,
	} as unknown as OffscreenCanvas;
	const nebula = createNebula(
		surface,
		{ width: 1728, height: 1117, ratio: 2, dark: true, reduced: false, depth: 0 },
		(message) => messages.push(message)
	);

	await vi.waitFor(() => expect(messages.some((message) => message.type === "ready")).toBe(true));

	const stats = () => {
		nebula.send({ type: "stats" });
		return messages.filter((message) => message.type === "stats").at(-1) as Extract<
			NebulaOutput,
			{ type: "stats" }
		>;
	};
	const wiggle = (index: number) =>
		nebula.send({ type: "pointer", x: 400 + (index % 40) * 20, y: 500, touching: true });

	return { nebula, stats, wiggle };
}

describe("nebula render loop", () => {
	beforeEach(() => {
		clock = 0;
		callbacks = [];
		gpu.busy = false;
		gpu.cost = 2;
		gpu.sizes = [];
		vi.spyOn(performance, "now").mockImplementation(() => clock);
		vi.stubGlobal("requestAnimationFrame", (callback: (now: number) => void) => {
			callbacks.push(callback);
			return callbacks.length;
		});
		vi.stubGlobal("cancelAnimationFrame", () => undefined);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("draws at most 60 frames a second on a 120 Hz screen, even while moving", async () => {
		const { nebula, stats, wiggle } = await open();
		const before = stats().draws;

		tick(240, wiggle);

		expect(stats().draws - before).toBeGreaterThanOrEqual(110);
		expect(stats().draws - before).toBeLessThanOrEqual(122);
		nebula.stop();
	});

	it("never queues a frame while the GPU is still on the last one", async () => {
		const { nebula, stats, wiggle } = await open();
		const before = stats();

		gpu.busy = true;
		tick(120, wiggle);

		expect(stats().draws - before.draws).toBeLessThanOrEqual(1 + gpu.sizes.length);
		expect(stats().skipped).toBeGreaterThan(50);
		nebula.stop();
	});

	it("lowers the resolution at once when the GPU falls behind, even mid-scroll", async () => {
		const { nebula, stats, wiggle } = await open();
		const full = stats().scale;

		gpu.cost = 20;
		tick(200, wiggle);

		expect(stats().scale).toBeLessThan(full);
		expect(gpu.sizes.at(-1)?.[0]).toBeLessThan(gpu.sizes[0]?.[0] ?? 0);
		nebula.stop();
	});

	it("raises it again only once nothing moves", async () => {
		const { nebula, stats, wiggle } = await open();

		gpu.cost = 20;
		tick(200, wiggle);
		const lowered = stats().scale;

		gpu.cost = 2;
		const resizes = gpu.sizes.length;
		tick(1600, wiggle);
		expect(gpu.sizes.length).toBe(resizes);

		tick(1200);
		expect(stats().scale).toBeGreaterThan(lowered);
		nebula.stop();
	});

	it("ignores the slow first frames after loading", async () => {
		const { nebula, stats, wiggle } = await open();
		const full = stats().scale;

		gpu.cost = 40;
		tick(40, wiggle);
		gpu.cost = 4;
		tick(600, wiggle);

		expect(stats().scale).toBe(full);
		nebula.stop();
	});

	it("shrugs off one slow frame now and then", async () => {
		const { nebula, stats, wiggle } = await open();
		const full = stats().scale;

		tick(3000, (index) => {
			gpu.cost = index % 120 === 0 ? 30 : 4;
			wiggle(index);
		});

		expect(stats().scale).toBe(full);
		nebula.stop();
	});

	it("climbs back to full quality when the GPU has room again", async () => {
		const { nebula, stats, wiggle } = await open();
		const full = stats().scale;

		gpu.cost = 20;
		tick(400, wiggle);
		expect(stats().scale).toBeLessThan(full);

		gpu.cost = 3;
		tick(4000);

		expect(stats().scale).toBe(full);
		nebula.stop();
	});
});
