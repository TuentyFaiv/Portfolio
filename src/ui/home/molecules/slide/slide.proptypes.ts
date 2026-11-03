import type { Snippet } from "svelte";
import type { SlideId } from "#utils/slides.ts";

export interface Props {
	id: SlideId;
	children?: Snippet;
}
