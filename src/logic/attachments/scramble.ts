import type { Attachment } from "svelte/attachments";

/**
 * Scrambles an element from its current text to `text`.
 * The element's text belongs to this attachment after hydration, so render the
 * first value as static markup and let the attachment handle every change.
 */
export function scrambleTo(text: string, chars = "A-Z"): Attachment<HTMLElement> {
	return (element) => {
		if (element.textContent === text) return;

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			element.textContent = text;
			return;
		}

		let cancel: (() => void) | undefined;
		let detached = false;

		// Loaded on the first change, so phones that never swipe never download it.
		import("animejs").then(({ animate, scrambleText }) => {
			if (detached) return;

			const animation = animate(element, {
				innerHTML: scrambleText({ text, chars, ease: "outExpo", settleDuration: 280 }),
			});

			cancel = () => animation.cancel();
		});

		return () => {
			detached = true;
			cancel?.();
		};
	};
}
