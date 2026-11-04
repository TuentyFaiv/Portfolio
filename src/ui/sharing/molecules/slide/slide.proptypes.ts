import type { Snippet } from "svelte";

export interface Props {
	id: string;
	label: string;
	children?: Snippet;
}
