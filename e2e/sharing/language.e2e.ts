import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

const toggle = (page: Page) => page.locator(".header__actions .language");

async function openContact(page: Page) {
	await page.goto("/#contact");
	await page.waitForLoadState("networkidle");
	await expect(page.locator(".deck__count")).toContainText("06 / 06");
	await expect(page.locator("body")).not.toHaveAttribute("aria-busy", /.*/);
}

async function watchStoryLink(page: Page) {
	await page.evaluate(() => {
		const link = document.querySelectorAll(".header__list a")[1] as Element;
		const seen: string[] = [];
		const busy: boolean[] = [];

		new MutationObserver(() => {
			seen.push(link.textContent ?? "");
			busy.push(document.body.getAttribute("aria-busy") === "true");
		}).observe(link, { characterData: true, childList: true, subtree: true });
		Object.assign(window, { seen, busy });
	});

	return () =>
		page.evaluate(() => {
			const { busy, seen } = window as unknown as { busy: boolean[]; seen: string[] };

			return { busy, seen };
		});
}

test("switches language in place: no reload, same slide, same focus", async ({ context, page }) => {
	await openContact(page);
	await page.evaluate(() => Object.assign(window, { stayed: true }));

	const before = await page.evaluate(() => window.scrollY);

	// Keyboard only: Safari never focuses a button on click.
	await toggle(page).focus();
	await page.keyboard.press("Enter");

	await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
	await expect(page.locator("#contact h2")).toHaveText("Trae pozole. Saluda.");
	expect(await page.evaluate(() => "stayed" in window)).toBe(true);
	expect(await page.evaluate(() => window.scrollY)).toBe(before);
	await expect(page.locator(".deck__count")).toContainText("06 / 06");
	await expect(toggle(page)).toBeFocused();
	expect((await context.cookies()).find(({ name }) => name === "PARAGLIDE_LOCALE")?.value).toBe(
		"es"
	);
});

test("the page title and its social tags follow the language", async ({ page }) => {
	await page.goto("/story");
	await page.waitForLoadState("networkidle");

	const title = await page.title();

	await toggle(page).click();

	await expect(page).not.toHaveTitle(title);
	await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "es_MX");
	await expect(page.locator(".opening__title")).toHaveText(
		"Aprendiendo desde 2016. Publicando desde los 17."
	);
});

test("the words scramble into the new language, then settle", async ({ page }) => {
	await openContact(page);

	const read = await watchStoryLink(page);

	await toggle(page).click();
	await expect(page.locator(".header__list a").nth(1)).toHaveText("Historia");
	await expect(page.locator("body")).not.toHaveAttribute("aria-busy", /.*/);

	const { busy, seen } = await read();

	const between = new Set(seen.filter((value) => value !== "Story" && value !== "Historia"));

	expect(between.size).toBeGreaterThanOrEqual(2);
	for (const value of between) expect([...value].sort()).toEqual([..."Historia"].sort());
	expect(busy.slice(0, -1).every(Boolean)).toBe(true);
	expect(seen.at(-1)).toBe("Historia");
});

for (const [width, height] of [
	[1440, 900],
	[390, 844],
] as const) {
	for (const [slide, selectors] of [
		["intro", [".intro__title", ".intro__actions"]],
		["story", ["#story .teaser__title", ".story-teaser", "#story .teaser__action"]],
	] as const) {
		test(`switching language does not shift the ${slide} slide, ${width}px`, async ({ page }) => {
			await page.setViewportSize({ height, width });
			await page.goto(`/#${slide}`);
			await page.waitForLoadState("networkidle");
			await expect(page.locator("body")).not.toHaveAttribute("aria-busy", /.*/);

			const { after, before, frames } = await page.evaluate(async (selectors) => {
				const tops = () =>
					selectors
						.map((selector) =>
							Math.round(document.querySelector(selector)?.getBoundingClientRect().top ?? -1)
						)
						.join(",");
				const before = tops();
				const frames = new Set<string>();

				(document.querySelector(".header__actions .language") as HTMLElement).click();

				const start = performance.now();

				await new Promise<void>((done) => {
					const frame = () => {
						frames.add(tops());
						performance.now() - start < 800 ? requestAnimationFrame(frame) : done();
					};

					requestAnimationFrame(frame);
				});

				return { after: tops(), before, frames: [...frames] };
			}, selectors);

			expect(frames).toEqual([after]);

			const moved = after
				.split(",")
				.map((top, index) => Math.abs(Number(top) - Number(before.split(",")[index])));

			expect(Math.max(...moved)).toBeLessThanOrEqual(6);
		});
	}
}

for (const [width, height] of [
	[1440, 900],
	[1024, 768],
	[390, 844],
] as const) {
	for (const slide of ["intro", "story", "contact"]) {
		test(`every text keeps its line count while it scrambles, ${slide}, ${width}px`, async ({
			page,
		}) => {
			await page.setViewportSize({ height, width });
			await page.goto(`/#${slide}`);
			await page.waitForLoadState("networkidle");
			await expect(page.locator("body")).not.toHaveAttribute("aria-busy", /.*/);

			const grew = await page.evaluate(async () => {
				const lines = (element: Element) => {
					const range = document.createRange();

					range.selectNodeContents(element);

					return new Set([...range.getClientRects()].map(({ top }) => Math.round(top))).size;
				};
				const texts = [...document.querySelectorAll("body *")].filter(
					(element) =>
						[...element.childNodes].some((node) => node.nodeType === 3 && node.nodeValue?.trim()) &&
						element.getBoundingClientRect().height > 0
				);
				const most = new Map<Element, number>();

				(document.querySelector(".language:not([hidden])") as HTMLElement).click();

				const start = performance.now();

				await new Promise<void>((done) => {
					const frame = () => {
						for (const element of texts)
							most.set(element, Math.max(most.get(element) ?? 0, lines(element)));
						performance.now() - start < 800 ? requestAnimationFrame(frame) : done();
					};

					requestAnimationFrame(frame);
				});

				return texts
					.filter((element) => (most.get(element) ?? 0) > lines(element))
					.map(
						(element) => `${element.className || element.tagName}: ${element.textContent?.trim()}`
					);
			});

			expect(grew).toEqual([]);
		});
	}
}

for (const [width, height] of [
	[1440, 900],
	[1024, 768],
	[768, 1024],
] as const) {
	test(`the intro keeps its line count in Spanish, ${width}px`, async ({ page }) => {
		await page.setViewportSize({ height, width });
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/#intro");
		await page.waitForLoadState("networkidle");

		const lines = () =>
			page.evaluate(() =>
				[".intro__eyebrow--long", ".intro__title", ".intro__lede--long"].map((selector) => {
					const range = document.createRange();

					range.selectNodeContents(document.querySelector(selector) as Element);

					return new Set([...range.getClientRects()].map(({ top }) => Math.round(top))).size;
				})
			);
		const english = await lines();

		await toggle(page).click();
		await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");

		expect(await lines()).toEqual(english);
	});
}

test("with reduced motion the words change at once", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await openContact(page);

	const read = await watchStoryLink(page);

	await toggle(page).click();
	await expect(page.locator(".header__list a").nth(1)).toHaveText("Historia");

	const { busy, seen } = await read();

	expect(seen).toEqual(["Historia"]);
	expect(busy).toEqual([false]);
});
