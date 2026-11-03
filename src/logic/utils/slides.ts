import { m } from "#lib/paraglide/messages.js";

export const slides = [
	{ id: "intro", label: m["translation:deck.intro"] },
	{ id: "projects", label: m["translation:deck.projects"] },
	{ id: "story", label: m["translation:deck.story"] },
	{ id: "stack", label: m["translation:deck.stack"] },
	{ id: "blog", label: m["translation:deck.blog"] },
	{ id: "contact", label: m["translation:deck.contact"] },
] as const;

export type SlideId = (typeof slides)[number]["id"];
