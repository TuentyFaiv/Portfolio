import type { Snippet } from "svelte";

export interface DeckSlide {
	id: string;
	/** A function, so the label follows the current language. */
	label: () => string;
}

export interface Props {
	slides: readonly DeckSlide[];
	children: Snippet;
}
