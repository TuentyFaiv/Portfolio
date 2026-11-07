import { describe, expect, it } from "vitest";

import { assign, landings, swirl } from "./birth.ts";

const letters = Array.from({ length: 10 }, (_, index) => ({ x: index * 60, y: 100, w: 50, h: 80 }));

describe("the name's birth", () => {
	it("lands every star on a letter, sharing them out evenly", () => {
		const points = landings(letters, 25);

		expect(points).toHaveLength(25);

		const perLetter = letters.map(
			({ x, y, w, h }) =>
				points.filter(([px, py]) => px >= x && px <= x + w && py >= y && py <= y + h).length
		);

		expect(perLetter.reduce((sum, stars) => sum + stars, 0)).toBe(25);
		expect(Math.min(...perLetter)).toBe(2);
		expect(Math.max(...perLetter)).toBe(3);
	});

	it("keeps the stars off the letters' edges", () => {
		for (const [x, y] of landings(letters, 25)) {
			const letter = letters.find((box) => x >= box.x && x <= box.x + box.w);

			expect(letter).toBeDefined();
			expect(y).toBeGreaterThan(100 + 80 * 0.2);
			expect(y).toBeLessThan(100 + 80 * 0.8);
		}
	});

	it("has nowhere to land without letters", () => {
		expect(landings([], 25)).toEqual([]);
	});

	it("circles the core loosely, every star in its own place", () => {
		const points = Array.from({ length: 25 }, (_, index) => swirl([500, 300], index, 25, 100));
		const keys = new Set(points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`));

		expect(keys.size).toBe(25);
		for (const [x, y] of points)
			expect(Math.hypot(x - 500, (y - 300) / 0.6)).toBeLessThanOrEqual(100.0001);
	});

	it("gives each constellation a plain letter, and the strays every letter", () => {
		const heard = new Set([1, 7, 8]);
		const named = letters.map((box, index) => ({ box, heard: heard.has(index) }));
		const { constellations, strays } = assign(named, 7, 18);
		const letterOf = ([x]: [number, number]) =>
			letters.findIndex((box) => x >= box.x && x <= box.x + box.w);

		expect(constellations.map(letterOf)).toEqual([0, 2, 3, 4, 5, 6, 9]);
		expect(strays).toHaveLength(18);
		for (const index of heard) expect(strays.map(letterOf)).toContain(index);
	});
});
