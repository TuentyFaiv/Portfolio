import type { Box } from "#lib/projects/chart.ts";

import { center } from "#lib/projects/chart.ts";

type Point = [number, number];

export function landings(letters: readonly Box[], count: number): Point[] {
	if (letters.length === 0) return [];

	const share = letters.map(
		(_, index) => Math.floor(count / letters.length) + (index < count % letters.length ? 1 : 0)
	);

	return letters.flatMap(({ x, y, w, h }, index) => {
		const stars = share[index] ?? 0;

		return Array.from({ length: stars }, (_, star): Point => {
			const down = stars === 1 ? 0.5 : 0.28 + (0.44 * star) / (stars - 1);
			const side = star % 2 === 0 ? -0.12 : 0.12;

			return [x + w * (0.5 + side), y + h * down];
		});
	});
}

export function swirl([cx, cy]: Point, i: number, count: number, radius: number): Point {
	const angle = (i / count) * Math.PI * 2 + i * 0.7;
	const r = radius * (0.45 + 0.55 * (((i * 7) % count) / count));

	return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r * 0.6];
}

export function assign(
	letters: readonly { box: Box; heard: boolean }[],
	constellations: number,
	strays: number
): { constellations: Point[]; strays: Point[] } {
	const plain = letters.filter(({ heard }) => !heard).map(({ box }) => box);
	const homes = plain.length > 0 ? plain : letters.map(({ box }) => box);

	return {
		constellations: Array.from(
			{ length: constellations },
			(_, index) => [...center(homes[index % homes.length] ?? { x: 0, y: 0, w: 0, h: 0 })] as Point
		),
		strays: landings(
			letters.map(({ box }) => box),
			strays
		),
	};
}
