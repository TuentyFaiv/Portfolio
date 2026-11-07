import { describe, expect, it } from "vitest";

import { jsonLd } from "./json-ld.ts";

describe("structured data", () => {
	it("is a JSON-LD script with the schema.org context", () => {
		const html = jsonLd({ "@type": "WebSite", name: "tuentyfaiv" });
		const json = html.replace('<script type="application/ld+json">', "").replace("</script>", "");

		expect(html.startsWith('<script type="application/ld+json">')).toBe(true);
		expect(JSON.parse(json)).toEqual({
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: "tuentyfaiv",
		});
	});

	it("never lets a value close the script element", () => {
		const html = jsonLd({ name: "</script><script>alert(1)</script>" });

		expect(html.indexOf("</script>")).toBe(html.length - "</script>".length);
		expect(html).toContain("\\u003c/script>");
	});
});
