import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

const reveal = (page: Page) => page.locator(".header__socials--reveal");
const github = (page: Page) => reveal(page).getByRole("link", { name: "GitHub" });

test.describe("header socials, desktop", () => {
	test.use({ viewport: { width: 1280, height: 720 } });

	test("stay hidden until the logo is hovered, then reveal all three", async ({ page }) => {
		await page.goto("/");
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

	test("reveal on keyboard focus and stay open while tabbing through", async ({ page }) => {
		await page.goto("/");
		await page.locator(".header__logo").focus();
		await page.keyboard.press("Tab");

		await expect(github(page)).toBeFocused();
		await expect(reveal(page).locator(".header__social").first()).toHaveCSS("opacity", "1");
	});

	test("stay open when the pointer moves from the logo to an icon", async ({ page }) => {
		await page.goto("/");
		await page.locator(".header__logo").hover();
		await expect(reveal(page).locator(".header__social").first()).toHaveCSS("opacity", "1");

		await github(page).hover();
		await expect(github(page)).toHaveCSS("pointer-events", "auto");
	});

	test("do not push the navigation aside", async ({ page }) => {
		await page.goto("/");
		const before = await page.locator(".header__nav").boundingBox();

		await page.locator(".header__logo").hover();
		await expect(reveal(page).locator(".header__social").first()).toHaveCSS("opacity", "1");

		expect(await page.locator(".header__nav").boundingBox()).toEqual(before);
	});

	test("keep the navigation centered and the actions tight to the edge", async ({ page }) => {
		await page.goto("/");

		const nav = await page.locator(".header__nav").boundingBox();
		const actions = await page.locator(".header__actions").boundingBox();

		expect(Math.abs((nav?.x ?? 0) + (nav?.width ?? 0) / 2 - 640)).toBeLessThan(2);
		expect(actions?.width).toBeLessThan(200);
	});

	test("skip the animation with reduced motion", async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");
		await page.locator(".header__logo").hover();

		const item = reveal(page).locator(".header__social").first();
		await expect(item).toHaveCSS("transition-duration", "0s");
		await expect(item).toHaveCSS("opacity", "1");
	});

	test("open profiles in a new tab", async ({ page }) => {
		await page.goto("/");
		await expect(github(page)).toHaveAttribute("href", "https://github.com/TuentyFaiv");
		await expect(github(page)).toHaveAttribute("target", "_blank");
	});
});

test.describe("header socials, phone", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test("live in the menu instead of on hover", async ({ page }) => {
		await page.goto("/");
		await expect(reveal(page)).toBeHidden();

		await page.locator(".header__burguer").click();

		const menu = page.locator(".header__socials--menu");
		await expect(menu.getByRole("link", { name: "LinkedIn" })).toBeVisible();
	});
});
