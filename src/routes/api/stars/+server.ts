import type { RequestHandler } from "@sveltejs/kit";

import { isFinderId } from "#lib/projects/finder.ts";
import { readUpTo } from "#lib/server/body.server.ts";
import { env } from "cloudflare:workers";

const MAX_BYTES = 256;

const TABLE = `CREATE TABLE IF NOT EXISTS finders (
	id TEXT PRIMARY KEY,
	found_on TEXT NOT NULL
)`;

// Count: wrangler d1 execute portfolio-finders --remote --command "SELECT count(*) FROM finders"
export const POST: RequestHandler = async ({ request, url }) => {
	if (request.headers.get("origin") !== url.origin) return new Response(null, { status: 403 });
	if (!request.headers.get("content-type")?.startsWith("application/json")) {
		return new Response(null, { status: 415 });
	}
	if (Number(request.headers.get("content-length")) > MAX_BYTES) {
		return new Response(null, { status: 413 });
	}

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
