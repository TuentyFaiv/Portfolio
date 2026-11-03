import { sequence } from "@sveltejs/kit/hooks";

import type { Handle, HandleServerError } from "@sveltejs/kit/hooks";

import { getTextDirection } from "#lib/paraglide/runtime.js";
import { paraglideMiddleware } from "#lib/paraglide/server.js";
import { logServerError } from "#utils/errors.ts";
import { languages } from "#utils/languages.ts";

/**
 * Baseline from the OWASP HTTP Headers Cheat Sheet. CSP lives in the Vite config and
 * HSTS in the Cloudflare zone, which covers the whole domain.
 */
const securityHeaders = {
	"Cross-Origin-Opener-Policy": "same-origin",
	"Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY",
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) =>
		resolve(
			{ ...event, request },
			{
				// The headline is the largest paint, so its font cannot wait for the stylesheet.
				preload: ({ path, type }) =>
					type === "js" ||
					type === "css" ||
					(type === "font" && path.includes("latin-wght-normal")),
				transformPageChunk: ({ html }) =>
					html
						.replace("%paraglide.lang%", languages[locale].tag)
						.replace("%paraglide.dir%", getTextDirection(locale)),
			}
		)
	);

/**
 * Declare the reporting endpoint group used by CSP's `report-to` directive.
 * Without this header, browsers ignore `report-to` entirely.
 */
const handleReportingEndpoints: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set("Reporting-Endpoints", `csp-endpoint="${event.url.origin}/api/csp-report"`);

	return response;
};

const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	for (const [name, value] of Object.entries(securityHeaders)) {
		response.headers.set(name, value);
	}

	return response;
};

export const handle: Handle = sequence(
	handleParaglide,
	handleReportingEndpoints,
	handleSecurityHeaders
);

export const handleError: HandleServerError = logServerError;
