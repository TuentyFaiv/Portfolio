import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

// A tap only works once the page is hydrated, so these tests wait for that first.
async function openHome(page: Page) {
	await page.goto("/");
	await page.waitForLoadState("networkidle");
}

const reveal = (page: Page) => page.locator(".header__socials--reveal");
const github = (page: Page) => reveal(page).getByRole("link", { name: "GitHub" });

test.describe("header socials, desktop", () => {
	test.use({ viewport: { width: 1280, height: 720 } });

	test("stay hidden until the logo is hovered, then reveal all three", async ({ page }) => {
		await openHome(page);
		await expect(github(page)).toHaveCSS("pointer-events", "none");

		await page.locator(".header__logo").hover();

		for (const name of ["GitHub", "LinkedIn", "X"]) {
			const item = reveal(page)
				.locator(".header__social")
				.filter({
					has: page.getByRole("link", { name, exact: true }),
				});
			await expect(item).toHaveCSS("opacity", "1");
		}
	});

	test("animate position and scale, not only opacity", async ({ page }) => {
		await openHome(page);

		const item = reveal(page).locator(".header__social").first();
		const closed = await item.evaluate((el) => getComputedStyle(el).translate);

		await page.locator(".header__logo").hover();
		await expect(item).toHaveCSS("translate", "0px");
		await expect(item).toHaveCSS("transition-property", /translate.*scale.*rotate/);
		expect(closed).not.toBe("0px");
	});

	test("reveal on keyboard focus and stay open while tabbing through", async ({
		browserName,
		page,
	}) => {
		await openHome(page);
		await page.locator(".header__logo").focus();
		await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");

		await expect(github(page)).toBeFocused();
		await expect(reveal(page).locator(".header__social").first()).toHaveCSS("opacity", "1");
	});

	test("stay open when the pointer moves from the logo to an icon", async ({ page }) => {
		await openHome(page);
		await page.locator(".header__logo").hover();
		await expect(reveal(page).locator(".header__social").first()).toHaveCSS("opacity", "1");

		await github(page).hover();
		await expect(github(page)).toHaveCSS("pointer-events", "auto");
	});

	test("do not push the navigation aside", async ({ page }) => {
		await openHome(page);
		const before = await page.locator(".header__nav").boundingBox();

		await page.locator(".header__logo").hover();
		await expect(reveal(page).locator(".header__social").first()).toHaveCSS("opacity", "1");

		expect(await page.locator(".header__nav").boundingBox()).toEqual(before);
	});

	test("keep the navigation centered and the actions tight to the edge", async ({ page }) => {
		await openHome(page);

		const nav = await page.locator(".header__nav").boundingBox();
		const actions = await page.locator(".header__actions").boundingBox();

		expect(Math.abs((nav?.x ?? 0) + (nav?.width ?? 0) / 2 - 640)).toBeLessThan(2);
		expect(actions?.width).toBeLessThan(200);
	});

	test("skip the animation with reduced motion", async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await openHome(page);
		await page.locator(".header__logo").hover();

		const item = reveal(page).locator(".header__social").first();
		await expect(item).toHaveCSS("transition-duration", "0s");
		await expect(item).toHaveCSS("opacity", "1");
	});

	test("open profiles in a new tab", async ({ page }) => {
		await openHome(page);
		await expect(github(page)).toHaveAttribute("href", "https://github.com/TuentyFaiv");
		await expect(github(page)).toHaveAttribute("target", "_blank");
	});
});

test.describe("header socials, phone", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test("live in the menu instead of on hover", async ({ page }) => {
		await openHome(page);
		await expect(reveal(page)).toBeHidden();

		await page.locator(".header__burguer").click();

		const menu = page.locator(".header__socials--menu");
		await expect(menu.getByRole("link", { name: "LinkedIn" })).toBeVisible();
	});
});

test.describe("header navigation, desktop", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("shows the three links with Home as the current one", async ({ page }) => {
		await openHome(page);

		const nav = page.locator(".header__list");

		await expect(nav.getByRole("link")).toHaveText(["Home", "Story", "Blog"]);
		await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
	});

	test("each link is its own route and stays current while scrolling the deck", async ({
		page,
	}) => {
		await openHome(page);

		const nav = page.locator(".header__list");
		const home = nav.getByRole("link", { name: "Home" });

		await page.keyboard.press("Space");
		await expect(page.locator(".deck__count")).toContainText("02 / 06");
		await expect(home).toHaveAttribute("aria-current", "page");

		await nav.getByRole("link", { name: "Story" }).click();
		await expect(page).toHaveURL("/story");
		await expect(page.getByRole("heading", { level: 1 })).toHaveText("Story");
		await expect(page.locator("main")).toContainText("Work in progress");
		await expect(nav.getByRole("link", { name: "Story" })).toHaveAttribute("aria-current", "page");
		await expect(home).not.toHaveAttribute("aria-current");

		await nav.getByRole("link", { name: "Blog" }).click();
		await expect(page).toHaveURL("/blog");
		await expect(page.getByRole("heading", { level: 2 })).toContainText(
			"Still choosing where to start."
		);
		await expect(nav.getByRole("link", { name: "Blog" })).toHaveAttribute("aria-current", "page");
	});

	// Back on when /story renders <Timeline /> again.
	test.fixme("keeps every timeline stop on the line, whatever the text length", async ({
		context,
		page,
	}) => {
		await context.addCookies([
			{ name: "PARAGLIDE_LOCALE", value: "es", url: "http://localhost:4173" },
		]);
		await page.goto("/story");

		const centers = await page
			.locator(".timeline__milestone")
			.evaluateAll((titles) => titles.map((title) => title.getBoundingClientRect().top));

		expect(new Set(centers).size).toBe(1);
	});

	test("the empty blog points to GitHub in a new tab", async ({ page }) => {
		await page.goto("/blog");

		const link = page.getByRole("main").getByRole("link", { name: "See my GitHub" });

		await expect(link).toHaveAttribute("href", "https://github.com/TuentyFaiv");
		await expect(link).toHaveAttribute("target", "_blank");
	});

	test("changes the page title on every route", async ({ page }) => {
		await page.goto("/story");
		await expect(page).toHaveTitle(/^Story/);

		await page.goto("/blog");
		await expect(page).toHaveTitle(/^Blog/);
	});

	test("matches the design sizes", async ({ page }) => {
		await openHome(page);

		await expect(page.locator(".header__logo")).toHaveCSS("font-size", "22px");
		await expect(page.locator(".themeswitch")).toHaveCSS("width", "36px");
		await expect(page.locator(".header")).toHaveCSS("padding-left", "64px");
	});

	test("switches the theme and swaps the icon", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" });
		await openHome(page);

		const html = page.locator("html");
		const sun = page.locator(".themeswitch__icon--sun");

		await expect(html).toHaveClass(/dark/);
		await expect(sun).toHaveCSS("opacity", "0");

		await page.locator(".themeswitch").click();

		await expect(html).not.toHaveClass(/dark/);
		await expect(sun).toHaveCSS("opacity", "1");
	});

	test("the theme switch states what it controls", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" });
		await openHome(page);

		await expect(page.getByRole("switch", { name: "Dark theme" })).toBeChecked();
	});
});

