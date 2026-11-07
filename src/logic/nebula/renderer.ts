import type { Backend } from "./backends.ts";

import { pickBackend } from "./backends.ts";
import { UNIFORM_FLOATS } from "./shaders.ts";

export interface NebulaSetup {
	width: number;
	height: number;
	ratio: number;
	dark: boolean;
	reduced: boolean;
	depth: number;
	pan?: number;
	rise?: number;
	scene?: "sky" | "band" | "slide";
	clear?: { top: number; bottom: number };
	prefer?: "webgpu" | "webgl";
}

export type NebulaInput =
	| {
			type: "resize";
			width: number;
			height: number;
			ratio: number;
			clear?: { top: number; bottom: number };
	  }
	| { type: "pointer"; x: number; y: number; touching: boolean }
	| { type: "leave" }
	| { type: "press"; x: number; y: number }
	| { type: "scroll"; depth: number; pan?: number; rise?: number }
	| { type: "theme"; dark: boolean; instant: boolean }
	| { type: "reduced"; value: boolean }
	| { type: "visible"; value: boolean }
	| { type: "stats" };

export type NebulaOutput =
	| { type: "ready"; backend: Backend["name"]; mode: "live" | "still" }
	| { type: "fallback"; reason: string }
	| { type: "lost" }
	| { type: "drawn" }
	| {
			type: "stats";
			draws: number;
			presence: number;
			ripple: number[];
			theme: number;
			scale: number;
			cost: number;
			skipped: number;
			pan: number;
			rise: number;
			backend: Backend["name"];
	  };

type Surface = HTMLCanvasElement | OffscreenCanvas;
type Frame = (callback: (now: number) => void) => number;

// Idle drift at 30 fps, motion at 60: 120 Hz doubles GPU work with no visible gain.
const IDLE_FRAME = 1000 / 30;
const MOVING_FRAME = 1000 / 60;
const SLACK = 3;
const EASE_FRAME = 1000 / 30;
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.25;
const MIN_QUALITY = 0.4;
const SLOW_FRAME = 34;
const FAST_FRAME = 20;
const SLOW_GPU = 8;
// Step up only when the bigger frame still fits with headroom, so quality never oscillates.
const STEP_DOWN = 0.8;
const STEP_UP = 1.15;
const ROOM = 0.75;
// Shader compile and page load make the first frames slow; don't judge them.
const SETTLE = 60;

