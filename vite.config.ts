/// <reference types="vitest/config" />

import path from "node:path";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import adapter from "@sveltejs/adapter-cloudflare";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

import type { Config } from "@sveltejs/kit/vite";

type CspDirectives = NonNullable<NonNullable<Config["csp"]>["directives"]>;

/**
 * Vite injects style tags while developing; production only loads stylesheets. The one
 * style attribute left is SvelteKit's route announcer, allowed by its exact hash. If a
 * Kit update changes it, "the site runs under the CSP" in security.e2e.ts fails.
 */
const styles = (command: string): CspDirectives =>
	command === "serve"
		? { "style-src": ["self", "unsafe-inline"] }
		: {
				"style-src": ["self"],
				"style-src-attr": ["unsafe-hashes", "sha256-S8qMpvofolR8Mpjy4kQvEm7m1q8clzU4dfDH0AmvZjo="],
			};

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(({ command }) => ({
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
			// One round trip less on phones: the stylesheet arrives inside the page.
			inlineStyleThreshold: 64_000,
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
					"img-src": ["self", "data:"],
					...styles(command),
					"frame-ancestors": ["none"],
					"form-action": ["self"],
					"connect-src": ["self"],
					// The nebula's renderer thread, from this site only.
					"worker-src": ["self"],
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
					"img-src": ["self", "data:"],
					...styles(command),
					"frame-ancestors": ["none"],
					"form-action": ["self"],
					"connect-src": ["self"],
					// The nebula's renderer thread, from this site only.
					"worker-src": ["self"],
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
			// A saved choice wins, then the visitor's browser language.
			strategy: ["cookie", "preferredLanguage", "globalVariable", "baseLocale"],
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
}));
