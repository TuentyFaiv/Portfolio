import type { Attachment } from "svelte/attachments";
import type { Box, Layout, Point, View } from "#utils/chart.ts";

import {
	bounds,
	focusOf,
	homeLeg,
	homeward,
	legs,
	nearness,
	placeOf,
	pointIn,
	presence,
	project,
	starOn,
	trail,
	unproject,
	view,
} from "#utils/chart.ts";

/** How far the chart drifts with the pointer at most, in pixels: a hint of depth. */
const DRIFT = { x: 14, y: 10 };
/** How long the flight home from the last constellation to the first takes, in ms. */
const FLIGHT = 1700;

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Slow out, slow in: the flight home leaves and arrives gently. */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The camera over the star chart (`[data-chart]`), driven by the slide's sideways track
 * (`[data-chart-track]`). Wherever the track is, even halfway through a swipe, the chart
 * shows that point of the journey, so a swipe can be stopped and taken back.
 *
 * The boxes come from the page's own layout: each stop holds an empty `[data-focus]` box
 * where its constellation belongs, and the intro an `[data-area]` box for the whole chart.
 * Each constellation (`[data-place]`) is drawn at its map size times the camera's zoom,
 * and the one you are on grows to fill its stop's box (#utils/chart.ts). Sizes are set
 * directly, never scaled with a transform, so lines, stars and labels stay sharp.
 *
 * The route runs through each constellation's landing star (`lands`, in its drawing's 0 to
 * 100 square), wherever that star is on screen, even while its constellation grows: its
 * legs are drawn again every frame. A way home (`[data-home-road]`) runs from the last
 * constellation's last star (`departure`) back to the first, into its `arrival` point (in
 * the first one's box, which its drawing fills): it closes the loop on the whole map only
 * (projects.css hides it on the stops). A `chart:loop` event on the slide flies the camera
 * home, and the track lands on the first constellation.
 *
 * It also tells the nebula behind where the camera is (`data-nebula-pan-x/-y`, then a
 * `nebula:pan` event), so the clouds travel with it.
 */
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
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

		let layout: Layout | undefined;
		// The farthest the camera has been this visit: the route stays lit up to there.
		let reached = 0;
		// How much of the way home is lit: all of it once the camera has flown it.
		let homeLit = 0;
		// The flight home, while it lasts: when it started, and whether the track has moved.
		let flight: { start: number; landed: boolean } | undefined;
		let flying = 0;
		const drift = { x: 0, y: 0, toX: 0, toY: 0 };
		let frame = 0;

		/** A box inside a stop, from the stop's top left corner (where the slide's is). */
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
			// On the flight home the camera follows the way home, not the track: the last
			// constellation hands the lens to the first, and the words cross over halfway.
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
				// The route is drawn in map units: its widths are set in units too (one pixel is
				// 1 / (unit × zoom)), so its lines stay 1.5 and 2 pixels wide at any zoom. As
				// attributes, not CSS: every engine reads plain numbers there.
				const pixel = 1 / (unit * shot.zoom);

				for (const road of roads) road.setAttribute("stroke-width", (1.5 * pixel).toFixed(5));
				for (const path of trails) path.setAttribute("stroke-width", (2 * pixel).toFixed(5));
				home?.setAttribute("stroke-width", (1.5 * pixel).toFixed(5));
				homeTrail?.setAttribute("stroke-width", (2 * pixel).toFixed(5));

				// Through each landing star where it is now (the one you are on has grown), back
				// on the map: the route meets the star at any point of the journey.
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

			// Past the intro, the chart clears out of the words: their column on wide screens,
			// everything under the constellation's box on phones (where the words sit).
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

			// The clouds slide about half a screen height for every unit the camera travels.
			const scale = (unit / Math.max(window.innerHeight, 1)) * 0.5;

			journey.dataset.nebulaPanX = (shot.at[0] * scale).toFixed(4);
			journey.dataset.nebulaPanY = (-shot.at[1] * scale).toFixed(4);
			journey.dispatchEvent(new Event("nebula:pan"));
		};

		const toFirst = () =>
			track.scrollTo({ left: track.clientWidth, behavior: "instant" as ScrollBehavior });

		// The flight home: the track stays on the last stop for the first half (its words fade
		// out), then lands on the first one (whose words fade in) while the camera arrives.
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
			if (!layout || reduced.matches) {
				homeLit = 1;
				toFirst();
				return;
			}
			flight = { start: performance.now(), landed: false };
			journey.dataset.flying = "";
			flying = requestAnimationFrame(fly);
		};

		// The pointer tilts the whole chart a little, eased; never with reduced motion.
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
			if (event.pointerType !== "mouse" || reduced.matches) return;

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

		// Any change of size moves the boxes: the window, a language's longer words, fonts.
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
