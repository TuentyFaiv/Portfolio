import { sequence } from "@sveltejs/kit/hooks";

import type { Handle, HandleServerError } from "@sveltejs/kit/hooks";

import { getTextDirection } from "#lib/paraglide/runtime.js";
import { paraglideMiddleware } from "#lib/paraglide/server.js";
import { logServerError } from "#lib/server/errors.ts";
import { languages } from "#lib/text/languages.ts";

// CSP lives in vite.config.ts; HSTS is set on the Cloudflare zone.
const securityHeaders = {
	"Cross-Origin-Opener-Policy": "same-origin",
	"Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY",
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, async ({ request, locale }) => {
		const response = await resolve(
			{ ...event, request },
			{
				// The headline font is the LCP: preload it instead of waiting for the stylesheet.
				preload: ({ path, type }) =>
					type === "js" ||
					type === "css" ||
					(type === "font" && path.includes("latin-wght-normal")),
				transformPageChunk: ({ html }) =>
					html
						.replace("%paraglide.lang%", languages[locale].tag)
						.replace("%paraglide.dir%", getTextDirection(locale)),
			}
		);

		if (response.headers.get("content-type")?.startsWith("text/html")) {
			response.headers.set("Content-Language", languages[locale].tag);
			response.headers.append("Vary", "Accept-Language, Cookie");
		}

		return response;
	});

// Browsers ignore CSP report-to without this header.
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
