import { defineConfig, devices } from "@playwright/test";

const flood = "**/flood.e2e.ts";
const testIgnore = flood;

export default defineConfig({
	webServer: { command: "npm run build && npm run preview", port: 4173 },
	testMatch: "**/*.e2e.{ts,js}",
	use: { baseURL: "http://localhost:4173" },
	projects: [
		{
			name: "chromium",
			testIgnore,
			use: {
				...devices["Desktop Chrome"],
				// The real GPU on macOS, so the live nebula is tested as visitors see it.
				launchOptions: {
					args: process.platform === "darwin" ? ["--use-angle=metal", "--enable-gpu"] : [],
				},
			},
		},
		{ name: "firefox", testIgnore, use: { ...devices["Desktop Firefox"] } },
		{ name: "webkit", testIgnore, use: { ...devices["Desktop Safari"] } },
		// Uses up the shared rate limit, so it can only run once the browsers are done.
		{
			name: "flood",
			testMatch: flood,
			dependencies: ["chromium", "firefox", "webkit"],
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
