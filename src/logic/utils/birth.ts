/*
 * The reveal's last act: every star the visitor found gathers into a newborn nebula, then
 * bursts out and becomes the letters of the name. Pure geometry, shared by the page and
 * its tests: where each star lands on the letters, and where it circles before the burst.
 */

/** A box on screen, in CSS pixels. */
export interface Box {
	x: number;
	y: number;
	w: number;
	h: number;
}

export type Point = [number, number];

/**
 * Where count stars land on the letters: shared out in turn (every letter gets its share,
 * the first ones one more), stacked down the middle of each letter's ink, nudged left and
 * right so they read as stars and not as a line.
 */
export function landings(letters: readonly Box[], count: number): Point[] {
	if (letters.length === 0) return [];

	const share = letters.map(
		(_, index) => Math.floor(count / letters.length) + (index < count % letters.length ? 1 : 0)
	);

	return letters.flatMap(({ x, y, w, h }, index) => {
		const stars = share[index] ?? 0;

		return Array.from({ length: stars }, (_, star): Point => {
			// From a quarter down to three quarters: the body of the letter, not its edges.
			const down = stars === 1 ? 0.5 : 0.28 + (0.44 * star) / (stars - 1);
			const side = star % 2 === 0 ? -0.12 : 0.12;

			return [x + w * (0.5 + side), y + h * down];
		});
	});
}

/** Where star i of count circles the core before the burst: a loose ring, never two alike. */
export function swirl([cx, cy]: Point, i: number, count: number, radius: number): Point {
	const angle = (i / count) * Math.PI * 2 + i * 0.7;
	const r = radius * (0.45 + 0.55 * (((i * 7) % count) / count));

	return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r * 0.6];
}

/**
 * Where every found star lands: each constellation's star in the middle of a plain letter
 * (the name has seven, one per constellation), and the strays shared out over all the
 * letters, so the violet ones (u, a, i) are made of strays alone.
 */
export function assign(
	letters: readonly { box: Box; heard: boolean }[],
	constellations: number,
	strays: number
): { constellations: Point[]; strays: Point[] } {
	const plain = letters.filter(({ heard }) => !heard).map(({ box }) => box);
	const homes = plain.length > 0 ? plain : letters.map(({ box }) => box);

	return {
		constellations: Array.from({ length: constellations }, (_, index): Point => {
			const { x, y, w, h } = homes[index % homes.length] ?? { x: 0, y: 0, w: 0, h: 0 };

			return [x + w / 2, y + h / 2];
		}),
		strays: landings(
			letters.map(({ box }) => box),
			strays
		),
	};
}
