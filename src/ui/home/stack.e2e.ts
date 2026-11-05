import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

const names = ["Interface", "Languages", "Backend", "Also shipped", "Quality", "Ship"];

/**
 * Contrast of each selector's text against what is behind it: the page, plus the glow's
 * brightest point for the right column, the only one that reaches it.
 */
async function ratios(page: Page, selectors: string[]) {
	return page.evaluate((selectors) => {
		const parse = (color: string) => {
			const context = document.createElement("canvas").getContext("2d", {
				willReadFrequently: true,
			}) as CanvasRenderingContext2D;

			context.fillStyle = color;
			context.fillRect(0, 0, 1, 1);

			return [...context.getImageData(0, 0, 1, 1).data];
		};
		const over = (color: number[], under: number[]) => {
			const alpha = (color[3] ?? 255) / 255;

			return under
				.slice(0, 3)
				.map((value, index) => (color[index] ?? 0) * alpha + value * (1 - alpha));
		};
		const luminance = (rgb: number[]) => {
			const [r = 0, g = 0, b = 0] = rgb.map((value) => {
				const channel = value / 255;

				return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
			});

			return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		};
		const contrast = (one: number[], two: number[]) => {
			const [low, high] = [luminance(one), luminance(two)].sort((a, b) => a - b);

			return ((high as number) + 0.05) / ((low as number) + 0.05);
		};

		const background = parse(getComputedStyle(document.body).backgroundColor);
		// The brand color, the same token the glow mixes in.
		const primary = parse(getComputedStyle(document.documentElement).getPropertyValue("--primary"));
		// The glow's center mixes 14% of the brand color into the page.
		const glow = background
			.slice(0, 3)
			.map((value, index) => value * 0.86 + (primary[index] ?? 0) * 0.14);

		return selectors.flatMap((selector) =>
			[...document.querySelectorAll(`#stack ${selector}`)].flatMap((element) => {
				const style = getComputedStyle(element);
				const text = parse(style.color);
				const chip = parse(style.backgroundColor);

				// Only the right column reaches the glow, which starts at 62% of the width.
				const behind = selector === ".layers__used" ? [background, glow] : [background];

				return behind.map((under) => {
					const behind = over(chip, under);

					return { selector, ratio: contrast(over(text, behind), behind) };
				});
			})
		);
	}, selectors);
}

