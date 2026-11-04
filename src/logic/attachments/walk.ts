import type { Attachment } from "svelte/attachments";

/**
 * Lights a list's rows one after another, once, the first time it comes into view. The
 * timing lives in CSS: this only says when. Without JS, or with reduced motion, nothing
 * here runs and every row is simply lit.
 *
 * `data-walk` is "ready" (waiting, rows dimmed) until the list is in view, then "on".
 */
export const walk: Attachment<HTMLElement> = (element) => {
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	element.dataset.walk = "ready";

	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry?.isIntersecting) return;

			element.dataset.walk = "on";
			observer.disconnect();
		},
		// A third in view: the slide is arriving, not just peeking in.
		{ threshold: 0.35 }
	);

	observer.observe(element);

	return () => observer.disconnect();
};
