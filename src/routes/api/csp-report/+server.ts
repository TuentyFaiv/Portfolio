import type { RequestHandler } from "@sveltejs/kit";

import { readUpTo } from "#lib/server/body.server.ts";
import { env } from "cloudflare:workers";

const MAX_BYTES = 16_384;
const MAX_REPORTS = 10;

// Accepts legacy report-uri (application/csp-report) and report-to (application/reports+json).
export const POST: RequestHandler = async ({ request }) => {
	if (Number(request.headers.get("content-length")) > MAX_BYTES) {
		return new Response(null, { status: 413 });
	}

	// One shared key: Cloudflare advises against rate limiting by IP.
	const { success } = await env.CSP_REPORT_LIMIT.limit({ key: "csp-report" });

	if (!success) return new Response(null, { status: 429 });

	const body = await readUpTo(request, MAX_BYTES);

	if (body === null) return new Response(null, { status: 413 });

	let payload: unknown;

	try {
		payload = body ? JSON.parse(body) : undefined;
	} catch (err) {
		console.warn({ message: "invalid csp report", error: String(err) });
		return Response.json({ ok: false }, { status: 400 });
	}

	const reports = payload === undefined ? [] : Array.isArray(payload) ? payload : [payload];

	for (const report of reports.slice(0, MAX_REPORTS)) {
		console.warn({ message: "csp violation", report });
	}

	return new Response(null, { status: 204 });
};
