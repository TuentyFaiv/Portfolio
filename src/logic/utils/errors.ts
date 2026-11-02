import type { HandleServerError } from "@sveltejs/kit/hooks";

type Failure = Parameters<HandleServerError>[0];

function describe(error: unknown) {
	if (error instanceof Error) {
		return { name: error.name, message: error.message, stack: error.stack };
	}

	return { name: "NonError", message: String(error) };
}

/**
 * Logs 5xx failures as objects so Workers Logs can filter on their fields.
 * 4xx answers are normal traffic (bots asking for /wp-login), so they stay out.
 * Query strings, cookies and headers are left out on purpose.
 */
export function logServerError(failure: Failure) {
	const { event, kind } = failure;
	const status = failure.kind === "unknown" ? 500 : failure.error.status;

	if (status < 500) return;

	console.error({
		message: "request failed",
		kind,
		status,
		method: event.request.method,
		route: event.route.id,
		path: event.url.pathname,
		error:
			failure.kind === "unknown" ? describe(failure.error) : { message: failure.error.message },
	});
}
