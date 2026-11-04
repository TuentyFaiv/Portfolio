import type { Snippet } from "svelte";

export interface Props {
	id: string;
	label: string;
	eyebrow: string;
	title: string;
	/** A second line of the title, on its own line. */
	punchline?: string;
	lede?: string;
	/** Where the full page lives. */
	action: { href: string; text: string };
	/** Anything between the heading and the action, like a list of shortcuts. */
	children?: Snippet;
}
