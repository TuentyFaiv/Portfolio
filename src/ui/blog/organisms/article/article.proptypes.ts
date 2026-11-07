import type { Heading, Post, PostSummary } from "#lib/blog/types.ts";

export interface Props {
	post: Post;
	headings: Heading[];
	next?: PostSummary;
}
