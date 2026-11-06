/*
 * The star chart behind the Projects slide: every constellation sits on one map, joined by
 * a winding route, and a camera glides along that route as the track moves. Pure math, so
 * it can be tested without a page: the slide measures its boxes and draws what this says.
 *
 * Map points are in units of fetchzen's box on its own stop (one unit is that box's width),
 * with y going down. Each constellation also has a size on the map (fetchzen is 1).
 *
 * The camera works like a lens: on a stop, the map shows at LENS zoom, so the neighbours
 * stay small around the current constellation, and only the current one grows to fill
 * its stop's box. Between stops the one you leave shrinks back into the map and the next
 * one grows out of it.
 */

/** A point on the map, in units. */
export type Point = readonly [number, number];

/** A box on the slide, in CSS pixels from its top left corner. */
export interface Box {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface Layout {
	/** How many pixels one map unit is. */
	unit: number;
	/** Where the whole chart fits on the intro (stop 0). */
	area: Box;
	/** Where constellation n sits on its own stop (stop n + 1), and its size. */
	focus: Box[];
	/** Where constellation n sits on the map, in units. */
	points: readonly Point[];
	/** How big constellation n is on the map, against fetchzen (1). Default: 1. */
	sizes?: readonly number[];
}

/** What the camera shows: the map point at the screen point, at a zoom. */
export interface View {
	/** The map point (units) under the camera's screen point. */
	at: Point;
	/** The camera's screen point, in pixels. */
	screen: Point;
	/** How big the map shows: LENS on a stop, less on the intro and between stops. */
	zoom: number;
}

/** The map's zoom on a stop: the neighbours stay this small around the current one. */
export const LENS = 0.6;
/** How far the camera pulls back halfway between two stops, so the way ahead shows. */
export const DIP = 0.24;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const smooth = (t: number) => t * t * (3 - 2 * t);
const center = (box: Box): Point => [box.x + box.w / 2, box.y + box.h / 2];

/**
 * The bezier controls for the route from point i to point i + 1: a Catmull-Rom curve
 * through every point, so the route bends smoothly through each constellation.
 */
function controls(points: readonly Point[], i: number): [Point, Point, Point, Point] {
	const p0 = points[i - 1] ?? points[i] ?? [0, 0];
	const p1 = points[i] ?? [0, 0];
	const p2 = points[i + 1] ?? p1;
	const p3 = points[i + 2] ?? p2;

	return [
		p1,
		[p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
		[p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
		p2,
	];
}

/** Each leg of the route as an SVG path, in map units: leg i runs from point i to i + 1. */
export function legs(points: readonly Point[]): string[] {
	const round = (value: number) => Math.round(value * 1000) / 1000;

	return points.slice(0, -1).map((_, i) => {
		const [a, b, c, d] = controls(points, i);

		return `M${round(a[0])} ${round(a[1])}C${round(b[0])} ${round(b[1])} ${round(c[0])} ${round(c[1])} ${round(d[0])} ${round(d[1])}`;
	});
}

/** The point t (0 to 1) of the way along a cubic bezier. */
function bezier([a, b, c, d]: readonly [Point, Point, Point, Point], t: number): Point {
	const u = 1 - t;
	const at = (k: 0 | 1) =>
		u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k];

	return [at(0), at(1)];
}

/** The point t (0 to 1) of the way along leg i, on the same curve legs() draws. */
export function along(points: readonly Point[], i: number, t: number): Point {
	return bezier(controls(points, i), t);
}

/** How far the way home bows out to the side of the loop, in units. */
export const BEND = 0.28;

/**
 * The bezier from a to b, bowed out by bend units to the left of the way (so, from the last
 * constellation to the first, around the outside of the loop the route makes).
 */
function bow(a: Point, b: Point, bend: number): [Point, Point, Point, Point] {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const length = Math.hypot(dx, dy) || 1;
	const side: Point = [(-dy / length) * bend, (dx / length) * bend];

	return [
		a,
		[a[0] + dx / 3 + side[0], a[1] + dy / 3 + side[1]],
		[a[0] + (dx * 2) / 3 + side[0], a[1] + (dy * 2) / 3 + side[1]],
		b,
	];
}

/** The way home, from the last constellation's last star to the first one's, as an SVG path. */
export function homeLeg(from: Point, to: Point): string {
	const round = (value: number) => Math.round(value * 1000) / 1000;
	const [a, b, c, d] = bow(from, to, BEND);

	return `M${round(a[0])} ${round(a[1])}C${round(b[0])} ${round(b[1])} ${round(c[0])} ${round(c[1])} ${round(d[0])} ${round(d[1])}`;
}

/** Constellation n's size on the map, in pixels at zoom 1. */
const sizeOf = ({ focus, sizes, unit }: Layout, index: number) => {
	const box = focus[index] ?? { w: unit, h: unit };
	const size = sizes?.[index] ?? 1;

	return { w: box.w * size, h: box.h * size };
};

/** The box around every constellation on the map, in pixels at zoom 1. */
export function bounds(layout: Layout): Box {
	let left = Infinity;
	let top = Infinity;
	let right = -Infinity;
	let bottom = -Infinity;

	layout.points.forEach(([x, y], index) => {
		const { w, h } = sizeOf(layout, index);

		left = Math.min(left, x * layout.unit - w / 2);
		top = Math.min(top, y * layout.unit - h / 2);
		right = Math.max(right, x * layout.unit + w / 2);
		bottom = Math.max(bottom, y * layout.unit + h / 2);
	});

	return { x: left, y: top, w: right - left, h: bottom - top };
}

/** The zoom at which the whole map fits the intro's area. */
const fitOf = (layout: Layout) => {
	const box = bounds(layout);

	return Math.min(layout.area.w / Math.max(box.w, 1), layout.area.h / Math.max(box.h, 1));
};

/**
 * Where the camera is at a point of the track: 0 is the intro, n is constellation n (one
 * stop per constellation), and anything between is on the way.
 *
 * On the intro the whole map fits the intro's area. On a stop, the constellation's point
 * sits at the middle of its stop's box. Between two stops the camera follows the route
 * and pulls back a little in the middle; from the intro it zooms into the first one.
 */
export function view(progress: number, layout: Layout): View {
	const { unit, area, focus, points } = layout;
	const last = points.length;
	const p = clamp(progress, 0, last);
	const from = Math.min(Math.floor(p), last - 1);
	const t = p - from;
	const spot = (stop: number) => center(focus[stop - 1] ?? area);

	if (from === 0) {
		// Zooming from the whole map into the first constellation. Moving the point in step
		// with the zoom on screen (not with t) keeps the target steady under the camera.
		const fit = fitOf(layout);
		const zoom = Math.exp(lerp(Math.log(fit), Math.log(LENS), t));
		const k = Math.abs(LENS - fit) < 1e-6 ? t : (zoom - fit) / (LENS - fit);
		const box = bounds(layout);
		const whole: Point = [(box.x + box.w / 2) / unit, (box.y + box.h / 2) / unit];
		const [ax, ay] = center(area);
		const [fx, fy] = spot(1);
		const first = points[0] ?? [0, 0];

		return {
			at: [lerp(whole[0], first[0], k), lerp(whole[1], first[1], k)],
			screen: [lerp(ax, fx, k), lerp(ay, fy, k)],
			zoom,
		};
	}

	const [ax, ay] = spot(from);
	const [bx, by] = spot(from + 1);

	return {
		at: along(points, from - 1, t),
		screen: [lerp(ax, bx, t), lerp(ay, by, t)],
		zoom: LENS * (1 - DIP * Math.sin(Math.PI * t)),
	};
}

/**
 * The flight home, from the last constellation back to the first along the way home: t
 * goes from 0 (on the last stop, as view() shows it) to 1 (on the first). Like a step
 * between neighbours, the camera pulls back a little in the middle.
 */
export function homeward(t: number, layout: Layout): View {
	const { area, focus, points } = layout;
	const last = points.length;
	const spot = (stop: number) => center(focus[stop - 1] ?? area);
	const [ax, ay] = spot(last);
	const [bx, by] = spot(1);
	const p = clamp(t, 0, 1);

	return {
		at: bezier(bow(points[last - 1] ?? [0, 0], points[0] ?? [0, 0], BEND), p),
		screen: [lerp(ax, bx, p), lerp(ay, by, p)],
		zoom: LENS * (1 - DIP * Math.sin(Math.PI * p)),
	};
}

/** Where a map point lands on screen, in pixels, for a view. */
export function project([x, y]: Point, { at, screen, zoom }: View, unit: number): Point {
	return [screen[0] + (x - at[0]) * unit * zoom, screen[1] + (y - at[1]) * unit * zoom];
}

/** The map point under a screen point, for a view: project() the other way. */
export function unproject([x, y]: Point, { at, screen, zoom }: View, unit: number): Point {
	const scale = Math.max(unit * zoom, 1e-6);

	return [at[0] + (x - screen[0]) / scale, at[1] + (y - screen[1]) / scale];
}

/** A point of a drawing stretched to fill its box (0 to 100 each way), on screen. */
export function pointIn(box: Box, [x, y]: Point): Point {
	return [box.x + (box.w * x) / 100, box.y + (box.h * y) / 100];
}

/**
 * Where a star of a constellation's drawing shows, for the drawing in a box: its stars are
 * in a 0 to 100 square (y down), and the square sits in the middle of the box, as big as
 * the box's shorter side (an SVG's viewBox does that by default).
 */
export function starOn(box: Box, [x, y]: Point): Point {
	const side = Math.min(box.w, box.h);

	return [box.x + box.w / 2 + (x / 100 - 0.5) * side, box.y + box.h / 2 + (y / 100 - 0.5) * side];
}

/**
 * How much constellation n (stop n + 1) is the one you are on: 1 on its stop, 0 a stop
 * or more away. Its words show only near 1, and it grows to its stop's box as it nears 1.
 */
export const focusOf = (progress: number, index: number) =>
	clamp(1 - Math.abs(progress - (index + 1)) * 1.6, 0, 1);

/**
 * Where constellation n shows on screen. At its map size times the camera's zoom, grown
 * (through the lens) to exactly its stop's box when it is the one you are on. `focus`
 * says how much it is the one you are on, from the progress unless told otherwise.
 */
export function placeOf(
	progress: number,
	index: number,
	layout: Layout,
	shot: View,
	focus = focusOf(progress, index)
): Box {
	const point = layout.points[index] ?? [0, 0];
	const { w, h } = sizeOf(layout, index);
	const [x, y] = project(point, shot, layout.unit);
	const mapped = (layout.sizes?.[index] ?? 1) * shot.zoom;
	const grow = lerp(1, 1 / Math.max(mapped, 1e-6), smooth(focus));
	const width = w * shot.zoom * grow;
	const height = h * shot.zoom * grow;

	return { x: x - width / 2, y: y - height / 2, w: width, h: height };
}

/**
 * How visible constellation n is. On the intro every one shows (it is the map); on a stop
 * the ones ahead stay bright as hints and the ones behind fade back.
 */
export function presence(progress: number, index: number): number {
	const ahead = index + 1 > progress;
	const rest = lerp(ahead ? 0.75 : 0.4, 0.95, clamp(1 - progress, 0, 1));

	return lerp(rest, 1, focusOf(progress, index));
}

/** How much a stop's words show: fully on it, fading out on the way to the next. */
export const nearness = (progress: number, stop: number) =>
	clamp(1 - Math.abs(progress - stop) * 1.8, 0, 1);

/** How much of leg i (from constellation i to i + 1) is lit, once the camera has reached it. */
export const trail = (reached: number, leg: number) => clamp(reached - (leg + 1), 0, 1);
