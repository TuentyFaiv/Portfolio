/// <reference types="vitest/config" />

import path from "node:path";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import adapter from "@sveltejs/adapter-cloudflare";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
			},
			inspector: true,
			adapter: adapter(),
			csp: {
				mode: "auto",
				directives: {
					"default-src": ["self"],
					"script-src": [
						"self",
						"strict-dynamic",
						"unsafe-inline",
						"https:",
						"https://static.cloudflareinsights.com/beacon.min.js",
					],
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
					"script-src": [
						"self",
						"strict-dynamic",
						"unsafe-inline",
						"https:",
						"https://static.cloudflareinsights.com/beacon.min.js",
					],
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
		}),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/logic/paraglide",
			emitTsDeclarations: true,
		}),
	],
	test: {
		expect: {
			requireAssertions: true,
		},
		projects: [
			{
				extends: "./vite.config.ts",
				test: {
					name: "client",
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [
							{
								browser: "chromium",
								headless: true,
							},
						],
					},
					include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
					exclude: ["src/lib/server/**"],
				},
			},
			{
				extends: "./vite.config.ts",
				test: {
					name: "server",
					environment: "node",
					include: ["src/**/*.{test,spec}.{js,ts}"],
					exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
				},
			},
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({
						configDir: path.join(import.meta.dirname, ".storybook"),
					}),
				],
				test: {
					name: "storybook",
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [
							{
								browser: "chromium",
							},
						],
					},
				},
			},
		],
	},
});
