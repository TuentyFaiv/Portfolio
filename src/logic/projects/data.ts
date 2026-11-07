import type { Point } from "#lib/projects/chart.ts";

import { m } from "#lib/paraglide/messages.js";

export const project = {
	name: "fetchzen",
	href: "https://fetchzen.dev",
	source: "https://github.com/TuentyFaiv/http",
	since: "2023",
	version: "0.2.0",
	tools: ["TypeScript", "Fetch API", "Vitest", "npm"],
	cover: "/og/fetchzen.jpg",
} as const;

// Stars and features are in a 0–100 square, y down.
export const features = [
	{ id: "typed", label: m["translation:projects.typed"], x: 21.9, y: 20.3, side: "start" },
	{ id: "validation", label: m["translation:projects.validation"], x: 71.9, y: 15.6, side: "end" },
	{ id: "retries", label: m["translation:projects.retries"], x: 86.7, y: 50, side: "end" },
	{ id: "timeout", label: m["translation:projects.timeout"], x: 71.9, y: 82.8, side: "end" },
	{ id: "progress", label: m["translation:projects.progress"], x: 25.8, y: 85.2, side: "start" },
	{ id: "hooks", label: m["translation:projects.hooks"], x: 9.4, y: 50, side: "start" },
] as const;

type FeatureId = (typeof features)[number]["id"];

export const links: [FeatureId | "core", FeatureId][] = [
	...features.map(({ id }) => ["core", id] as [FeatureId | "core", FeatureId]),
	["typed", "validation"],
	["retries", "timeout"],
	["hooks", "progress"],
];

export interface Shape {
	stars: [number, number][];
	lines: [number, number][];
	land: number;
	end?: number;
}

const group = (size: number, values: number[]) =>
	values.flatMap((_, index) => (index % size ? [] : [values.slice(index, index + size)]));

const shape = (land: number, paths: number[][], xy: number[], end?: number): Shape => ({
	land,
	end,
	stars: group(2, xy) as [number, number][],
	lines: paths.flatMap((path) =>
		path.slice(1).map((to, index) => [path[index] ?? 0, to] as [number, number])
	),
});

const shapes = {
	fetchzen: shape(0, [], [50, 50]),
	arc: shape(2, [[0, 1, 2, 3, 4]], [10, 62, 30, 42, 50, 36, 70, 46, 90, 70]),
	kite: shape(
		4,
		[
			[0, 1, 2, 3, 0],
			[0, 4, 2],
		],
		[50, 10, 82, 45, 50, 90, 18, 45, 50, 52]
	),
	dipper: shape(
		3,
		[[0, 1, 2, 3, 4, 5, 6, 3]],
		[8, 30, 30, 24, 46, 36, 60, 46, 64, 76, 90, 80, 86, 50]
	),
	crown: shape(3, [[0, 1, 2, 3, 4, 5, 6]], [8, 72, 24, 30, 40, 60, 50, 18, 60, 60, 76, 30, 92, 72]),
	cross: shape(
		1,
		[
			[0, 1, 2],
			[3, 1, 4],
		],
		[50, 10, 50, 50, 50, 90, 14, 42, 86, 58]
	),
	hook: shape(0, [[0, 1, 2, 3, 4, 5]], [80, 18, 58, 28, 44, 50, 40, 76, 56, 90, 76, 80], 5),
};

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

export const STOPS = slots.length + 1;

export const strays = group(
	3,
	[
		0, 6, 84, 0, 94, 24, 0, 44, 60, 1, 5, 22, 1, 22, 82, 2, 6, 30, 2, 34, 14, 3, 94, 80, 3, 16, 86,
		4, 8, 66, 4, 46, 16, 5, 30, 14, 5, 95, 88, 6, 6, 50, 6, 26, 80, 7, 78, 16, 7, 24, 18, 7, 10, 78,
	]
) as [stop: number, x: number, y: number][];

export const STRAYS = strays.length;
