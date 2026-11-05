import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

type Record = { before: string[]; after: string[] };

/*
 * Records which elements carry a view-transition name when each route transition starts
 * (the page being left) and once the new page is in (the page arriving).
 */
test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		const start = Document.prototype.startViewTransition;

		if (!start) return;

		const records: { before: string[]; after: string[] }[] = [];
		const named = () =>
			[...document.querySelectorAll<HTMLElement>("*")]
				.filter((element) => element.style.viewTransitionName)
				.map((element) => `${element.style.viewTransitionName} ${element.classList[0]}`);

		Object.assign(window, { records });
		Document.prototype.startViewTransition = function (update) {
			const record = { before: named(), after: [] as string[] };

			records.push(record);

			return start.call(this, async () => {
				await (typeof update === "function" ? update() : update?.update?.());
				record.after = named();
			});
		};
	});
});

async function open(page: Page, hash: string) {
	await page.goto(`/#${hash}`);
	await page.waitForLoadState("networkidle");
	test.skip(
		await page.evaluate(() => !("records" in window)),
		"no view transitions in this browser"
	);
}

/** The last route transition, once it has finished and cleaned up after itself. */
async function last(page: Page) {
	await expect
		.poll(() => page.evaluate(() => document.querySelectorAll("[style*=view-transition]").length))
		.toBe(0);

	return page.evaluate(() => (window as unknown as { records: Record[] }).records.at(-1));
}

test("the story headline moves from the home slide into /story", async ({ page }) => {
	await open(page, "story");
	await page.locator("#story").getByRole("link", { name: "Read the story" }).click();
	await expect(page).toHaveURL("/story");

	expect(await last(page)).toEqual({
		before: ["story-title teaser__title"],
		after: ["story-title opening__title"],
	});
});

test("going back, the headline moves back onto the home slide you came from", async ({ page }) => {
	await open(page, "story");
	await page.locator("#story").getByRole("link", { name: "Read the story" }).click();
	await expect(page).toHaveURL("/story");
	await last(page);

	await page.goBack();
	await expect(page).toHaveURL(/\/(#story)?$/);
	await expect(page.locator(".deck__count")).toContainText("03 / 06");

	expect(await last(page)).toEqual({
		before: ["story-title opening__title"],
		after: ["story-title teaser__title"],
	});
});

test("a year grows into the big year of its chapter", async ({ page }) => {
	await open(page, "story");
	await page.locator("#story").getByRole("link", { name: /^2018/ }).click();
	await expect(page).toHaveURL("/story#year-2018");

	const record = await last(page);

	expect(record?.before).toContain("story-year story-teaser__year");
	expect(record?.after).toContain("story-year chapter__year");
});

test("the blog slide's words move into place on /blog", async ({ page }) => {
	await open(page, "blog");
	await page.locator("#blog").getByRole("link", { name: "Visit the blog" }).click();
	await expect(page).toHaveURL("/blog");

	expect(await last(page)).toEqual({
		before: ["blog-label teaser__eyebrow", "blog-title teaser__title", "blog-body teaser__lede"],
		after: [
			"blog-label posts__empty-label",
			"blog-title posts__empty-title",
			"blog-body posts__empty-body",
		],
	});
});

test("from a slide that is not on screen, the page only crossfades", async ({ page }) => {
	await open(page, "intro");
	await page.locator(".header__list").getByRole("link", { name: "Story" }).click();
	await expect(page).toHaveURL("/story");

	expect(await last(page)).toEqual({ before: [], after: [] });
});

test("with reduced motion nothing moves", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await open(page, "story");
	await page.locator("#story").getByRole("link", { name: "Read the story" }).click();
	await expect(page).toHaveURL("/story");

	expect(await page.evaluate(() => (window as unknown as { records: Record[] }).records)).toEqual(
		[]
	);
});
