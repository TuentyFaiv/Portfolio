import type { Attachment } from "svelte/attachments";

/**
 * Shows an element that the server rendered `hidden`, only where the page can write to the
 * clipboard. Without JS, or outside a secure context, it stays hidden and the mail link
 * next to it still works.
 */
export const copyable: Attachment<HTMLElement> = (element) => {
	if (window.isSecureContext && typeof navigator.clipboard?.writeText === "function") {
		element.hidden = false;
	}
};
