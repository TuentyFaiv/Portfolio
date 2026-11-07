import { m } from "#lib/paraglide/messages.js";

const ids = ["intro", "projects", "story", "stack", "blog", "contact"] as const;

export type SlideId = (typeof ids)[number];

export const slides = ids.map((id) => ({ id, label: m[`translation:deck.${id}`] }));
