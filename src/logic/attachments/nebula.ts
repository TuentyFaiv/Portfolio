import type { Attachment } from "svelte/attachments";
import type { NebulaInput, NebulaOutput, NebulaSetup } from "#lib/nebula/renderer.ts";

import { createNebula } from "#lib/nebula/renderer.ts";
import { routeTransition } from "#utils/transition.ts";

type Scene = NonNullable<NebulaSetup["scene"]>;

/**
 * Feeds the page's pointer, scroll, theme and preferences to the nebula, which draws on
 * its own thread wherever the browser can hand a canvas to a worker, and on the page
 * otherwise. The CSS sky underneath stays until the first frame is ready.
 *
 * The sky fills the screen behind /story. The band is a strip across the Contact slide:
 * it starts only once the slide comes near, and draws only while it is on screen.
 */
export const nebula =
	(scene: Scene = "sky"): Attachment<HTMLCanvasElement> =>
	(canvas) => {
		const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
			?.saveData;

		const forced = new URLSearchParams(window.location.search).get("nebula");

		// The visitor saves data (or a test asks for no GPU): the plain CSS sky stays.
		if (saveData || forced === "none") {
			canvas.dataset.fallback = "disabled";
			return;
		}

		let cleanup: (() => void) | undefined;
		let cancelled = false;

		let near: IntersectionObserver | undefined;

		// Never inside a route crossfade: WebKit can stall capturing a canvas mid-handover.
		routeTransition.finished.then(() => {
			if (cancelled) return;
			if (scene === "sky") {
				cleanup = start(canvas, scene);
				return;
			}

			// The band waits until its slide is about a screen away: the home page loads
			// without compiling a shader it may never show.
			near = new IntersectionObserver(
				([entry]) => {
					if (!entry?.isIntersecting) return;
					near?.disconnect();
					cleanup = start(canvas, scene);
				},
				{ rootMargin: "100% 0px" }
			);
			near.observe(canvas);
		});

		return () => {
			cancelled = true;
			near?.disconnect();
			cleanup?.();
		};
	};

function start(canvas: HTMLCanvasElement, scene: Scene) {
	const band = scene === "band";
	const root = document.documentElement;
	const forced = new URLSearchParams(window.location.search).get("nebula");
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
	// The band does not fly through the clouds as the page scrolls; the sky does.
	const depth = () => (band ? 0 : window.scrollY / window.innerHeight);
	// Where the band's text sits, from the slide's CSS: no cloud may show there.
	const clear = () => {
		const style = getComputedStyle(canvas);

		return {
			top: Number.parseFloat(style.getPropertyValue("--nebula-clear-top")) || 0,
			bottom: Number.parseFloat(style.getPropertyValue("--nebula-clear-bottom")) || 0,
		};
	};
	const setup: NebulaSetup = {
		width: canvas.clientWidth,
		height: canvas.clientHeight,
		ratio: window.devicePixelRatio,
		dark: root.classList.contains("dark"),
		reduced: reduced.matches,
		depth: depth(),
		scene,
		clear: band ? clear() : undefined,
		// ?nebula=webgpu or ?nebula=webgl forces an API and ?nebula=none no GPU, so tests
		// can compare.
		prefer: forced === "webgpu" || forced === "webgl" ? forced : undefined,
	};

	let send: (message: NebulaInput) => void = () => undefined;
	let stop: () => void = () => undefined;

	const receive = (message: NebulaOutput) => {
		if (message.type === "ready") {
			canvas.dataset.ready = "";
			canvas.dataset.backend = message.backend;
			canvas.dataset.mode = message.mode;
		}
		if (message.type === "fallback") canvas.dataset.fallback = message.reason;
		if (message.type === "lost") delete canvas.dataset.ready;
		if (message.type === "drawn") document.dispatchEvent(new Event("nebula:drawn"));
		if (message.type === "stats") canvas.dataset.stats = JSON.stringify(message);
	};

	if ("transferControlToOffscreen" in canvas && typeof Worker === "function") {
		const worker = new Worker(new URL("../nebula/worker.ts", import.meta.url), { type: "module" });
		const offscreen = canvas.transferControlToOffscreen();

		worker.onmessage = (event: MessageEvent<NebulaOutput>) => receive(event.data);
		worker.postMessage({ type: "start", canvas: offscreen, setup }, [offscreen]);
		send = (message) => worker.postMessage(message);
		stop = () => {
			worker.postMessage({ type: "stop" });
			worker.terminate();
		};
	} else {
		const local = createNebula(canvas, setup, receive);

		send = local.send;
		stop = local.stop;
	}

	const resize = new ResizeObserver(() => {
		send({
			type: "resize",
			width: canvas.clientWidth,
			height: canvas.clientHeight,
			ratio: window.devicePixelRatio,
			clear: band ? clear() : undefined,
		});
	});
	const theme = new MutationObserver(() => {
		send({
			type: "theme",
			dark: root.classList.contains("dark"),
			instant: root.classList.contains("theme-transition"),
		});
	});
	// The sky fills the screen from its top left corner; the band starts wherever its slide is.
	const origin = () => (band ? canvas.getBoundingClientRect() : { left: 0, top: 0 });
	const onPointer = (event: PointerEvent) => {
		// A finger only parts the clouds while it is down.
		const touching = event.pointerType !== "touch" || event.buttons > 0;
		const { left, top } = origin();

		send({ type: "pointer", x: event.clientX - left, y: event.clientY - top, touching });
	};
	const onLeave = () => send({ type: "leave" });
	const onPress = (event: PointerEvent) => {
		const { left, top } = origin();

		send({ type: "press", x: event.clientX - left, y: event.clientY - top });
	};
	const onScroll = () => send({ type: "scroll", depth: depth() });
	// Drawn only while the tab is open and, for the band, while its slide is on screen.
	let onScreen = true;
	const onVisible = () => send({ type: "visible", value: onScreen && !document.hidden });
	const seen = new IntersectionObserver(([entry]) => {
		onScreen = entry?.isIntersecting ?? true;
		onVisible();
	});
	const onReduced = () => send({ type: "reduced", value: reduced.matches });
	const onStats = () => send({ type: "stats" });
	// Leaving: stop drawing, and step aside so the route crossfade captures the CSS sky
	// instead of a canvas a worker owns (WebKit can stall on that).
	const onPause = () => {
		canvas.dataset.leaving = "";
		send({ type: "visible", value: false });
	};

	resize.observe(canvas);
	theme.observe(root, { attributeFilter: ["class"] });
	window.addEventListener("pointermove", onPointer, { passive: true });
	window.addEventListener("pointerdown", onPress, { passive: true });
	root.addEventListener("pointerleave", onLeave);
	if (band) seen.observe(canvas);
	else window.addEventListener("scroll", onScroll, { passive: true });
	document.addEventListener("visibilitychange", onVisible);
	reduced.addEventListener("change", onReduced);
	canvas.addEventListener("nebula:stats", onStats);
	canvas.addEventListener("nebula:pause", onPause);

	return () => {
		resize.disconnect();
		theme.disconnect();
		seen.disconnect();
		window.removeEventListener("pointermove", onPointer);
		window.removeEventListener("pointerdown", onPress);
		root.removeEventListener("pointerleave", onLeave);
		window.removeEventListener("scroll", onScroll);
		document.removeEventListener("visibilitychange", onVisible);
		reduced.removeEventListener("change", onReduced);
		canvas.removeEventListener("nebula:stats", onStats);
		canvas.removeEventListener("nebula:pause", onPause);
		stop();
	};
}
