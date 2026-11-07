import { error } from "@sveltejs/kit";

import type { Post, PostSummary } from "#lib/blog/types.ts";

import { sanitizePost } from "#lib/server/sanitize.ts";
import { CMS_URL } from "$app/env/private";

type Fetch = typeof fetch;

interface Page<T> {
	docs: T[];
}

const SUMMARY_FIELDS = ["title", "slug", "excerpt", "publishedAt", "readingMinutes", "tags"]
	.map((field) => `select[${field}]=true`)
	.join("&");

async function cms<T>(fetcher: Fetch, path: string): Promise<T> {
	if (!CMS_URL) error(503, "CMS_URL is not set");

	const response = await fetcher(`${CMS_URL}/api${path}`).catch(() => null);

	if (!response?.ok) error(503, "The blog is unavailable right now");

	return response.json();
}

export async function listPosts(fetcher: Fetch, locale: string) {
	const { docs } = await cms<Page<PostSummary>>(
		fetcher,
		`/posts?locale=${locale}&depth=1&limit=100&sort=-publishedAt&${SUMMARY_FIELDS}`
	);

	return docs;
}

export async function findPost(fetcher: Fetch, locale: string, slug: string) {
	const query = `where[slug][equals]=${encodeURIComponent(slug)}`;
	const { docs } = await cms<Page<Post>>(
		fetcher,
		`/posts?locale=${locale}&depth=1&limit=1&${query}`
	);

	return docs[0] && { ...docs[0], html: sanitizePost(docs[0].html) };
}

export async function findOlderPost(fetcher: Fetch, locale: string, publishedAt: string) {
	const query = `where[publishedAt][less_than]=${encodeURIComponent(publishedAt)}`;
	const { docs } = await cms<Page<PostSummary>>(
		fetcher,
		`/posts?locale=${locale}&depth=1&limit=1&sort=-publishedAt&${SUMMARY_FIELDS}&${query}`
	);

	return docs[0];
}

export async function findRedirect(fetcher: Fetch, path: string) {
	const query = `where[from][equals]=${encodeURIComponent(path)}`;
	const { docs } = await cms<Page<{ to?: { url?: string } }>>(
		fetcher,
		`/redirects?limit=1&${query}`
	);

	return docs[0]?.to?.url;
}
