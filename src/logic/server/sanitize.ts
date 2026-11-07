import sanitize from "sanitize-html";

// Allowlisted so a CMS account takeover can't become script on the site.
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
