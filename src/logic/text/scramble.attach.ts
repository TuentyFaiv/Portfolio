import { prefersReducedMotion } from "svelte/motion";

import type { Attachment } from "svelte/attachments";

export function scrambleTo(text: string, chars = "A-Z"): Attachment<HTMLElement> {
	return (element) => {
		if (element.textContent === text) return;

		if (prefersReducedMotion.current) {
			element.textContent = text;
			return;
		}

		let cancel: (() => void) | undefined;
		let detached = false;

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
