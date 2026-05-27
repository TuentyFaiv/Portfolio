import adapter from "@sveltejs/adapter-cloudflare";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true),
	},
	vitePlugin: { inspector: true },
	kit: {
		adapter: adapter(),
		files: { lib: "src/logic" },
		csp: {
			mode: "auto",
			directives: {
				"default-src": ["self"],
				"script-src": ["self", "strict-dynamic", "unsafe-inline", "https:", "https://static.cloudflareinsights.com/beacon.min.js"],
				"img-src": ["self", "data:", "https:"],
				"style-src": ["self", "unsafe-inline"],
				"frame-ancestors": ["none"],
				"form-action": ["self"],
				"connect-src": ["self"],
				"object-src": ["none"],
				"base-uri": ["self"],
			},
			reportOnly: {
				"default-src": ["self"],
				"script-src": ["self", "strict-dynamic", "unsafe-inline", "https:", "https://static.cloudflareinsights.com/beacon.min.js"],
				"img-src": ["self", "data:", "https:"],
				"style-src": ["self", "unsafe-inline"],
				"frame-ancestors": ["none"],
				"form-action": ["self"],
				"connect-src": ["self"],
				"object-src": ["none"],
				"base-uri": ["self"],
				"report-to": ["csp-endpoint"],
				"report-uri": ["/api/csp-report"],
			},
		},
		alias: {
			"~images/*": "src/assets/images/*",
			"~icons/*": "src/assets/icons/*",
			"~config": "src/logic/config.ts",
			"~contexts/*": "src/logic/contexts/*",
			"~attach/*": "src/logic/attachments/*",
			"~schemas/*": "src/logic/schemas/*",
			"~services/*": "src/logic/services/*",
			"~typing/*": "src/logic/typing/*",
			"~utils/*": "src/logic/utils/*",
			"~home/*": "src/ui/home/*",
			"~sharing/*": "src/ui/sharing/*",
			"~styles": "src/ui/sharing/styles/index.ts",
			"~styles/*": "src/ui/sharing/styles/*",
		},
	},
};

export default config;
