/**
 * Scrambles text in place when it changes, the way the logo does: each changed line runs
 * through its own letters, shuffled, and settles on its new words from left to right. It works on text
 * nodes, not elements, so a heading with a styled second line keeps its markup.
 *
 * Take a `snapshot()` before the text changes, then `play()` it after the page has updated.
 * Only text on screen is recorded; anything off screen simply has its new words.
 *
 * Never scramble Svelte-rendered text by replacing an element's HTML (as anime.js's
 * scrambleText does): that throws away the text node Svelte updates, and the words stop
 * following the language.
 */
const duration = 520;

let stop: (() => void) | undefined;

export type Snapshot = Map<Text, string>;

const onScreen = (element: Element) => {
	const { bottom, height, left, right, top, width } = element.getBoundingClientRect();

	return (
		width > 0 &&
		height > 0 &&
		bottom > 0 &&
		right > 0 &&
		top < window.innerHeight &&
		left < window.innerWidth
	);
};

export function snapshot(root: Node = document.body): Snapshot {
	const texts: Snapshot = new Map();
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode: (node) => {
			const parent = node.parentElement;

			if (!parent || !node.nodeValue?.trim() || parent.closest("script, style, noscript"))
				return NodeFilter.FILTER_REJECT;

			return onScreen(parent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
		},
	});

	for (let node = walker.nextNode(); node; node = walker.nextNode())
		texts.set(node as Text, node.nodeValue ?? "");

	return texts;
}

const isLetter = (char: string) => /\p{L}/u.test(char);

/** A word's letters in another order; anything else in it stays put. */
const shuffle = (word: string) => {
	const chars = [...word];
	const pool = chars.filter(isLetter);

	for (let index = pool.length - 1; index > 0; index--) {
		const other = Math.floor(Math.random() * (index + 1));

		[pool[index], pool[other]] = [pool[other] as string, pool[index] as string];
	}

	let next = 0;

	return chars.map((char) => (isLetter(char) ? pool[next++] : char)).join("");
};

/**
 * The letters still to settle, shuffled within each word: a word keeps about its width, so
 * lines break where the final words do and a paragraph never grows a line. Spaces, digits
 * and punctuation stay put.
 */
const noise = (rest: string) => rest.split(/(\s+)/).map(shuffle).join("");

// Quick start, slow finish, like the logo's settle.
const outExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/** Ends a scramble still running, on its final words. Call it before taking a snapshot. */
export function settle() {
	stop?.();
}

/** Every text inside these elements, recorded as blank: playing it scrambles them all in. */
export function blank(elements: Iterable<Element>): Snapshot {
	const texts: Snapshot = new Map();

	for (const element of elements) {
		for (const [node] of snapshot(element)) texts.set(node, "");
	}

	return texts;
}

/** How many lines a text takes (only its letters: an icon beside it is not a line). */
const lines = (node: Text) => {
	const range = document.createRange();

	range.selectNodeContents(node);

	return new Set([...range.getClientRects()].map(({ top }) => Math.round(top))).size;
};

/**
 * Shuffled letters are still not exactly as wide as the real ones (kerning, and a line
 * may be full to the last pixel), so lines could rewrap and push the page around. Each box
 * holding a changing text keeps the size of its final words until they settle, and a
 * one-line text stays on one line; returns the undo.
 */
function hold(nodes: Text[]) {
	const boxes = new Map<HTMLElement, Text[]>();

	for (const node of nodes) {
		let box = node.parentElement;

		// An inline element's size comes from the box around it.
		while (box && ["inline", "contents"].includes(getComputedStyle(box).display))
			box = box.parentElement;
		if (box) boxes.set(box, [...(boxes.get(box) ?? []), node]);
	}

	// Measure everything first, then write, so no box is measured with another one held.
	const sizes = [...boxes].map(([box, texts]) => {
		const { height, width } = box.getBoundingClientRect();

		return {
			box,
			height,
			width,
			single: texts.every((text) => lines(text) === 1),
			before: [box.style.width, box.style.height, box.style.getPropertyValue("text-wrap-mode")],
		};
	});

	for (const { box, height, single, width } of sizes) {
		box.style.width = `${width}px`;
		box.style.height = `${height}px`;
		// Only the wrapping: spacing written with several spaces keeps its width.
		if (single) box.style.setProperty("text-wrap-mode", "nowrap");
	}

	return () => {
		for (const { box, before } of sizes) {
			const [width = "", height = "", wrap = ""] = before;

			box.style.width = width;
			box.style.height = height;
			box.style.setProperty("text-wrap-mode", wrap);
		}
	};
}

/** Resolves once the words have settled (at once with reduced motion). */
export function play(before: Snapshot): Promise<void> {
	settle();

	const changed = [...before].flatMap(([node, old]) => {
		const text = node.nodeValue ?? "";

		return node.isConnected && text !== old ? [{ node, text }] : [];
	});

	if (changed.length === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
		return Promise.resolve();

	const { promise, resolve } = Promise.withResolvers<void>();
	const held = hold(changed.map(({ node }) => node));

	// The words are settling: assistive tech should wait for the final ones.
	document.body.setAttribute("aria-busy", "true");

	const start = performance.now();
	let frame = 0;

	const finish = () => {
		cancelAnimationFrame(frame);
		for (const { node, text } of changed) node.nodeValue = text;
		held();
		document.body.removeAttribute("aria-busy");
		stop = undefined;
		resolve();
	};

	const step = (now: number) => {
		const progress = Math.min((now - start) / duration, 1);

		if (progress === 1) return finish();

		for (const { node, text } of changed) {
			const settled = Math.floor(outExpo(progress) * text.length);

			node.nodeValue = text.slice(0, settled) + noise(text.slice(settled));
		}

		frame = requestAnimationFrame(step);
	};

	stop = finish;
	frame = requestAnimationFrame(step);

	return promise;
}
