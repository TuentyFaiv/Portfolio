import type { Backend } from "./backends.ts";

import { pickBackend } from "./backends.ts";
import { UNIFORM_FLOATS } from "./shaders.ts";

/** Everything the renderer needs from the page, sent once at start. */
export interface NebulaSetup {
	width: number;
	height: number;
	ratio: number;
	dark: boolean;
	reduced: boolean;
	depth: number;
	/** How far a slide's sky has travelled sideways, in screen heights. Default: 0. */
	pan?: number;
	/** How far a slide's sky has travelled up (down when negative), in screen heights. */
	rise?: number;
	/**
	 * The sky behind /story, the band across the Contact slide, or the same sky inside one
	 * slide (Projects). Default: sky.
	 */
	scene?: "sky" | "band" | "slide";
	/** Band only: CSS pixels at the top and bottom where text sits and no cloud may show. */
	clear?: { top: number; bottom: number };
	/** Only for tests: draw with WebGL even where WebGPU exists. */
	prefer?: "webgpu" | "webgl";
}

/** Messages from the page: the same shape whether the renderer runs in a worker or not. */
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

/** Messages back to the page. */
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
			/** GPU time of the last frame in ms (0 when the API cannot tell). */
			cost: number;
			/** Frames skipped because the GPU was still on the previous one. */
			skipped: number;
			/** How far the sky has travelled so far (eased), in screen heights. */
			pan: number;
			rise: number;
			backend: Backend["name"];
	  };

type Surface = HTMLCanvasElement | OffscreenCanvas;
type Frame = (callback: (now: number) => void) => number;

/* Idle drift is slow, so 30 frames a second is plenty. Anything that moves gets 60: the
   clouds are soft, and 120 Hz screens would double the GPU work for no visible gain. */
const IDLE_FRAME = 1000 / 30;
const MOVING_FRAME = 1000 / 60;
/* rAF times jitter by a millisecond or two: without slack, 33.3 ms often reads as "too
   early" and the idle rate falls to 20 fps. */
const SLACK = 3;
/* Easing rates are per 30 fps frame and scaled by real time, so they feel the same at
   60 or 120 Hz. */
const EASE_FRAME = 1000 / 30;
/* Resolution adapts to keep each frame inside its budget on any device. */
const MIN_SCALE = 0.5;
/* 1.25x of CSS pixels: soft clouds look the same as at 2x, stars are still crisp, and the
   GPU keeps up with the page scrolling at full rate (1.5x cost dropped frames). */
const MAX_SCALE = 1.25;
const MIN_QUALITY = 0.4;
/* Gaps between animation frames: long ones mean the thread or the page is struggling. */
const SLOW_FRAME = 34;
const FAST_FRAME = 20;
/* GPU time per frame, where the API reports it. The page, the browser and other apps share
   the same GPU, so at 60 fps the nebula keeps under half of it (8 ms of every 16.7). */
const SLOW_GPU = 8;
/* One step up raises quality 15%, so 32% more pixels: it only happens when the bigger
   frame is still predicted to fit with room to spare, so quality never bounces. */
const STEP_DOWN = 0.8;
const STEP_UP = 1.15;
const ROOM = 0.75;
/* After start or a resize the first frames are slow for reasons resolution cannot fix
   (shader compile, page load), so they are not judged. */
const SETTLE = 60;