test.describe("stack slide, desktop", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("lists the layers top to bottom, with tools and where they were used", async ({ page }) => {
		await page.goto("/#stack");

		const slide = page.locator("#stack");

		await expect(slide).not.toContainText("Work in progress");
		await expect(slide.getByRole("heading", { level: 2 })).toHaveText("The stack, top to bottom.");
		await expect(slide.getByRole("heading", { level: 3 })).toHaveText(names);
		await expect(slide.locator(".layers > li")).toHaveCount(names.length);
		await expect(slide.locator(".layers > li").first().getByRole("listitem")).toHaveText([
			"Svelte",
			"SvelteKit",
			"Astro",
			"Tailwind CSS",
		]);
		await expect(slide.locator(".layers__used").first()).toHaveText(
			"This site · dashboards and multilingual sites at work"
		);
	});

	test("never names a company, a client, private work or unfinished projects", async ({ page }) => {
		await page.goto("/#stack");

		const text = await page.locator("#stack").innerText();

		expect(text).not.toMatch(/axial|nopal|consultant/i);
		expect(text).not.toMatch(/svelte-form|sveaming|tfverse/i);
	});

	test("waits until the slide arrives, then lights every row", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		const layers = page.locator("#stack .layers");

		await expect(layers).toHaveAttribute("data-walk", "ready");

		await page.locator("#stack").scrollIntoViewIfNeeded();

		await expect(layers).toHaveAttribute("data-walk", "on");
		// Every row's animation finishes, and the rows end in their own colors.
		await expect
			.poll(() =>
				page.evaluate(
					() => document.querySelector("#stack .layers")?.getAnimations({ subtree: true }).length
				)
			)
			.toBe(0);

		const colors = await page
			.locator("#stack .layers__name")
			.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).color));
		const foreground = await page.evaluate(() => getComputedStyle(document.body).color);

		expect(new Set(colors)).toEqual(new Set([foreground]));
	});

	for (const colorScheme of ["dark", "light"] as const) {
		test(`rows reach 4.5:1 while waiting and once lit, ${colorScheme}`, async ({ page }) => {
			await page.emulateMedia({ colorScheme });
			await page.goto("/");
			await page.waitForLoadState("networkidle");
			await expect(page.locator("#stack .layers")).toHaveAttribute("data-walk", "ready");

			const selectors = [".layers__name", ".layers__tool", ".layers__used"];

			for (const { ratio, selector } of await ratios(page, selectors))
				expect(ratio, `waiting ${selector}`).toBeGreaterThanOrEqual(4.5);

			await page.locator("#stack").scrollIntoViewIfNeeded();
			await expect
				.poll(() =>
					page.evaluate(
						() => document.querySelector("#stack .layers")?.getAnimations({ subtree: true }).length
					)
				)
				.toBe(0);

			for (const { ratio, selector } of await ratios(page, selectors))
				expect(ratio, `lit ${selector}`).toBeGreaterThanOrEqual(4.5);
		});
	}

	test("with reduced motion every row is lit from the start, nothing animates", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/#stack");
		await page.waitForLoadState("networkidle");

		await expect(page.locator("#stack .layers")).not.toHaveAttribute("data-walk", /.*/);
		expect(
			await page.evaluate(
				() => document.querySelector("#stack .layers")?.getAnimations({ subtree: true }).length
			)
		).toBe(0);

		// Hovering a row keeps its color cue, but its dot neither grows nor animates.
		await page.locator("#stack .layers__layer").first().hover();
		expect(
			await page.evaluate(() => {
				const dot = getComputedStyle(
					document.querySelector("#stack .layers__layer") as Element,
					"::before"
				);

				return { scale: dot.scale, transition: dot.transitionDuration };
			})
		).toEqual({ scale: "none", transition: "0s" });
	});

	test("speaks Spanish with the language cookie", async ({ context, page }) => {
		await context.addCookies([
			{ name: "PARAGLIDE_LOCALE", value: "es", url: "http://localhost:4173" },
		]);
		await page.goto("/#stack");

		await expect(page.locator("#stack").getByRole("heading", { level: 2 })).toHaveText(
			"El stack, de arriba abajo."
		);
		await expect(page.locator("#stack").getByRole("heading", { level: 3 }).first()).toHaveText(
			"Interfaz"
		);
	});
});

test("on a short laptop screen every row keeps its chips on one line, above the footer", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 640 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/#stack");
	await page.waitForLoadState("networkidle");

	const lines = await page
		.locator("#stack .layers__tools")
		.evaluateAll((lists) =>
			lists.map(
				(list) => new Set([...list.children].map((chip) => chip.getBoundingClientRect().top)).size
			)
		);
	const bottom = await page
		.locator("#stack .layers")
		.evaluate((list) => list.getBoundingClientRect().bottom);
	const footer = await page
		.locator(".deck__count")
		.evaluate((count) => count.getBoundingClientRect().top);

	expect(lines).toEqual(lines.map(() => 1));
	expect(bottom).toBeLessThan(footer);
});

test("on a phone the layers fit above the footer, and screen readers still hear where each was used", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/#stack");
	await page.waitForLoadState("networkidle");

	const bottom = await page
		.locator("#stack .layers")
		.evaluate((list) => list.getBoundingClientRect().bottom);
	const footer = await page
		.locator(".deck__count")
		.evaluate((count) => count.getBoundingClientRect().top);

	expect(bottom).toBeLessThan(footer);
	await expect(page.locator("#stack .layers__used").first()).toHaveCSS("position", "absolute");
	expect(await page.locator("#stack .layers").ariaSnapshot()).toContain(
		"Microservices and APIs at work"
	);
});
