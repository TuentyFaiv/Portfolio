import type { Point } from "#utils/chart.ts";

import { m } from "#lib/paraglide/messages.js";

/*
 * "Into the nebula": every project is a constellation on one star chart, joined by a
 * winding route; the slide's sideways track glides a camera along it. One is lit
 * (fetchzen); the rest are undiscovered, holding a place for projects still being
 * finished. Eighteen stray stars hide along the way: seven constellations and eighteen
 * strays make twenty-five, a nod to the name. Where the name comes from is a birthday,
 * and only the reveal says so: no comment or copy ties it to the stars.
 *
 * fetchzen's facts come from the published package (npm "latest", MIT, no runtime
 * dependencies) and its README's feature list; keep them in step with a new release. Tool
 * and project names are proper nouns and stay as they are in every language.
 */
export const project = {
	name: "fetchzen",
	href: "https://fetchzen.dev",
	source: "https://github.com/TuentyFaiv/http",
	since: "2023",
	version: "0.2.0",
	tools: ["TypeScript", "Fetch API", "Vitest", "npm"],
} as const;

/**
 * fetchzen's own constellation on its landed view: native fetch at the center, the
 * features around it. x and y place each star in a square (0 to 100, y down), as in the
 * design; side says where its label sits on wide screens. On phones every label sits
 * under its star. projects.css places the same points (the CSP blocks style attributes).
 */
export const features = [
	{ id: "typed", label: m["translation:projects.typed"], x: 21.9, y: 20.3, side: "start" },
	{ id: "validation", label: m["translation:projects.validation"], x: 71.9, y: 15.6, side: "end" },
	{ id: "retries", label: m["translation:projects.retries"], x: 86.7, y: 50, side: "end" },
	{ id: "timeout", label: m["translation:projects.timeout"], x: 71.9, y: 82.8, side: "end" },
	{ id: "progress", label: m["translation:projects.progress"], x: 25.8, y: 85.2, side: "start" },
	{ id: "hooks", label: m["translation:projects.hooks"], x: 9.4, y: 50, side: "start" },
] as const;

type FeatureId = (typeof features)[number]["id"];

/** The lines between fetchzen's stars: each feature to the center, three pairs on the rim. */
export const links: [FeatureId | "core", FeatureId][] = [
	...features.map(({ id }) => ["core", id] as [FeatureId | "core", FeatureId]),
	["typed", "validation"],
	["retries", "timeout"],
	["hooks", "progress"],
];

/**
 * A constellation's outline: stars in a 0..100 square (y down), and the lines between them.
 * `land` is the star the route runs through (it lands there and leaves from there), so the
 * route never stops in empty space inside a drawing.
 */
export interface Shape {
	stars: [number, number][];
	lines: [number, number][];
	land: number;
	/** The star where the route ends, ringed: only the last constellation has one. */
	end?: number;
}

const shapes = {
	fetchzen: {
		land: 0,
		stars: [
			[50, 50],
			[22, 20],
			[72, 16],
			[87, 50],
			[72, 83],
			[26, 85],
			[9, 50],
		],
		lines: [
			[0, 1],
			[0, 2],
			[0, 3],
			[0, 4],
			[0, 5],
			[0, 6],
			[1, 2],
			[3, 4],
			[6, 5],
		],
	},
	arc: {
		land: 2,
		stars: [
			[10, 62],
			[30, 42],
			[50, 36],
			[70, 46],
			[90, 70],
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
		],
	},
	kite: {
		land: 4,
		stars: [
			[50, 10],
			[82, 45],
			[50, 90],
			[18, 45],
			[50, 52],
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[0, 4],
			[4, 2],
		],
	},
	dipper: {
		land: 3,
		stars: [
			[8, 30],
			[30, 24],
			[46, 36],
			[60, 46],
			[64, 76],
			[90, 80],
			[86, 50],
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, 6],
			[6, 3],
		],
	},
	crown: {
		land: 3,
		stars: [
			[8, 72],
			[24, 30],
			[40, 60],
			[50, 18],
			[60, 60],
			[76, 30],
			[92, 72],
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, 6],
		],
	},
	cross: {
		land: 1,
		stars: [
			[50, 10],
			[50, 50],
			[50, 90],
			[14, 42],
			[86, 58],
		],
		lines: [
			[0, 1],
			[1, 2],
			[3, 1],
			[1, 4],
		],
	},
	// The last one: its tail faces the way the route comes in, and its last star is where
	// the way home to fetchzen leaves from.
	hook: {
		land: 0,
		end: 5,
		stars: [
			[80, 18],
			[58, 28],
			[44, 50],
			[40, 76],
			[56, 90],
			[76, 80],
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
		],
	},
} satisfies Record<string, Shape>;

/**
 * The seven constellations, in the order the track visits them, after the intro (stop 0):
 * fetchzen first. An undiscovered slot has no project yet; when one ships, it gets its
 * name and content.
 *
 * `at` places each one on the star chart and `size` says how big it is there, both
 * against fetchzen's box (y goes down), as in the design's intro ("Travel motion / 2 ·
 * Star chart" in portfolio.pen): a loop on the right, fetchzen the biggest at its foot,
 * the route winding up to the right and back over the top. On the whole map a faint way
 * home closes the loop into fetchzen's Hooks star ("Round 2 / R3" in portfolio.pen).
 */
export const slots = [
	{ id: "fetchzen", shape: shapes.fetchzen, lit: true, at: [0, 0], size: 1 },
	{ id: "undiscovered-2", shape: shapes.kite, lit: false, at: [1.12, -1], size: 0.71 },
	{ id: "undiscovered-3", shape: shapes.crown, lit: false, at: [2.24, 0], size: 0.71 },
	{ id: "undiscovered-4", shape: shapes.arc, lit: false, at: [2.88, -1.35], size: 0.65 },
	{ id: "undiscovered-5", shape: shapes.dipper, lit: false, at: [1.94, -2.18], size: 0.65 },
	{ id: "undiscovered-6", shape: shapes.cross, lit: false, at: [0.65, -2.18], size: 0.56 },
	{ id: "undiscovered-7", shape: shapes.hook, lit: false, at: [-0.29, -1.35], size: 0.56 },
] as const satisfies readonly {
	id: string;
	shape: Shape;
	lit: boolean;
	at: Point;
	size: number;
}[];

export type Slot = (typeof slots)[number];

/** The track's stops: the intro, then one per constellation. */
export const STOPS = slots.length + 1;

/**
 * The eighteen strays: the stop each one hides on, then where, in percent of the screen.
 * Two or three per stop, clear of the text, the links, the track and the slide
 * rail, so every one can be clicked. Clicking one finds it; finding all of them shows the
 * reveal. A game for wide screens: phones have no room for it, as in the design.
 */
export const strays = [
	[0, 6, 84],
	[0, 94, 24],
	[0, 44, 60],
	[1, 5, 22],
	[1, 22, 82],
	[2, 6, 30],
	[2, 34, 14],
	[3, 94, 80],
	[3, 16, 86],
	[4, 8, 66],
	[4, 46, 16],
	[5, 30, 14],
	[5, 95, 88],
	[6, 6, 50],
	[6, 26, 80],
	[7, 78, 16],
	[7, 24, 18],
	[7, 10, 78],
] as const;

export const STRAYS = strays.length;
