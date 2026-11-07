import { prefersReducedMotion } from "svelte/motion";

const duration = 520;

let stop: (() => void) | undefined;

type Snapshot = Map<Text, string>;

export const onScreen = (element: Element) => {
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

// Each word keeps about its width while scrambled, so lines never reflow.
const noise = (rest: string) => rest.split(/(\s+)/).map(shuffle).join("");

const outExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

export function settle() {
	stop?.();
}

export const blank = (elements: Iterable<Element>): Snapshot =>
	new Map(
		[...elements].flatMap((element) => [...snapshot(element).keys()].map((node) => [node, ""]))
	);

const lines = (node: Text) => {
	const range = document.createRange();

	range.selectNodeContents(node);

	return new Set([...range.getClientRects()].map(({ top }) => Math.round(top))).size;
};

function hold(nodes: Text[]) {
	const boxes = Map.groupBy(nodes, (node) => {
		let box = node.parentElement;

		while (box && ["inline", "contents"].includes(getComputedStyle(box).display))
			box = box.parentElement;

		return box;
	});

	boxes.delete(null);

	const sizes = [...(boxes as Map<HTMLElement, Text[]>)].map(([box, texts]) => {
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

export function play(before: Snapshot): Promise<void> {
	settle();

	const changed = [...before].flatMap(([node, old]) => {
		const text = node.nodeValue ?? "";

		return node.isConnected && text !== old ? [{ node, text }] : [];
	});

	if (changed.length === 0 || prefersReducedMotion.current) return Promise.resolve();

	const { promise, resolve } = Promise.withResolvers<void>();
	const held = hold(changed.map(({ node }) => node));

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
