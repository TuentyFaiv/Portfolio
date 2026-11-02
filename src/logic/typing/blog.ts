export interface Tag {
	title: string;
	slug: string;
}

export interface PostSummary {
	id: number;
	title: string;
	slug: string;
	excerpt: string;
	publishedAt: string;
	readingMinutes: number;
	tags: Tag[];
}

export interface Post extends PostSummary {
	html: string;
	meta?: {
		title?: string | null;
		description?: string | null;
		image?: { url?: string } | null;
	};
}

export interface Heading {
	id: string;
	text: string;
}
