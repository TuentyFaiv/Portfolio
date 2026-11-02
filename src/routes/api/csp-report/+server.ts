import type { RequestHandler } from "@sveltejs/kit";

/**
 * CSP violation report endpoint.
 *
 * Accepts reports from two browser specs:
 * - Legacy `report-uri`: Content-Type `application/csp-report`
 *   Body shape: `{ "csp-report": { ... } }`
 * - Modern `report-to`:  Content-Type `application/reports+json`
 *   Body shape: `[ { "type": "csp-violation", "body": { ... } }, ... ]`
 *
 * Reports are logged as objects so Workers Logs can filter on their fields.
 */
export const POST: RequestHandler = async ({ request }) => {
	const contentType = request.headers.get("content-type") ?? "";

	let reports: unknown[] = [];

	try {
		if (contentType.includes("application/reports+json")) {
			const payload = await request.json();
			reports = Array.isArray(payload) ? payload : [payload];
		} else if (
			contentType.includes("application/csp-report") ||
			contentType.includes("application/json")
		) {
			const payload = await request.json();
			reports = [payload];
		} else {
			// Some browsers (older Safari/Firefox) may not set the content type.
			const text = await request.text();
			if (text) reports = [JSON.parse(text)];
		}
	} catch (err) {
		console.warn({ message: "invalid csp report", error: String(err) });
		return Response.json({ ok: false }, { status: 400 });
	}

	for (const report of reports) {
		console.warn({ message: "csp violation", report });
	}

	// 204 = accepted, no content. Browsers don't care about the response body.
	return new Response(null, { status: 204 });
};
