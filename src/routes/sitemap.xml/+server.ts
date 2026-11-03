import type { RequestHandler } from "./$types";

import config from "#config";

export const prerender = true;

const paths = ["/", "/story", "/blog"];

export const GET: RequestHandler = () => {
	const urls = paths.map((path) => `<url><loc>${config.url}${path}</loc></url>`).join("");

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
		{ headers: { "content-type": "application/xml" } }
	);
};
