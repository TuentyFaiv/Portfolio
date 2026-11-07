import type { Attachment } from "svelte/attachments";
import type { NebulaInput, NebulaOutput, NebulaSetup } from "#lib/nebula/renderer.ts";

import { createNebula } from "#lib/nebula/renderer.ts";
import { routeTransition } from "#lib/shared/transition.ts";

type Scene = NonNullable<NebulaSetup["scene"]>;

export const nebula =
	(scene: Scene = "sky"): Attachment<HTMLCanvasElement> =>
	(canvas) => {
		const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
			?.saveData;

		const forced = new URLSearchParams(window.location.search).get("nebula");

		if (saveData || forced === "none") {
			canvas.dataset.fallback = "disabled";
			return;
		}

		let cleanup: (() => void) | undefined;
		let cancelled = false;

		let near: IntersectionObserver | undefined;

		// WebKit can stall capturing a canvas mid view transition.
		routeTransition.finished.then(() => {
			if (cancelled) return;
			if (scene === "sky") {
				cleanup = start(canvas, scene);
				return;
			}

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
	const local = scene !== "sky";
	const root = document.documentElement;
	const forced = new URLSearchParams(window.location.search).get("nebula");
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
	const depth = () => (scene === "sky" ? window.scrollY / window.innerHeight : band ? 0 : 1);
	const camera = local
		? canvas.closest(".slide")?.querySelector<HTMLElement>("[data-nebula-pan]")
		: undefined;
	const pan = () => Number(camera?.dataset.nebulaPanX) || 0;
	const rise = () => Number(camera?.dataset.nebulaPanY) || 0;
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
		pan: pan(),
		rise: rise(),
		scene,
		clear: band ? clear() : undefined,
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
		const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
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
	const origin = () => (local ? canvas.getBoundingClientRect() : { left: 0, top: 0 });
	const onPointer = (event: PointerEvent) => {
		const touching = event.pointerType !== "touch" || event.buttons > 0;
		const { left, top } = origin();

		send({ type: "pointer", x: event.clientX - left, y: event.clientY - top, touching });
	};
	const onLeave = () => send({ type: "leave" });
	const onPress = (event: PointerEvent) => {
		const { left, top } = origin();

		send({ type: "press", x: event.clientX - left, y: event.clientY - top });
	};
	const onScroll = () => send({ type: "scroll", depth: depth(), pan: pan(), rise: rise() });
	let onScreen = true;
	const onVisible = () => send({ type: "visible", value: onScreen && !document.hidden });
	const seen = new IntersectionObserver(([entry]) => {
		onScreen = entry?.isIntersecting ?? true;
		onVisible();
	});
	const onReduced = () => send({ type: "reduced", value: reduced.matches });
	const onStats = () => send({ type: "stats" });
	const onPause = () => {
		canvas.dataset.leaving = "";
		send({ type: "visible", value: false });
	};

	resize.observe(canvas);
	theme.observe(root, { attributeFilter: ["class"] });
	window.addEventListener("pointermove", onPointer, { passive: true });
	window.addEventListener("pointerdown", onPress, { passive: true });
	root.addEventListener("pointerleave", onLeave);
	if (local) seen.observe(canvas);
	if (scene === "sky") window.addEventListener("scroll", onScroll, { passive: true });
	camera?.addEventListener("nebula:pan", onScroll);
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
		camera?.removeEventListener("nebula:pan", onScroll);
		document.removeEventListener("visibilitychange", onVisible);
		reduced.removeEventListener("change", onReduced);
		canvas.removeEventListener("nebula:stats", onStats);
		canvas.removeEventListener("nebula:pause", onPause);
		stop();
	};
}
