import type { Snippet } from "svelte";

export interface DeckSlide {
	id: string;
	label: () => string;
}

export interface Props {
	slides: readonly DeckSlide[];
	children: Snippet;
}