test.describe("language toggle", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	const toggle = (page: Page) => page.locator(".header__actions .language");

	test("matches the theme button and shows the current language", async ({ page }) => {
		await openHome(page);

		await expect(toggle(page)).toHaveText("EN");
		await expect(toggle(page)).toHaveCSS("width", "36px");
		await expect(toggle(page)).toHaveCSS("height", "36px");
		await expect(toggle(page)).toHaveCSS("border-top-style", "solid");
	});

	test("switches to Spanish and back with one click each", async ({ page }) => {
		await openHome(page);
		await toggle(page).click();

		await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
		await expect(toggle(page)).toHaveText("ES");
		await expect(page.locator(".header__list").getByRole("link").nth(1)).toHaveText("Historia");

		await page.waitForLoadState("networkidle");
		await toggle(page).click();

		await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
		await expect(toggle(page)).toHaveText("EN");
	});

	test("works from the keyboard", async ({ page }) => {
		await openHome(page);
		await toggle(page).focus();
		await page.keyboard.press("Enter");

		await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
	});

	test("its accessible name says what it does and includes the visible text", async ({ page }) => {
		await openHome(page);

		await expect(page.getByRole("button", { name: "EN, switch to Spanish" })).toBeVisible();
	});

	test("remembers the choice on the next visit", async ({ page }) => {
		await openHome(page);
		await toggle(page).click();
		await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");

		await page.goto("/story");

		await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
	});
});

test.describe("header menu, phone", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	const burger = (page: Page) => page.locator(".header__burguer");
	const menu = (page: Page) => page.locator("#header-menu");

	test("is closed and out of the tab order until opened", async ({ page }) => {
		await openHome(page);

		await expect(menu(page)).toBeHidden();
		await expect(page.locator(".header__actions .language")).toBeHidden();
	});

	test("opens with big links, socials, email and language", async ({ page }) => {
		await openHome(page);
		await burger(page).click();

		await expect(menu(page).getByRole("link", { name: "Story" })).toHaveCSS("font-size", "40px");
		await expect(menu(page).getByRole("link", { name: "contact@tuentyfaiv.com" })).toBeVisible();
		await expect(menu(page).getByRole("button", { name: "EN, switch to Spanish" })).toBeVisible();
		await expect(page.locator(".header__logo")).toBeVisible();
	});

	test("closes after picking a link and lands on its route", async ({ page }) => {
		await openHome(page);
		await burger(page).click();
		await menu(page).getByRole("link", { name: "Blog" }).click();

		await expect(menu(page)).toBeHidden();
		await expect(page).toHaveURL("/blog");
	});

	test("hides the page behind from keyboards and screen readers while open", async ({ page }) => {
		await openHome(page);
		await burger(page).click();
		await expect(page.locator("main")).toHaveCSS("visibility", "hidden");

		await page.keyboard.press("Escape");
		await expect(page.locator("main")).toHaveCSS("visibility", "visible");
	});

	test("opens before any JavaScript has loaded", async ({ page }) => {
		await page.route("**/_app/**", (route) => route.abort());
		await page.goto("/");
		await burger(page).click();

		await expect(menu(page)).toBeVisible();
		await expect(menu(page).getByRole("link", { name: "Story" })).toBeVisible();
	});

	test("still changes the theme while open", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" });
		await openHome(page);
		await burger(page).click();
		await page.locator(".themeswitch").click();

		await expect(page.locator("html")).not.toHaveClass(/dark/);
	});

	test("closes with Escape and returns focus to the button", async ({ page }) => {
		await openHome(page);
		await burger(page).focus();
		await page.keyboard.press("Enter");
		await expect(menu(page)).toBeVisible();

		await page.keyboard.press("Escape");

		await expect(menu(page)).toBeHidden();
		await expect(burger(page)).toBeFocused();
	});

	test("does not scroll the page behind an open menu", async ({ page }) => {
		await openHome(page);
		await burger(page).click();

		await expect(page.locator("html")).toHaveCSS("overflow-y", "hidden");
	});
});
