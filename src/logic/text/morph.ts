import { onScreen } from "#lib/text/retext.ts";

type Pair = { name: string; home: string; page: string };

const story: Pair[] = [
	{ name: "story-title", home: "#story .teaser__title", page: ".opening__title" },
];
const blog: Pair[] = [
	{ name: "blog-label", home: "#blog .teaser__eyebrow", page: ".posts__empty-label" },
	{ name: "blog-title", home: "#blog .teaser__title", page: ".posts__empty-title" },
	{ name: "blog-body", home: "#blog .teaser__lede", page: ".posts__empty-body" },
];

const chapter = (hash: string) => (/^#year-\d{4}$/.test(hash) ? hash.slice(1) : undefined);

function pairs(page: string | null | undefined, hash: string): Pair[] {
	if (page === "/blog") return blog;
	if (page !== "/story") return [];

	const year = chapter(hash);

	return year
		? [
				...story,
				{
					name: "story-year",
					home: `#story .story-teaser__year[href="/story#${year}"]`,
					page: `#${year} .chapter__year`,
				},
			]
		: story;
}

const visible = (element: Element | null): element is HTMLElement =>
	element instanceof HTMLElement && onScreen(element);

export function morph(
	from: { route: string | null; hash: string },
	to: { route: string | null; hash: string }
) {
	const leavingHome = from.route === "/";
	const list = leavingHome
		? pairs(to.route, to.hash)
		: to.route === "/"
			? pairs(from.route, from.hash)
			: [];
	const named = list.filter(({ home, page, name }) => {
		const element = document.querySelector(leavingHome ? home : page);

		if (!visible(element)) return false;

		element.style.viewTransitionName = name;
		return true;
	});

	return () => {
		const arrived = named.flatMap(({ home, page, name }) => {
			const element = document.querySelector(leavingHome ? page : home);

			if (!visible(element)) return [];

			element.style.viewTransitionName = name;
			return [element];
		});

		return () => {
			for (const element of arrived) element.style.viewTransitionName = "";
		};
	};
}
