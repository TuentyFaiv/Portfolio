import { m } from "#lib/paraglide/messages.js";

const years = ["2016", "2018", "2021", "2022", "2023", "2024", "2025", "2026"] as const;

export const chapters = years.map((year) => ({
	year,
	title: m[`translation:story-page.${year}-title`],
	body: m[`translation:story-page.${year}-body`],
}));

export const chapterId = (year: string) => `year-${year}`;

export const storySlides = [
	{ id: "story", label: m["translation:story"] },
	...chapters.map(({ year }) => ({ id: chapterId(year), label: () => year })),
];
