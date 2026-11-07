import type { Snippet } from "svelte";

export interface Props {
	id: string;
	label: string;
	eyebrow?: string;
	title: string;
	punchline?: string;
	lede?: string;
	action: { href: string; text: string };
	children?: Snippet;
}
