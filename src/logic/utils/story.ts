import { m } from "#lib/paraglide/messages.js";

export const chapters = [
	{
		year: "2016",
		title: m["translation:story-page.2016-title"],
		body: m["translation:story-page.2016-body"],
	},
	{
		year: "2018",
		title: m["translation:story-page.2018-title"],
		body: m["translation:story-page.2018-body"],
	},
	{
		year: "2021",
		title: m["translation:story-page.2021-title"],
		body: m["translation:story-page.2021-body"],
	},
	{
		year: "2022",
		title: m["translation:story-page.2022-title"],
		body: m["translation:story-page.2022-body"],
	},
	{
		year: "2023",
		title: m["translation:story-page.2023-title"],
		body: m["translation:story-page.2023-body"],
	},
	{
		year: "2024",
		title: m["translation:story-page.2024-title"],
		body: m["translation:story-page.2024-body"],
	},
	{
		year: "2025",
		title: m["translation:story-page.2025-title"],
		body: m["translation:story-page.2025-body"],
	},
	{
		year: "2026",
		title: m["translation:story-page.2026-title"],
		body: m["translation:story-page.2026-body"],
	},
] as const;

export const chapterId = (year: string) => `year-${year}`;

export const storySlides = [
	{ id: "story", label: m["translation:story"] },
	...chapters.map(({ year }) => ({ id: chapterId(year), label: () => year })),
];