/**
 * Draws the nebula on a canvas, on whichever thread owns it. Returns `send` for page
 * input and `stop` to release the GPU. Without any GPU API it reports a fallback, and the
 * page keeps its CSS sky.
 */
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
		// Pointer parallax, eased.
		px: 0,
		py: 0,
		targetX: 0,
		targetY: 0,
		// Cursor in CSS pixels, and how present it is (0 to 1, eased).
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
		// GPU time per frame, smoothed so that one spike (another tab, a screenshot) does
		// not count as overload.
		gpu: 0,
		settle: SETTLE,
		// Stepping up waits until nothing moves: resizing mid-scroll flashes. Stepping down
		// never waits, because an overloaded GPU stalls the whole browser.
		refit: false,
		// Without GPU timing (WebGL), each step down doubles the calm needed before
		// stepping back up, so quality settles instead of bouncing on every slide change.
		drops: 0,
		draws: 0,
		elapsed: 0,
		last: 0,
		previous: 0,
		handle: 0,
		ripple: 0,
	};
	// Three ripples: x, y (0..1 of the canvas, y down), start time.
	const ripples = new Float32Array([0, 0, -99, 0, 0, -99, 0, 0, -99]);

	function scale() {
		return Math.max(MIN_SCALE, Math.min(state.ratio, MAX_SCALE) * state.quality);
	}

	/** Eases toward a target at a rate defined per 30 fps frame, whatever the real rate. */
	const ease = (rate: number, dt: number) => 1 - (1 - rate) ** (dt / EASE_FRAME);

	/** True while anything on screen is still settling, so it deserves every frame. */
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
		// Settles in about a second, with the native snap: slower felt like the clouds lagged
		// behind the slides.
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
		// The ripples' spare floats: the scene, then the band's clear rows at the top and
		// bottom, or (any other scene) how far the sky has travelled across and up.
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

	/**
	 * Judges each frame the nebula wants to draw: late when the GPU is still on the last
	 * one or takes too long per frame, or, where the API cannot time the GPU, when the
	 * thread itself lags.
	 */
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
			// Hitches count until a stretch of smooth frames passes without one.
			if (state.fast > 60) state.slow = 0;
		} else {
			state.fast = 0;
		}

		// Six late frames within a stretch of smooth ones is enough to step down, at once.
		if (state.slow >= 6 && state.quality > MIN_QUALITY) {
			state.quality = Math.max(MIN_QUALITY, state.quality * STEP_DOWN);
			state.drops += 1;
			state.refit = false;
			fit();
			return;
		}

		// Two seconds with room to spare (measured GPU), or a long calm stretch (WebGL).
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

		// Never queue a frame behind one the GPU has not finished: skip it, and let the
		// resolution come down instead.
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

		// Reduced motion, a hidden tab or a CPU-only renderer: one still frame, redrawn only
		// when the page changes.
		if (state.reduced || !state.visible || state.still) return draw();

		state.last = performance.now();
		state.previous = 0;
		state.handle = frame(loop);
	}

	function send(message: NebulaInput) {
		if (!backend) {
			queue.push(message);
			return;
		}

		switch (message.type) {
			case "resize":
				state.width = message.width;
				state.height = message.height;
				state.ratio = message.ratio;
				if (message.clear) state.clear = message.clear;
				fit();
				break;
			case "pointer":
				if (state.reduced) break;
				state.targetX = message.x / Math.max(state.width, 1) - 0.5;
				state.targetY = 0.5 - message.y / Math.max(state.height, 1);
				state.cursorX = message.x;
				state.cursorY = message.y;
				state.touching = message.touching;
				break;
			case "leave":
				state.touching = false;
				break;
			case "press": {
				if (state.reduced) break;

				ripples.set(
					[
						message.x / Math.max(state.width, 1),
						message.y / Math.max(state.height, 1),
						state.elapsed / 1000,
					],
					state.ripple * 3
				);
				state.ripple = (state.ripple + 1) % 3;
				break;
			}
			case "scroll":
				state.depth = message.depth;
				state.pan = message.pan ?? 0;
				state.rise = message.rise ?? 0;
				if (state.reduced || state.still) {
					state.depthEased = message.depth;
					state.panEased = state.pan;
					state.riseEased = state.rise;
					draw();
				}
				break;
			case "theme":
				state.dark = message.dark;
				// Inside a view transition the next snapshot must already show the new colors.
				if (message.instant || state.reduced) state.theme = message.dark ? 1 : 0;
				draw();
				notify({ type: "drawn" });
				break;
			case "reduced":
				state.reduced = message.value;
				if (state.reduced) state.presence = 0;
				start();
				break;
			case "visible":
				state.visible = message.value;
				start();
				break;
			case "stats":
				notify({
					type: "stats",
					draws: state.draws,
					presence: state.presence,
					ripple: Array.from(ripples.slice(0, 3)),
					theme: state.theme,
					scale: scale(),
					cost: backend.cost(),
					skipped: state.skipped,
					pan: state.panEased,
					rise: state.riseEased,
					backend: backend.name,
				});
				break;
			default:
				break;
		}
	}

	// The GPU can reset (a driver update, too many tabs): stop, and let the page know.
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
