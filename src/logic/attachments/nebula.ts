import type { Attachment } from "svelte/attachments";
import type { NebulaInput, NebulaOutput, NebulaSetup } from "#lib/nebula/renderer.ts";

import { createNebula } from "#lib/nebula/renderer.ts";
import { routeTransition } from "#utils/transition.ts";

/**
 * Feeds the page's pointer, scroll, theme and preferences to the nebula, which draws on
 * its own thread wherever the browser can hand a canvas to a worker, and on the page
 * otherwise. The CSS sky underneath stays until the first frame is ready.
 */
export const nebula: Attachment<HTMLCanvasElement> = (canvas) => {
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

	// Never inside a route crossfade: WebKit can stall capturing a canvas mid-handover.
	routeTransition.finished.then(() => {
		if (!cancelled) cleanup = start(canvas);
	});

	return () => {
		cancelled = true;
		cleanup?.();
	};
};

function start(canvas: HTMLCanvasElement) {
	const root = document.documentElement;
	const forced = new URLSearchParams(window.location.search).get("nebula");
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
	const depth = () => window.scrollY / window.innerHeight;
	const setup: NebulaSetup = {
		width: canvas.clientWidth,
		height: canvas.clientHeight,
		ratio: window.devicePixelRatio,
		dark: root.classList.contains("dark"),
		reduced: reduced.matches,
		depth: depth(),
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
		});
	});
	const theme = new MutationObserver(() => {
		send({
			type: "theme",
			dark: root.classList.contains("dark"),
			instant: root.classList.contains("theme-transition"),
		});
	});
	const onPointer = (event: PointerEvent) => {
		// A finger only parts the clouds while it is down.
		const touching = event.pointerType !== "touch" || event.buttons > 0;

		send({ type: "pointer", x: event.clientX, y: event.clientY, touching });
	};
	const onLeave = () => send({ type: "leave" });
	const onPress = (event: PointerEvent) =>
		send({ type: "press", x: event.clientX, y: event.clientY });
	const onScroll = () => send({ type: "scroll", depth: depth() });
	const onVisible = () => send({ type: "visible", value: !document.hidden });
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
	window.addEventListener("scroll", onScroll, { passive: true });
	document.addEventListener("visibilitychange", onVisible);
	reduced.addEventListener("change", onReduced);
	canvas.addEventListener("nebula:stats", onStats);
	canvas.addEventListener("nebula:pause", onPause);

	return () => {
		resize.disconnect();
		theme.disconnect();
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
