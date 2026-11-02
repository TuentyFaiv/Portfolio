import type { Heading, Post, PostSummary } from "#typing/blog.ts";

export interface Props {
	post: Post;
	headings: Heading[];
	next?: PostSummary;
}
