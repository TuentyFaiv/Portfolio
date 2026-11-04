import { expect, test } from "@playwright/test";

const years = ["2016", "2018", "2021", "2022", "2023", "2024", "2025", "2026"];

test.describe("home teasers", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("the story slide is a doorway to the story, not a placeholder", async ({ page }) => {
		await page.goto("/#story");

		const slide = page.locator("#story");

		await expect(slide).not.toContainText("Work in progress");
		await expect(slide.getByRole("heading", { level: 2 })).toHaveText(
			"Learning since 2016. Shipping since 17."
		);
		await expect(slide.getByRole("list", { name: "Jump to a year" }).getByRole("link")).toHaveText(
			years.map((year) => new RegExp(`^${year}`))
		);
		await expect(slide.getByRole("link", { name: "Read the story" })).toHaveAttribute(
			"href",
			"/story"
		);
	});

	test("each year names its chapter for screen readers", async ({ page }) => {
		await page.goto("/#story");

		await expect(page.getByRole("link", { name: /^2021\s*:\s*First team$/ })).toHaveAttribute(
			"href",
			"/story#year-2021"
		);
	});

	test("a year opens the story right at its chapter", async ({ page }) => {
		await page.goto("/#story");
		await page.waitForLoadState("networkidle");

		await page.getByRole("link", { name: /^2022\s*:\s*Frontend Lead$/ }).click();

		await expect(page).toHaveURL(/\/story#year-2022$/);
		await expect(page.locator(".deck__count")).toContainText("05 / 09");
		await expect
			.poll(() =>
				page
					.locator("#year-2022")
					.evaluate((slide) => Math.round(slide.getBoundingClientRect().top))
			)
			.toBe(0);
	});

	test("the blog slide says what the blog says and leads there", async ({ page }) => {
		await page.goto("/#blog");
		await page.waitForLoadState("networkidle");

		const slide = page.locator("#blog");

		await expect(slide).not.toContainText("Work in progress");
		await expect(slide.getByRole("heading", { level: 2 })).toHaveText(
			"Still choosing where to start."
		);

		await slide.getByRole("link", { name: "Visit the blog" }).click();

		await expect(page).toHaveURL(/\/blog$/);
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});

	test("speaks Spanish with the language cookie", async ({ context, page }) => {
		await context.addCookies([
			{ name: "PARAGLIDE_LOCALE", value: "es", url: "http://localhost:4173" },
		]);
		await page.goto("/#story");

		await expect(page.getByRole("link", { name: "Leer la historia" })).toBeVisible();
		await expect(page.getByRole("list", { name: "Ir a un año" })).toBeVisible();
		await expect(page.getByRole("link", { name: "Visitar el blog" })).toBeAttached();
	});
});

test("on a phone the years wrap four and four, without sideways scroll", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/#story");

	const rows = await page
		.locator("#story li")
		.evaluateAll((items) => new Set(items.map((item) => item.getBoundingClientRect().top)).size);

	expect(rows).toBe(2);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
