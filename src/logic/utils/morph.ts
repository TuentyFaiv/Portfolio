/**
 * Shared elements for route transitions: what the home Story and Blog slides show again on
 * /story and /blog, so it moves into place instead of fading out and back in. Going back
 * runs the same pairs in reverse.
 *
 * A pair only morphs when its element is on screen: clicking "Story" in the header from
 * the first slide just crossfades, rather than a headline flying in from below.
 */
type Pair = { name: string; home: string; page: string };

const story: Pair[] = [
	{ name: "story-title", home: "#story .teaser__title", page: ".opening__title" },
];
const blog: Pair[] = [
	{ name: "blog-label", home: "#blog .teaser__eyebrow", page: ".posts__empty-label" },
	{ name: "blog-title", home: "#blog .teaser__title", page: ".posts__empty-title" },
	{ name: "blog-body", home: "#blog .teaser__lede", page: ".posts__empty-body" },
];

// Only real chapter ids reach a selector; anything else in the address is ignored.
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

const onScreen = (element: Element | null): element is HTMLElement => {
	if (!(element instanceof HTMLElement)) return false;

	const { bottom, height, top } = element.getBoundingClientRect();

	return height > 0 && bottom > 0 && top < window.innerHeight;
};

/**
 * Names the shared elements on the page being left, and returns what names the page
 * arriving: call that once it is on screen, and its result once the transition ends.
 */
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

		if (!onScreen(element)) return false;

		element.style.viewTransitionName = name;
		return true;
	});

	return () => {
		const arrived = named.flatMap(({ home, page, name }) => {
			const element = document.querySelector(leavingHome ? page : home);

			if (!onScreen(element)) return [];

			element.style.viewTransitionName = name;
			return [element];
		});

		return () => {
			for (const element of arrived) element.style.viewTransitionName = "";
		};
	};
}
