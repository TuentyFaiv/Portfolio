import { describe, expect, it } from "vitest";

import type { Layout, Point } from "./chart.ts";

import {
	along,
	bounds,
	DIP,
	focusOf,
	homeLeg,
	homeward,
	LENS,
	legs,
	placeOf,
	presence,
	project,
	starOn,
	trail,
	unproject,
	view,
} from "./chart.ts";

const points: Point[] = [
	[0, 0],
	[1, -1],
	[2, 0],
];
const box = { x: 800, y: 200, w: 400, h: 400 };
const layout: Layout = {
	unit: 400,
	area: { x: 760, y: 100, w: 600, h: 600 },
	focus: [box, box, box],
	points,
	sizes: [1, 0.7, 0.6],
};

const close = (actual: readonly number[], expected: readonly number[]) => {
	for (const [index, value] of actual.entries())
		expect(value).toBeCloseTo(expected[index] ?? Number.NaN, 6);
};
const place = (progress: number, index: number) =>
	placeOf(progress, index, layout, view(progress, layout));

describe("star chart camera", () => {
	it("grows each constellation to exactly its stop's box on its stop", () => {
		for (const stop of [1, 2, 3]) {
			const { x, y, w, h } = place(stop, stop - 1);

			expect(view(stop, layout).zoom).toBeCloseTo(LENS, 6);
			close([x, y, w, h], [800, 200, 400, 400]);
		}
	});

	it("keeps the neighbours at their map size around the current one", () => {
		const next = place(1, 1);

		close([next.w, next.h], [400 * 0.7 * LENS, 400 * 0.7 * LENS]);
		close([next.x + next.w / 2, next.y + next.h / 2], [1000 + 400 * LENS, 400 - 400 * LENS]);
	});

	it("fits the whole map inside the intro's area", () => {
		for (const index of [0, 1, 2]) {
			const { x, y, w, h } = place(0, index);

			expect(x).toBeGreaterThanOrEqual(760 - 1e-6);
			expect(y).toBeGreaterThanOrEqual(100 - 1e-6);
			expect(x + w).toBeLessThanOrEqual(1360 + 1e-6);
			expect(y + h).toBeLessThanOrEqual(700 + 1e-6);
		}

		const whole = bounds(layout);
		const zoom = view(0, layout).zoom;

		expect(Math.max((whole.w * zoom) / 600, (whole.h * zoom) / 600)).toBeCloseTo(1, 6);
	});

	it("pulls back halfway between stops and follows the drawn route", () => {
		const shot = view(1.5, layout);

		expect(shot.zoom).toBeCloseTo(LENS * (1 - DIP), 6);
		close(shot.at, along(points, 0, 0.5));
		expect(place(1.5, 0).w).toBeLessThan(400 * 0.6);
	});

	it("moves smoothly: no jump anywhere along the track", () => {
		let previous = place(0, 1);

		for (let step = 1; step <= 300; step += 1) {
			const next = place(step / 100, 1);

			expect(Math.hypot(next.x - previous.x, next.y - previous.y)).toBeLessThan(40);
			expect(Math.abs(next.w - previous.w)).toBeLessThan(25);
			previous = next;
		}
	});

	it("draws one leg between each pair of constellations, ending on them", () => {
		const paths = legs(points);

		expect(paths).toHaveLength(2);
		expect(paths[0]).toMatch(/^M0 0C.* 1 -1$/);
		close(along(points, 1, 1), [2, 0]);
	});

	it("shows words only on the constellation's own stop", () => {
		expect(focusOf(1, 0)).toBe(1);
		expect(focusOf(2, 0)).toBe(0);
		expect(focusOf(1.3, 0)).toBeGreaterThan(0);
	});

	it("keeps the whole map visible on the intro and the way ahead brighter than the way back", () => {
		expect(presence(0, 2)).toBeGreaterThan(0.9);
		expect(presence(2, 2)).toBeGreaterThan(presence(2, 0));
		expect(presence(2, 1)).toBe(1);
	});

	it("lights the route only as far as the camera has been", () => {
		expect(trail(1, 0)).toBe(0);
		expect(trail(1.5, 0)).toBe(0.5);
		expect(trail(3, 0)).toBe(1);
		expect(trail(3, 1)).toBe(1);
	});

	it("finds a star where its drawing shows it, square in the middle of a wider box", () => {
		const wide = { x: 100, y: 50, w: 400, h: 300 };

		close(starOn(wide, [50, 50]), [300, 200]);
		close(starOn(wide, [0, 0]), [150, 50]);
		close(starOn(wide, [100, 100]), [450, 350]);
	});

	it("turns a screen point back into the map point the camera shows there", () => {
		const shot = view(1.4, layout);
		const point = [1.3, -0.4] as const;

		close(unproject(project(point, shot, layout.unit), shot, layout.unit), point);
	});

	it("flies home from the last stop's view to the first one's, pulling back on the way", () => {
		const last = points.length;

		close(homeward(0, layout).at, view(last, layout).at);
		close(homeward(0, layout).screen, view(last, layout).screen);
		close(homeward(1, layout).at, view(1, layout).at);
		expect(homeward(1, layout).zoom).toBeCloseTo(LENS, 6);
		expect(homeward(0.5, layout).zoom).toBeCloseTo(LENS * (1 - DIP), 6);
		const middle = homeward(0.5, layout).at;
		const straight = [1, 0];

		expect(Math.hypot(middle[0] - straight[0], middle[1] - straight[1])).toBeGreaterThan(0.2);
	});

	it("draws the way home from the last star to the first", () => {
		expect(homeLeg([2, 0], [0, 0])).toMatch(/^M2 0C.* 0 0$/);
	});
});