export function createNebula(
	surface: Surface,
	setup: NebulaSetup,
	notify: (message: NebulaOutput) => void
) {
	let backend: Backend | undefined;
	const queue: NebulaInput[] = [];
	const values = new Float32Array(UNIFORM_FLOATS);
	const frame: Frame =
		typeof requestAnimationFrame === "function"
			? requestAnimationFrame.bind(globalThis)
			: (callback) => setTimeout(() => callback(performance.now()), 16) as unknown as number;
	const cancel =
		typeof cancelAnimationFrame === "function"
			? cancelAnimationFrame.bind(globalThis)
			: clearTimeout;

	const state = {
		...setup,
		visible: true,
		ready: false,
		still: false,
		px: 0,
		py: 0,
		targetX: 0,
		targetY: 0,
		cursorX: -9999,
		cursorY: -9999,
		touching: false,
		presence: 0,
		theme: setup.dark ? 1 : 0,
		depthEased: setup.depth,
		pan: setup.pan ?? 0,
		panEased: setup.pan ?? 0,
		rise: setup.rise ?? 0,
		riseEased: setup.rise ?? 0,
		quality: 1,
		slow: 0,
		fast: 0,
		skipped: 0,
		gpu: 0,
		settle: SETTLE,
		refit: false,
		drops: 0,
		draws: 0,
		elapsed: 0,
		last: 0,
		previous: 0,
		handle: 0,
		ripple: 0,
	};
	const ripples = new Float32Array([0, 0, -99, 0, 0, -99, 0, 0, -99]);

	function scale() {
		return Math.max(MIN_SCALE, Math.min(state.ratio, MAX_SCALE) * state.quality);
	}

	const ease = (rate: number, dt: number) => 1 - (1 - rate) ** (dt / EASE_FRAME);

	function moving() {
		const ripple = [2, 5, 8].some((index) => state.elapsed / 1000 - (ripples[index] ?? -99) < 2.4);

		return (
			Math.abs(state.depth - state.depthEased) > 0.0005 ||
			Math.abs(state.pan - state.panEased) > 0.0005 ||
			Math.abs(state.rise - state.riseEased) > 0.0005 ||
			Math.abs(state.targetX - state.px) > 0.0005 ||
			Math.abs(state.targetY - state.py) > 0.0005 ||
			Math.abs((state.touching ? 1 : 0) - state.presence) > 0.005 ||
			Math.abs((state.dark ? 1 : 0) - state.theme) > 0.002 ||
			ripple
		);
	}

	function draw(dt = EASE_FRAME) {
		if (!backend || !state.ready) return;

		state.px += (state.targetX - state.px) * ease(0.04, dt);
		state.py += (state.targetY - state.py) * ease(0.04, dt);
		state.depthEased += (state.depth - state.depthEased) * ease(0.1, dt);
		state.panEased += (state.pan - state.panEased) * ease(0.1, dt);
		state.riseEased += (state.rise - state.riseEased) * ease(0.1, dt);
		state.presence += ((state.touching ? 1 : 0) - state.presence) * ease(0.08, dt);
		state.theme += ((state.dark ? 1 : 0) - state.theme) * (state.reduced ? 1 : ease(0.12, dt));

		const width = Math.max(state.width, 1);
		const height = Math.max(state.height, 1);

		values.set(
			[
				surface.width,
				surface.height,
				surface.width / width,
				Math.min(1, width / height),
				state.elapsed / 1000,
				state.depthEased,
				state.theme,
				state.presence,
				state.px,
				state.py,
				state.cursorX / width,
				state.cursorY / height,
			],
			0
		);
		for (let index = 0; index < 3; index += 1) {
			values.set(
				[ripples[index * 3] ?? 0, ripples[index * 3 + 1] ?? 0, ripples[index * 3 + 2] ?? -99, 0],
				12 + index * 4
			);
		}
		values[15] = state.scene === "band" ? 1 : 0;
		values[19] = state.scene === "band" ? (state.clear?.top ?? 0) : state.panEased;
		values[23] = state.scene === "band" ? (state.clear?.bottom ?? 0) : state.riseEased;
		backend.draw(values);
		state.draws += 1;
	}

	function fit() {
		const factor = scale();

		state.settle = SETTLE;
		state.gpu = 0;
		state.slow = 0;
		state.fast = 0;

		backend?.resize(
			Math.max(1, Math.round(state.width * factor)),
			Math.max(1, Math.round(state.height * factor))
		);
		draw();
	}

	function adapt(gap: number, busy: boolean) {
		if (state.settle > 0) {
			state.settle -= 1;
			return;
		}

		const cost = backend?.cost() ?? 0;
		const timed = cost > 0;

		if (timed) state.gpu = state.gpu ? state.gpu * 0.9 + cost * 0.1 : cost;

		const late = busy || (timed ? state.gpu > SLOW_GPU : gap > SLOW_FRAME);
		const roomy = timed ? state.gpu * STEP_UP ** 2 < SLOW_GPU * ROOM : gap < FAST_FRAME;

		if (late) {
			state.fast = 0;
			state.slow += 1;
		} else if (roomy) {
			state.fast += 1;
			if (state.fast > 60) state.slow = 0;
		} else {
			state.fast = 0;
		}

		if (state.slow >= 6 && state.quality > MIN_QUALITY) {
			state.quality = Math.max(MIN_QUALITY, state.quality * STEP_DOWN);
			state.drops += 1;
			state.refit = false;
			fit();
			return;
		}

		const calm = timed ? 120 : 300 * 2 ** state.drops;

		if (state.fast >= calm && state.quality < 1) {
			state.quality = Math.min(1, state.quality * STEP_UP);
			state.fast = 0;
			state.refit = true;
		}
	}

	function loop(now: number) {
		state.handle = frame(loop);

		const gap = state.previous ? now - state.previous : 0;

		state.previous = now;

		if (state.refit && !moving()) {
			state.refit = false;
			fit();
		}

		const interval = moving() ? MOVING_FRAME : IDLE_FRAME;

		if (now - state.last < interval - SLACK) return;

		const busy = backend?.busy() ?? false;

		adapt(gap, busy);
		if (busy) {
			state.skipped += 1;
			return;
		}

		const dt = Math.min(now - state.last, 100);

		state.elapsed += dt;
		state.last = now;
		draw(dt);
	}

	function start() {
		cancel(state.handle);

		if (state.reduced || !state.visible || state.still) return draw();

		state.last = performance.now();
		state.previous = 0;
		state.handle = frame(loop);
	}

	const handlers: {
		[Type in NebulaInput["type"]]: (
			message: Extract<NebulaInput, { type: Type }>,
			active: Backend
		) => void;
	} = {
		resize: (message) => {
			state.width = message.width;
			state.height = message.height;
			state.ratio = message.ratio;
			if (message.clear) state.clear = message.clear;
			fit();
		},
		pointer: (message) => {
			if (state.reduced) return;
			state.targetX = message.x / Math.max(state.width, 1) - 0.5;
			state.targetY = 0.5 - message.y / Math.max(state.height, 1);
			state.cursorX = message.x;
			state.cursorY = message.y;
			state.touching = message.touching;
		},
		leave: () => {
			state.touching = false;
		},
		press: (message) => {
			if (state.reduced) return;
			ripples.set(
				[
					message.x / Math.max(state.width, 1),
					message.y / Math.max(state.height, 1),
					state.elapsed / 1000,
				],
				state.ripple * 3
			);
			state.ripple = (state.ripple + 1) % 3;
		},
		scroll: (message) => {
			state.depth = message.depth;
			state.pan = message.pan ?? 0;
			state.rise = message.rise ?? 0;
			if (state.reduced || state.still) {
				state.depthEased = message.depth;
				state.panEased = state.pan;
				state.riseEased = state.rise;
				draw();
			}
		},
		theme: (message) => {
			state.dark = message.dark;
			// Inside a view transition the next snapshot must already show the new colors.
			if (message.instant || state.reduced) state.theme = message.dark ? 1 : 0;
			draw();
			notify({ type: "drawn" });
		},
		reduced: (message) => {
			state.reduced = message.value;
			if (state.reduced) state.presence = 0;
			start();
		},
		visible: (message) => {
			state.visible = message.value;
			start();
		},
		stats: (_message, active) => {
			notify({
				type: "stats",
				draws: state.draws,
				presence: state.presence,
				ripple: Array.from(ripples.slice(0, 3)),
				theme: state.theme,
				scale: scale(),
				cost: active.cost(),
				skipped: state.skipped,
				pan: state.panEased,
				rise: state.riseEased,
				backend: active.name,
			});
		},
	};

	function send(message: NebulaInput) {
		if (!backend) {
			queue.push(message);
			return;
		}
		(handlers[message.type] as (message: NebulaInput, active: Backend) => void)(message, backend);
	}

	const onLost = (event: Event) => {
		event.preventDefault();
		cancel(state.handle);
		notify({ type: "lost" });
	};

	surface.addEventListener("webglcontextlost", onLost);

	pickBackend(surface, setup.prefer, setup.scene === "band").then((picked) => {
		if (!picked) return notify({ type: "fallback", reason: "no-gpu" });

		backend = picked;
		state.still = picked.software;
		state.ready = true;
		fit();
		notify({ type: "ready", backend: picked.name, mode: picked.software ? "still" : "live" });
		for (const message of queue.splice(0)) send(message);
		start();
	});

	return {
		send,
		stop() {
			surface.removeEventListener("webglcontextlost", onLost);
			cancel(state.handle);
			backend?.destroy();
		},
	};
}
