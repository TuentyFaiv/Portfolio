import type { Heading, PostSummary } from "#typing/blog.ts";

const stripTags = (html: string) => html.replace(/<[^>]+>/g, "").trim();

const slugify = (text: string) =>
	text
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

/** Gives every h2 an id so the "On this page" list can link to it. */
export function linkHeadings(html: string): { html: string; headings: Heading[] } {
	const headings: Heading[] = [];
	const used = new Map<string, number>();

	const linked = html.replace(
		/<h2([^>]*)>(.*?)<\/h2>/gs,
		(_, attributes: string, inner: string) => {
			const text = stripTags(inner);
			const base = slugify(text) || "section";
			const count = used.get(base) ?? 0;
			const id = count ? `${base}-${count + 1}` : base;

			used.set(base, count + 1);
			headings.push({ id, text });

			return `<h2${attributes} id="${id}">${inner}</h2>`;
		}
	);

	return { html: linked, headings };
}

export function groupByYear(posts: PostSummary[]) {
	const years = new Map<number, PostSummary[]>();

	for (const post of posts) {
		const year = new Date(post.publishedAt).getUTCFullYear();

		years.set(year, [...(years.get(year) ?? []), post]);
	}

	return [...years].map(([year, items]) => ({ year, items }));
}

export function collectTags(posts: PostSummary[]) {
	const tags = new Map(posts.flatMap((post) => post.tags).map((tag) => [tag.slug, tag]));

	return [...tags.values()];
}

export const formatMonth = (date: string, locale: string) =>
	new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC", year: "numeric" }).format(
		new Date(date)
	);
