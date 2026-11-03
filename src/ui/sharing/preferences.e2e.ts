import { expect, test } from "@playwright/test";

const noAppCode = "**/_app/**";

test.describe("theme", () => {
	test("follows a dark system before any app code loads", async ({ browser }) => {
		const context = await browser.newContext({ colorScheme: "dark" });
		const page = await context.newPage();

		await page.route(noAppCode, (route) => route.abort());
		await page.goto("http://localhost:4173/");

		await expect(page.locator("html")).toHaveClass(/dark/);
		await context.close();
	});

	test("follows a light system before any app code loads", async ({ browser }) => {
		const context = await browser.newContext({ colorScheme: "light" });
		const page = await context.newPage();

		await page.route(noAppCode, (route) => route.abort());
		await page.goto("http://localhost:4173/");

		await expect(page.locator("html")).not.toHaveClass(/dark/);
		await context.close();
	});

	test("a saved choice beats the system and survives a reload", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" });
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		await page.locator(".themeswitch").click();
		await expect(page.locator("html")).not.toHaveClass(/dark/);

		await page.route(noAppCode, (route) => route.abort());
		await page.reload();

		await expect(page.locator("html")).not.toHaveClass(/dark/);
	});

	test("follows the system when it changes during a visit", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "light" });
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		await page.emulateMedia({ colorScheme: "dark" });

		await expect(page.locator("html")).toHaveClass(/dark/);
	});

	test("native controls and scrollbars match the theme", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" });
		await page.goto("/");

		await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
	});
});

test.describe("language", () => {
	test("uses the browser language on a first visit", async ({ browser }) => {
		const context = await browser.newContext({ locale: "es-MX" });
		const page = await context.newPage();

		await page.goto("http://localhost:4173/");

		await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
		await expect(page.getByRole("heading", { level: 1 })).toContainText("Soy Tonalli");
		await context.close();
	});

	for (const locale of ["es-ES", "es-AR", "es-CO"]) {
		test(`gives Spanish to ${locale} visitors too`, async ({ browser }) => {
			const context = await browser.newContext({ locale });
			const page = await context.newPage();

			await page.goto("http://localhost:4173/");

			await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
			await context.close();
		});
	}

	test("gives American English to en-GB visitors", async ({ browser }) => {
		const context = await browser.newContext({ locale: "en-GB" });
		const page = await context.newPage();

		await page.goto("http://localhost:4173/");

		await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
		await context.close();
	});

	test("falls back to English for an unsupported language", async ({ browser }) => {
		const context = await browser.newContext({ locale: "ja-JP" });
		const page = await context.newPage();

		await page.goto("http://localhost:4173/");

		await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
		await context.close();
	});

	test("a saved choice beats the browser language", async ({ browser }) => {
		const context = await browser.newContext({ locale: "es-MX" });

		await context.addCookies([
			{ name: "PARAGLIDE_LOCALE", value: "en", url: "http://localhost:4173" },
		]);

		const page = await context.newPage();

		await page.goto("http://localhost:4173/");

		await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
		await context.close();
	});

	test("tells caches the page depends on the language", async ({ request }) => {
		const response = await request.get("/", { headers: { "accept-language": "es" } });

		expect(response.headers().vary?.toLowerCase()).toContain("accept-language");
	});
});

test.describe("motion", () => {
	test.use({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });

	test("the logo never scrambles", async ({ page }) => {
		await page.goto("/");

		await page.locator(".header__logo").hover();
		await expect(page.locator(".header__logo")).toHaveText("tuentyfaiv", { timeout: 50 });
	});

	test("the language toggle and socials change with no transition", async ({ page }) => {
		await page.goto("/");

		const social = page.locator(".header__socials--reveal .header__social").first();

		await expect(social).toHaveCSS("transition-duration", "0s");
		await expect(page.locator(".header__actions .language")).toHaveCSS("transition-duration", "0s");
	});
});

test.describe("contrast", () => {
	test.use({ contrast: "more" });

	test("muted text becomes full contrast", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" });
		await page.goto("/");

		const text = page.locator(".intro__lede--long");
		const foreground = await page.locator("body").evaluate((el) => getComputedStyle(el).color);

		await page.setViewportSize({ width: 1440, height: 900 });
		await expect(text).toHaveCSS("color", foreground);
	});
});

test("forced colors keep the headline readable", async ({ page }) => {
	await page.emulateMedia({ forcedColors: "active" });
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/");

	await expect(page.locator(".intro__title")).not.toHaveCSS("color", "rgba(0, 0, 0, 0)");
	await expect(page.locator(".intro__title")).toHaveCSS("background-image", "none");
});
