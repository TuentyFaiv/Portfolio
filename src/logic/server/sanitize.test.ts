import { describe, expect, it } from "vitest";

import { sanitizePost } from "./sanitize.ts";

describe("sanitizePost", () => {
	it.each([
		["script tags", "<p>ok</p><script>alert(1)</script>", "<p>ok</p>"],
		["event handlers", '<p onclick="alert(1)">ok</p>', "<p>ok</p>"],
		[
			"image handlers",
			'<img src="https://a.b/c.png" onerror="alert(1)">',
			'<img src="https://a.b/c.png" />',
		],
		[
			"javascript links",
			'<a href="javascript:alert(1)">x</a>',
			'<a rel="noopener noreferrer">x</a>',
		],
		["data links", '<a href="data:text/html,x">x</a>', '<a rel="noopener noreferrer">x</a>'],
		["iframes", '<iframe src="https://evil.test"></iframe><p>ok</p>', "<p>ok</p>"],
		["style tags", "<style>body{display:none}</style><p>ok</p>", "<p>ok</p>"],
		["style attributes", '<p style="position:fixed">ok</p>', "<p>ok</p>"],
		["svg scripts", "<svg><script>alert(1)</script></svg><p>ok</p>", "<p>ok</p>"],
		["forms", '<form action="https://evil.test"><input name="x"></form><p>ok</p>', "<p>ok</p>"],
		["http images", '<img src="http://a.b/c.png">', "<img />"],
	])("removes %s", (_, dirty, clean) => {
		expect(sanitizePost(dirty)).toBe(clean);
	});

	it("keeps what an article needs", () => {
		const article =
			'<h2>Title</h2><p><strong>Bold</strong> and <a href="https://a.b" rel="noopener noreferrer">link</a></p><pre><code class="language-ts">const a = 1;</code></pre>';

		expect(sanitizePost(article)).toBe(article);
	});

	it("forces a safe rel on links", () => {
		expect(sanitizePost('<a href="https://a.b" rel="follow">x</a>')).toContain(
			'rel="noopener noreferrer"'
		);
	});
});
