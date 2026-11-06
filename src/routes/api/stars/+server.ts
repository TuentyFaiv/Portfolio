import type { RequestHandler } from "@sveltejs/kit";

import { isFinderId } from "#utils/finder.ts";
import { env } from "cloudflare:workers";

/** A finder id in JSON is about 50 bytes; anything much bigger is not from the page. */
const MAX_BYTES = 256;

/**
 * The body, read no further than max bytes: null past that. The content-length header
 * can be missing (a streamed body), so the reading itself keeps the limit.
 */
async function readUpTo(request: Request, max: number): Promise<string | null> {
	const reader = request.body?.getReader();

	if (!reader) return "";

	const chunks: Uint8Array[] = [];
	let size = 0;

	for (;;) {
		const { done, value } = await reader.read();

		if (done) break;
		size += value.byteLength;
		if (size > max) {
			await reader.cancel();
			return null;
		}
		chunks.push(value);
	}

	const bytes = new Uint8Array(size);
	let offset = 0;

	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}

	return new TextDecoder().decode(bytes);
}

/*
 * The table holds one row per browser that found every star: its random id and the day
 * (no time, no address, nothing about the visitor). Created on first use, so a new
 * database needs no migration step.
 */
const TABLE = `CREATE TABLE IF NOT EXISTS finders (
	id TEXT PRIMARY KEY,
	found_on TEXT NOT NULL
)`;

/**
 * Records that a browser found every star on the Projects slide. Private: nothing here
 * reads the count back. The same id twice counts once, so the count is of browsers, not
 * people (another browser, a private window or cleared storage counts again).
 *
 * Reading it (the first `wrangler deploy` creates the database):
 *
 *   npx wrangler d1 execute portfolio-finders --remote \
 *     --command "SELECT count(*) AS browsers FROM finders"
 *
 * By day: "SELECT found_on, count(*) AS browsers FROM finders GROUP BY found_on".
 */
export const POST: RequestHandler = async ({ request, url }) => {
	// Only the site's own page posts here.
	if (request.headers.get("origin") !== url.origin) return new Response(null, { status: 403 });
	if (!request.headers.get("content-type")?.startsWith("application/json")) {
		return new Response(null, { status: 415 });
	}
	if (Number(request.headers.get("content-length")) > MAX_BYTES) {
		return new Response(null, { status: 413 });
	}

	// One shared counter, like the CSP reports: a flood costs us counts, never a page.
	const { success } = await env.STARS_LIMIT.limit({ key: "stars" });

	if (!success) return new Response(null, { status: 429 });

	const body = await readUpTo(request, MAX_BYTES);

	if (body === null) return new Response(null, { status: 413 });

	let id: unknown;

	try {
		({ id } = JSON.parse(body) as { id?: unknown });
	} catch {
		return new Response(null, { status: 400 });
	}
	if (!isFinderId(id)) return new Response(null, { status: 400 });

	try {
		await env.FINDERS.batch([
			env.FINDERS.prepare(TABLE),
			env.FINDERS.prepare("INSERT OR IGNORE INTO finders (id, found_on) VALUES (?1, ?2)").bind(
				id,
				new Date().toISOString().slice(0, 10)
			),
		]);
	} catch (error) {
		console.warn({ message: "could not record a finder", error: String(error) });
		return new Response(null, { status: 503 });
	}

	return new Response(null, { status: 204 });
};
