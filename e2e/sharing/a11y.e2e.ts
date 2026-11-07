import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

import { installContrast } from "../support/contrast.ts";

const standards = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

async function expectNoViolations(page: Page) {
	// Let animations finish: a half-faded icon isn't a real contrast failure.
	await page.waitForLoadState("networkidle");
	await page.waitForTimeout(900);

	const { incomplete, passes, violations } = await new AxeBuilder({ page })
		.withTags(standards)
		.analyze();
	const summary = violations.map(({ id, nodes }) => `${id}: ${nodes[0]?.target}`);

	expect(summary).toEqual([]);
	// axe can't measure text over gradients; the deck text test covers those.
	expect([...passes, ...incomplete].map(({ id }) => id)).toContain("color-contrast");
}

for (const colorScheme of ["dark", "light"] as const) {
	for (const [device, viewport] of Object.entries({
		desktop: { width: 1440, height: 900 },
		phone: { width: 390, height: 844 },
	})) {
		test.describe(`${device}, ${colorScheme}`, () => {
			test.use({ colorScheme, viewport });

			for (const path of ["/", "/story", "/blog"]) {
				test(`${path} has no axe violations`, async ({ page }) => {
					await page.goto(path);
					await expectNoViolations(page);
				});
			}
		});
	}

	test.describe(`open controls, ${colorScheme}`, () => {
		test.use({ colorScheme });

		test("the phone menu has no axe violations", async ({ page }) => {
			await page.setViewportSize({ width: 390, height: 844 });
			await page.goto("/");
			await page.locator(".header__burguer").click();
			await expectNoViolations(page);
		});
	});
}

for (const [colorScheme, glow] of [
	["dark", "#14c18a"],
	["light", "#fd9b8b"],
] as const) {
	test.describe(`the deck text, ${colorScheme}`, () => {
		test.use({ colorScheme, viewport: { width: 1440, height: 900 } });

		test("reaches 4.5:1 on the page and on the brightest point of the glow", async ({ page }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			await page.evaluate(installContrast);

			const ratios = await page.evaluate((glowColor) => {
				const { contrast, parse } = window.contrast;

				const page = parse(getComputedStyle(document.body).backgroundColor);
				const glow = parse(glowColor);
				const brightest = page.map((value, index) => value * 0.75 + (glow[index] ?? 0) * 0.25);
				const colorOf = (selector: string) =>
					parse(getComputedStyle(document.querySelector(selector) as Element).color);
				const button = getComputedStyle(
					document.querySelector(".intro__action--primary") as Element
				);

				return [
					...[".deck__count", ".deck__hint--scroll", ".deck__next"].map((selector) =>
						contrast(colorOf(selector), page)
					),
					...[".intro__eyebrow--long", ".intro__lede--long", ".intro__action--ghost"].map(
						(selector) => contrast(colorOf(selector), brightest)
					),
					contrast(parse(button.color), parse(button.backgroundColor)),
				];
			}, glow);

			for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
		});
	});
}

// macOS Safari only tabs to links while Option is held.
const tabKey = (browser: string) => (browser === "webkit" ? "Alt+Tab" : "Tab");

test("the first Tab offers a skip link that moves past the header", async ({
	browserName,
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/story");
	await page.keyboard.press(tabKey(browserName));

	const skip = page.getByRole("link", { name: "Skip to content" });

	await expect(skip).toBeFocused();
	await expect(skip).toBeInViewport();

	await page.keyboard.press("Enter");

	await expect(page.locator("main")).toBeFocused();
});

test("every link and button shows a focus outline", async ({ browserName, page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/");

	for (let stop = 0; stop < 12; stop += 1) {
		await page.keyboard.press(tabKey(browserName));

		const outline = await page.evaluate(() => {
			const styles = getComputedStyle(document.activeElement as Element);

			return { style: styles.outlineStyle, width: styles.outlineWidth };
		});

		expect(outline.style).not.toBe("none");
		expect(outline.width).not.toBe("0px");
	}
});

test("targets on phones are at least 24px", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");
	await page.waitForLoadState("networkidle");
	await page.locator(".header__burguer").click();

	const sizes = await page
		.locator(
			".deck__tick:visible, .header__burguer:visible, .themeswitch:visible, .language:visible"
		)
		.evaluateAll((items) => items.map((item) => item.getBoundingClientRect()));

	for (const { height, width } of sizes) {
		expect(Math.min(height, width)).toBeGreaterThanOrEqual(24);
	}
});

test("text still fits at 200% zoom on a small laptop", async ({ page }) => {
	await page.setViewportSize({ width: 640, height: 360 });

	for (const path of ["/", "/story", "/blog"]) {
		await page.goto(path);

		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(640);
	}
});
