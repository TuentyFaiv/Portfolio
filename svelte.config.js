import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	vitePlugin: {
		inspector: true,
	},
	kit: {
		adapter: adapter(),
		csp: {
			mode: "auto",
			directives: {
				"script-src": ["self", "strict-dynamic", "unsafe-inline", "https:"],
				"style-src": ["self", "unsafe-inline"],
				"object-src": ["none"],
				"base-uri": ["self"],
			},
			reportOnly: {
				"script-src": ["self", "strict-dynamic", "unsafe-inline", "https:"],
				"style-src": ["self", "unsafe-inline"],
				"object-src": ["none"],
				"base-uri": ["self"],
				"report-to": ["self"],
				"report-uri": ["self"],
			}
		},
		alias: {
			// Assets
			"@images/*": "src/assets/images/*",
			"@icons/*": "src/assets/icons/*",
			// Logic
			"@config": "src/logic/config.ts",
			"@stores": "src/logic/stores/index.ts",
			"@actions": "src/logic/actions/index.ts",
			"@schemas/*": "src/logic/schemas/*",
			"@services/*": "src/logic/services/*",
			"@typing/*": "src/logic/typing/*",
			"@utils/*": "src/logic/utils/*",
			// UI Home
			"@home/atoms": "src/ui/home/atoms/index.ts",
			"@home/molecules": "src/ui/home/molecules/index.ts",
			"@home/organisms": "src/ui/home/organisms/index.ts",
			"@home/styles": "src/ui/home/styles/index.ts",
			/* NEXT_ALIAS */
			// UI Sharing
			"@sharing/atoms": "src/ui/sharing/atoms/index.ts",
			"@sharing/molecules": "src/ui/sharing/molecules/index.ts",
			"@sharing/organisms": "src/ui/sharing/organisms/index.ts",
			"@styles": "src/ui/sharing/styles/index.ts",
		}
	}
};
export default config;