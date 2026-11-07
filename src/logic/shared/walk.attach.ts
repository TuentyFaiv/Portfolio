import { prefersReducedMotion } from "svelte/motion";

import type { Attachment } from "svelte/attachments";

export const walk: Attachment<HTMLElement> = (element) => {
	if (prefersReducedMotion.current) return;

	element.dataset.walk = "ready";

	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry?.isIntersecting) return;

			element.dataset.walk = "on";
			observer.disconnect();
		},
		{ threshold: 0.35 }
	);

	observer.observe(element);

	return () => observer.disconnect();
};
