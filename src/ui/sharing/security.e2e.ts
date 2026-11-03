import { expect, test } from "@playwright/test";

const documentHeaders = {
	"cross-origin-opener-policy": "same-origin",
	"referrer-policy": "strict-origin-when-cross-origin",
	"x-content-type-options": "nosniff",
	"x-frame-options": "DENY",
};

test("every page sends the baseline security headers", async ({ request }) => {
	for (const path of ["/", "/story", "/blog", "/missing"]) {
		const headers = (await request.get(path)).headers();

		expect(headers).toMatchObject(documentHeaders);
		expect(headers["permissions-policy"]).toContain("camera=()");
		expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
		expect(headers["content-security-policy"]).toContain("object-src 'none'");
	}
});

test("static files cannot be sniffed into another type", async ({ request }) => {
	const headers = (await request.get("/robots.txt")).headers();

	expect(headers["x-content-type-options"]).toBe("nosniff");
});

test("no inline styles are allowed in production", async ({ request }) => {
	const csp = (await request.get("/")).headers()["content-security-policy"] ?? "";
	const styles = csp.split(";").find((directive) => directive.trim().startsWith("style-src"));

	expect(styles).not.toContain("unsafe-inline");
	expect(csp).not.toMatch(/img-src[^;]*https:/);
});

test("the site runs under the CSP with no violations", async ({ page }) => {
	const violations: string[] = [];

	await page.addInitScript(() => {
		document.addEventListener("securitypolicyviolation", (event) => {
			console.error(`CSP blocked ${event.violatedDirective}: ${event.sample || event.blockedURI}`);
		});
	});
	page.on("console", (message) => {
		if (/CSP|Content Security Policy/.test(message.text())) violations.push(message.text());
	});

	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/");
	await page.waitForLoadState("networkidle");
	await page.locator(".themeswitch").click();
	await page.locator(".header__logo").hover();
	await page.locator(".header__list").getByRole("link", { name: "Story" }).click();
	await expect(page).toHaveURL("/story");
	await page.locator(".header__list").getByRole("link", { name: "Blog" }).click();
	await expect(page).toHaveURL("/blog");
	await page.waitForLoadState("networkidle");
	await page.locator(".header__actions .language").click();
	await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");

	expect(violations).toEqual([]);
});

test("the route announcer stays visually hidden", async ({ page }) => {
	await page.goto("/");
	await page.waitForLoadState("networkidle");
	await page.locator(".header__list").getByRole("link", { name: "Story" }).click();

	const announcer = page.locator("#svelte-announcer");

	await expect(announcer).toHaveCSS("position", "absolute");
	await expect(announcer).toHaveCSS("width", "1px");
});

test("the logo loads with no redirect", async ({ request }) => {
	for (const file of ["/logo-3x.webp", "/logo-dark-3x.webp"]) {
		const response = await request.get(file, { maxRedirects: 0 });

		expect(response.status()).toBe(200);
	}
});

test.describe
	.serial("csp report endpoint", () => {
		const report = {
			data: JSON.stringify({ "csp-report": { "blocked-uri": "https://example.com" } }),
			headers: { "content-type": "application/csp-report", origin: "http://localhost:4173" },
		};

		test("accepts a real report", async ({ request }) => {
			expect((await request.post("/api/csp-report", report)).status()).toBe(204);
		});

		test("rejects an oversized body", async ({ request }) => {
			const response = await request.post("/api/csp-report", {
				...report,
				data: "x".repeat(20_000),
			});

			expect(response.status()).toBe(413);
		});

		test("rejects a broken body", async ({ request }) => {
			const response = await request.post("/api/csp-report", { ...report, data: "not json" });

			expect(response.status()).toBe(400);
		});
	});
