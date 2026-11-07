import type { Attachment } from "svelte/attachments";

export const copyable: Attachment<HTMLElement> = (element) => {
	if (window.isSecureContext && typeof navigator.clipboard?.writeText === "function") {
		element.hidden = false;
	}
};
