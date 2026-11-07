import { prefersReducedMotion } from "svelte/motion";

import type { Attachment } from "svelte/attachments";
import type { Box, Layout, Point, View } from "#lib/projects/chart.ts";

import {
	bounds,
	clamp,
	easeInOut,
	focusOf,
	homeLeg,
	homeward,
	legs,
	lerp,
	nearness,
	placeOf,
	pointIn,
	presence,
	project,
	starOn,
	trail,
	unproject,
	view,
} from "#lib/projects/chart.ts";

const DRIFT = { x: 14, y: 10 };
const FLIGHT = 1700;

export const starChart =
	(
		points: readonly Point[],
		sizes: readonly number[],
		lands: readonly Point[],
		departure: Point,
		arrival: Point
	): Attachment<HTMLElement> =>
	(journey) => {
		const track = journey.querySelector<HTMLElement>("[data-chart-track]");
		const chart = journey.querySelector<HTMLElement>("[data-chart]");

		if (!track || !chart) return;

		const places = [...chart.querySelectorAll<HTMLElement>("[data-place]")];
		const stops = [...track.querySelectorAll<HTMLElement>(".stop")];
		const route = chart.querySelector<SVGSVGElement>("[data-route]");
		const roads = [...chart.querySelectorAll<SVGPathElement>("[data-road]")];
		const trails = [...chart.querySelectorAll<SVGPathElement>("[data-trail]")];
		const home = chart.querySelector<SVGPathElement>("[data-home-road]");
		const homeTrail = chart.querySelector<SVGPathElement>("[data-home-trail]");

		let layout: Layout | undefined;
		let reached = 0;
		let homeLit = 0;
		let flight: { start: number; landed: boolean } | undefined;
		let flying = 0;
		const drift = { x: 0, y: 0, toX: 0, toY: 0 };
		let frame = 0;

		const within = (stop: Element | undefined, selector: string): Box | undefined => {
			const element = stop?.querySelector(selector);

			if (!stop || !element) return undefined;

			const outer = stop.getBoundingClientRect();
			const inner = element.getBoundingClientRect();

			return {
				x: inner.left - outer.left,
				y: inner.top - outer.top,
				w: inner.width,
				h: inner.height,
			};
		};

		const measure = () => {
			const area = within(stops[0], "[data-area]");
			const focus = points.map((_, index) => within(stops[index + 1], "[data-focus]"));
			const unit = focus[0]?.w ?? 0;

			if (!area || unit < 1 || focus.some((box) => !box)) return;

			layout = { unit, area, focus: focus as Box[], points, sizes };

			if (route) {
				const whole = bounds(layout);

				route.setAttribute(
					"viewBox",
					[whole.x, whole.y, whole.w, whole.h].map((value) => value / unit).join(" ")
				);
			}

			apply();
			chart.dataset.ready = "";
		};

		const progress = () => track.scrollLeft / Math.max(track.clientWidth, 1);

		const place = (element: Element, [x, y]: Point, w: number, h: number) => {
			const style = (element as HTMLElement | SVGElement).style;

			style.width = `${w}px`;
			style.height = `${h}px`;
			style.translate = `${x + drift.x}px ${y + drift.y}px`;
		};

		const apply = () => {
			if (!layout) return;

			const p = progress();
			const last = points.length;
			const t = flight ? easeInOut(clamp((performance.now() - flight.start) / FLIGHT)) : 0;
			const shot: View = flight ? homeward(t, layout) : view(p, layout);
			const focus = (index: number) => {
				if (!flight) return focusOf(p, index);
				if (index === last - 1) return clamp(1 - t * 1.6);

				return index === 0 ? clamp(1 - (1 - t) * 1.6) : 0;
			};
			const seen = (index: number) =>
				flight ? lerp(presence(last, index), presence(1, index), t) : presence(p, index);
			const near = (stop: number) => {
				if (!flight) return nearness(p, stop);
				if (stop === last) return clamp(1 - t * 2.2);

				return stop === 1 ? clamp(1 - (1 - t) * 2.2) : 0;
			};
			const { unit } = layout;

			if (flight) homeLit = Math.max(homeLit, t);
			else reached = Math.max(reached, p);

			const boxes = places.map((element, index) => {
				const box = placeOf(p, index, layout as Layout, shot, focus(index));

				place(element, [box.x, box.y], box.w, box.h);
				element.style.setProperty("--focus", focus(index).toFixed(3));
				element.style.opacity = seen(index).toFixed(3);

				return box;
			});

			if (route) {
				const whole = bounds(layout);
				const corner = project([whole.x / unit, whole.y / unit], shot, unit);

				place(route, corner, whole.w * shot.zoom, whole.h * shot.zoom);
				// Attributes, not CSS: Gecko ignores calc() numbers in stroke-width.
				const pixel = 1 / (unit * shot.zoom);

				for (const road of roads) road.setAttribute("stroke-width", (1.5 * pixel).toFixed(5));
				for (const path of trails) path.setAttribute("stroke-width", (2 * pixel).toFixed(5));
				home?.setAttribute("stroke-width", (1.5 * pixel).toFixed(5));
				homeTrail?.setAttribute("stroke-width", (2 * pixel).toFixed(5));

				const star = (index: number, at: Point | undefined) => {
					const box = boxes[index];

					return box && at ? unproject(starOn(box, at), shot, unit) : (points[index] ?? [0, 0]);
				};
				const anchors = points.map((_, index) => star(index, lands[index]));

				legs(anchors).forEach((d, leg) => {
					roads[leg]?.setAttribute("d", d);
					trails[leg]?.setAttribute("d", d);
				});

				const first = boxes[0];
				const way = homeLeg(
					star(last - 1, departure),
					first ? unproject(pointIn(first, arrival), shot, unit) : (points[0] ?? [0, 0])
				);

				home?.setAttribute("d", way);
				homeTrail?.setAttribute("d", way);
			}

			const from = Math.min(Math.max(Math.floor(p), 1), last);
			const to = Math.min(from + 1, last);
			const bottom = (stop: number) => {
				const box = layout?.focus[stop - 1];

				return box ? box.y + box.h : 0;
			};
			const between = Math.min(Math.max(p - from, 0), 1);
			const veilY = flight
				? lerp(bottom(last), bottom(1), t)
				: bottom(from) + (bottom(to) - bottom(from)) * between;

			chart.style.setProperty("--veil", Math.min(Math.max(p * 2, flight ? 1 : 0), 1).toFixed(3));
			chart.style.setProperty("--veil-y", `${veilY.toFixed(1)}px`);

			stops.forEach((stop, index) => {
				stop.style.setProperty("--near", near(index).toFixed(3));
			});

			trails.forEach((path, leg) => {
				path.setAttribute("stroke-dashoffset", (1 - trail(reached, leg)).toFixed(4));
			});
			homeTrail?.setAttribute("stroke-dashoffset", (1 - homeLit).toFixed(4));

			const scale = (unit / Math.max(window.innerHeight, 1)) * 0.5;

			journey.dataset.nebulaPanX = (shot.at[0] * scale).toFixed(4);
			journey.dataset.nebulaPanY = (-shot.at[1] * scale).toFixed(4);
			journey.dispatchEvent(new Event("nebula:pan"));
		};

		const toFirst = () =>
			track.scrollTo({ left: track.clientWidth, behavior: "instant" as ScrollBehavior });

		const fly = () => {
			if (!flight) return;

			const t = (performance.now() - flight.start) / FLIGHT;

			if (t >= 0.5 && !flight.landed) {
				flight.landed = true;
				toFirst();
			}
			if (t >= 1) {
				flight = undefined;
				flying = 0;
				delete journey.dataset.flying;
				apply();
				return;
			}
			apply();
			flying = requestAnimationFrame(fly);
		};
		const onLoop = () => {
			if (flight) return;
			if (!layout || prefersReducedMotion.current) {
				homeLit = 1;
				toFirst();
				return;
			}
			flight = { start: performance.now(), landed: false };
			journey.dataset.flying = "";
			flying = requestAnimationFrame(fly);
		};

		const settle = () => {
			drift.x += (drift.toX - drift.x) * 0.08;
			drift.y += (drift.toY - drift.y) * 0.08;
			apply();
			frame =
				Math.abs(drift.toX - drift.x) + Math.abs(drift.toY - drift.y) > 0.05
					? requestAnimationFrame(settle)
					: 0;
		};
		const onPointer = (event: PointerEvent) => {
			if (event.pointerType !== "mouse" || prefersReducedMotion.current) return;

			const { left, top, width, height } = journey.getBoundingClientRect();

			drift.toX = -((event.clientX - left) / Math.max(width, 1) - 0.5) * 2 * DRIFT.x;
			drift.toY = -((event.clientY - top) / Math.max(height, 1) - 0.5) * 2 * DRIFT.y;
			if (!frame) frame = requestAnimationFrame(settle);
		};
		const onLeave = () => {
			drift.toX = 0;
			drift.toY = 0;
			if (!frame) frame = requestAnimationFrame(settle);
		};

		const resize = new ResizeObserver(measure);

		resize.observe(journey);
		for (const element of track.querySelectorAll(".stop > *")) resize.observe(element);
		track.addEventListener("scroll", apply, { passive: true });
		journey.addEventListener("pointermove", onPointer, { passive: true });
		journey.addEventListener("pointerleave", onLeave);
		journey.addEventListener("chart:loop", onLoop);

		return () => {
			resize.disconnect();
			cancelAnimationFrame(frame);
			cancelAnimationFrame(flying);
			journey.removeEventListener("chart:loop", onLoop);
			track.removeEventListener("scroll", apply);
			journey.removeEventListener("pointermove", onPointer);
			journey.removeEventListener("pointerleave", onLeave);
		};
	};
