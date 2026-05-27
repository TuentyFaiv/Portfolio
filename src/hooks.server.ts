import { getTextDirection } from "$lib/paraglide/runtime";
import { paraglideMiddleware } from "$lib/paraglide/server";
import { sequence } from "@sveltejs/kit/hooks";

import type { Handle } from "@sveltejs/kit";

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace("%paraglide.lang%", locale)
					.replace("%paraglide.dir%", getTextDirection(locale)),
		});
	});

/**
 * Declare the reporting endpoint group used by CSP's `report-to` directive.
 * Without this header, browsers ignore `report-to` entirely.
 */
const handleReportingEndpoints: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set("Reporting-Endpoints", `csp-endpoint="${event.url.origin}/api/csp-report"`);

	return response;
};

export const handle: Handle = sequence(handleParaglide, handleReportingEndpoints);
