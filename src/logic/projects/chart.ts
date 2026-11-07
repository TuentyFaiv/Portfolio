// Map units: 1 = fetchzen's focus box width, y grows down.

export type Point = readonly [number, number];

export interface Box {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface Layout {
	unit: number;
	area: Box;
	focus: Box[];
	points: readonly Point[];
	sizes?: readonly number[];
}

export interface View {
	at: Point;
	screen: Point;
	zoom: number;
}

export const LENS = 0.6;
export const DIP = 0.24;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const center = (box: Box): Point => [box.x + box.w / 2, box.y + box.h / 2];
const mix = (a: Point, b: Point, t: number): Point => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const dip = (t: number) => LENS * (1 - DIP * Math.sin(Math.PI * t));
const spot = ({ area, focus }: Layout, stop: number) => center(focus[stop - 1] ?? area);

type Curve = readonly [Point, Point, Point, Point];

function controls(points: readonly Point[], i: number): Curve {
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

const path = (curve: Curve) => {
	const [start, ...rest] = curve.map((point) =>
		point.map((value) => Math.round(value * 1000) / 1000).join(" ")
	);

	return `M${start}C${rest.join(" ")}`;
};

export const legs = (points: readonly Point[]) =>
	points.slice(0, -1).map((_, i) => path(controls(points, i)));

function bezier([a, b, c, d]: Curve, t: number): Point {
	const u = 1 - t;
	const at = (k: 0 | 1) =>
		u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k];

	return [at(0), at(1)];
}

export const along = (points: readonly Point[], i: number, t: number) =>
	bezier(controls(points, i), t);

function bow(a: Point, b: Point): Curve {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const bend = 0.28 / (Math.hypot(dx, dy) || 1);

	return [
		a,
		[a[0] + dx / 3 - dy * bend, a[1] + dy / 3 + dx * bend],
		[a[0] + (dx * 2) / 3 - dy * bend, a[1] + (dy * 2) / 3 + dx * bend],
		b,
	];
}

export const homeLeg = (from: Point, to: Point) => path(bow(from, to));

const sizeOf = ({ focus, sizes, unit }: Layout, index: number) => {
	const box = focus[index] ?? { w: unit, h: unit };
	const size = sizes?.[index] ?? 1;

	return { w: box.w * size, h: box.h * size };
};

export function bounds(layout: Layout): Box {
	let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity];

	layout.points.forEach(([x, y], index) => {
		const { w, h } = sizeOf(layout, index);

		left = Math.min(left, x * layout.unit - w / 2);
		top = Math.min(top, y * layout.unit - h / 2);
		right = Math.max(right, x * layout.unit + w / 2);
		bottom = Math.max(bottom, y * layout.unit + h / 2);
	});

	return { x: left, y: top, w: right - left, h: bottom - top };
}

export function view(progress: number, layout: Layout): View {
	const { unit, area, points } = layout;
	const last = points.length;
	const p = clamp(progress, 0, last);
	const from = Math.min(Math.floor(p), last - 1);
	const t = p - from;

	if (from > 0)
		return {
			at: along(points, from - 1, t),
			screen: mix(spot(layout, from), spot(layout, from + 1), t),
			zoom: dip(t),
		};

	const box = bounds(layout);
	const fit = Math.min(area.w / Math.max(box.w, 1), area.h / Math.max(box.h, 1));
	const zoom = Math.exp(lerp(Math.log(fit), Math.log(LENS), t));
	const k = Math.abs(LENS - fit) < 1e-6 ? t : (zoom - fit) / (LENS - fit);

	return {
		at: mix([(box.x + box.w / 2) / unit, (box.y + box.h / 2) / unit], points[0] ?? [0, 0], k),
		screen: mix(center(area), spot(layout, 1), k),
		zoom,
	};
}

export function homeward(t: number, layout: Layout): View {
	const { points } = layout;
	const p = clamp(t);

	return {
		at: bezier(bow(points.at(-1) ?? [0, 0], points[0] ?? [0, 0]), p),
		screen: mix(spot(layout, points.length), spot(layout, 1), p),
		zoom: dip(p),
	};
}

export function project([x, y]: Point, { at, screen, zoom }: View, unit: number): Point {
	return [screen[0] + (x - at[0]) * unit * zoom, screen[1] + (y - at[1]) * unit * zoom];
}

export function unproject([x, y]: Point, { at, screen, zoom }: View, unit: number): Point {
	const scale = Math.max(unit * zoom, 1e-6);

	return [at[0] + (x - screen[0]) / scale, at[1] + (y - screen[1]) / scale];
}

export function pointIn(box: Box, [x, y]: Point): Point {
	return [box.x + (box.w * x) / 100, box.y + (box.h * y) / 100];
}

export function starOn(box: Box, [x, y]: Point): Point {
	const side = Math.min(box.w, box.h);

	return [box.x + box.w / 2 + (x / 100 - 0.5) * side, box.y + box.h / 2 + (y / 100 - 0.5) * side];
}

export const focusOf = (progress: number, index: number) =>
	clamp(1 - Math.abs(progress - (index + 1)) * 1.6);

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

export function presence(progress: number, index: number): number {
	const ahead = index + 1 > progress;
	const rest = lerp(ahead ? 0.75 : 0.4, 0.95, clamp(1 - progress));

	return lerp(rest, 1, focusOf(progress, index));
}

export const nearness = (progress: number, stop: number) =>
	clamp(1 - Math.abs(progress - stop) * 1.8);

export const trail = (reached: number, leg: number) => clamp(reached - (leg + 1));
