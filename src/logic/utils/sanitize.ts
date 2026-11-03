import sanitize from "sanitize-html";

/**
 * The CMS is trusted, but an account takeover there must not become script on this
 * site, so article HTML passes through this allowlist before `{@html}` renders it.
 */
const policy: sanitize.IOptions = {
	allowedTags: [
		"h2",
		"h3",
		"h4",
		"p",
		"a",
		"ul",
		"ol",
		"li",
		"blockquote",
		"pre",
		"code",
		"strong",
		"em",
		"s",
		"u",
		"br",
		"hr",
		"img",
		"figure",
		"figcaption",
		"table",
		"thead",
		"tbody",
		"tr",
		"th",
		"td",
		"span",
	],
	allowedAttributes: {
		a: ["href", "rel", "target"],
		img: ["src", "alt", "width", "height", "loading"],
		code: ["class"],
		pre: ["class"],
		span: ["class"],
	},
	allowedClasses: { code: ["language-*"], pre: ["language-*"], span: ["hljs-*"] },
	allowedSchemes: ["http", "https", "mailto"],
	allowedSchemesByTag: { img: ["https"] },
	allowProtocolRelative: false,
	transformTags: {
		a: sanitize.simpleTransform("a", { rel: "noopener noreferrer" }),
	},
};

export const sanitizePost = (html: string) => sanitize(html, policy);
