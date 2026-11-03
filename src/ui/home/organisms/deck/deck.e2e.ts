import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

const scrollTop = (page: Page) => page.evaluate(() => Math.round(window.scrollY));
const fullHeight = (page: Page) => page.evaluate(() => window.innerHeight);

test.describe("deck, desktop", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("opens on the intro without horizontal scroll", async ({ page }) => {
		await page.goto("/");

		await expect(page.getByRole("heading", { level: 1 })).toContainText("Pozole first, then code.");
		await expect(page.getByLabel("Slides").getByRole("link", { name: "Intro" })).toHaveAttribute(
			"aria-current",
			"location"
		);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440);
	});

	test("the tour button moves to the projects slide and marks it as current", async ({ page }) => {
		await page.goto("/");
		await page.getByRole("link", { name: "Take the tour" }).click();

		await expect.poll(() => scrollTop(page)).toBe(900);
		await expect(page.getByLabel("Slides").getByRole("link", { name: "Projects" })).toHaveAttribute(
			"aria-current",
			"location"
		);
	});

	test("space moves one slide at a time", async ({ page }) => {
		await page.goto("/");
		await page.keyboard.press("Space");
		await expect.poll(() => scrollTop(page)).toBe(900);

		await page.keyboard.press("Space");
		await expect.poll(() => scrollTop(page)).toBe(1800);
	});

	test("keeps the header in place on every slide", async ({ page }) => {
		await page.goto("/#story");

		await expect(page.locator(".header")).toBeInViewport();
		await expect
			.poll(() => page.locator(".header").evaluate((el) => el.getBoundingClientRect().top))
			.toBe(0);
	});

	test("does not smooth scroll with reduced motion", async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");

		expect(
			await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)
		).toBe("auto");
	});

	test("keeps the footer still and changes only its text", async ({ page }) => {
		await page.goto("/");

		const footer = page.locator(".deck");
		const before = await footer.boundingBox();

		await page.keyboard.press("Space");
		await expect.poll(() => scrollTop(page)).toBe(900);

		await expect(footer).toContainText("02 / 06");
		await expect(footer).toContainText("Projects");
		await expect(page.locator(".deck__next")).toContainText("Story");
		expect(await footer.boundingBox()).toEqual(before);
		await expect(footer).toHaveCount(1);
	});

	test("never moves the footer on any frame of a slide change", async ({ page }) => {
		await page.goto("/");

		const positions = page.evaluate(
			() =>
				new Promise<number[]>((resolve) => {
					const footer = document.querySelector(".deck") as HTMLElement;
					const seen: number[] = [];
					const sample = () => {
						seen.push(footer.getBoundingClientRect().top);

						if (window.scrollY >= window.innerHeight) resolve(seen);
						else requestAnimationFrame(sample);
					};

					requestAnimationFrame(sample);
				})
		);

		await page.keyboard.press("Space");

		const tops = await positions;

		expect(tops.length).toBeGreaterThan(5);
		expect(new Set(tops).size).toBe(1);
	});

	test("scrambles the footer text on the way to the next slide", async ({ page }) => {
		await page.goto("/");

		await page.locator(".deck__next").evaluate((link) => {
			const seen = new Set<string>();

			new MutationObserver(() => seen.add(link.textContent ?? "")).observe(link, {
				characterData: true,
				childList: true,
				subtree: true,
			});
			Object.assign(window, { seen });
			(link as HTMLElement).click();
		});

		await expect(page.locator(".deck__next")).toContainText("Story");

		const frames = await page.evaluate(
			() => (window as unknown as { seen: Set<string> }).seen.size
		);

		expect(frames).toBeGreaterThan(2);
	});

	test("lands on the right text after jumping across slides", async ({ page }) => {
		await page.goto("/");

		const rail = page.getByLabel("Slides");

		await rail.getByRole("link", { name: "Stack" }).click();
		await rail.getByRole("link", { name: "Story" }).click();
		await rail.getByRole("link", { name: "Blog" }).click();

		await expect(page.locator(".deck__count")).toContainText("05 / 06");
		await expect(page.locator(".deck__next")).toContainText("Contact");
	});

	test("hides the hint and next link on the last slide", async ({ page }) => {
		await page.goto("/#contact");

		await expect(page.locator(".deck__count")).toContainText("06 / 06");
		await expect(page.locator(".deck__next")).toBeHidden();
		await expect(page.locator(".deck__hint--scroll")).toBeHidden();
	});

	test("swaps the footer text with no scramble under reduced motion", async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");
		await page.getByLabel("Slides").getByRole("link", { name: "Story" }).click();

		await expect(page.locator(".deck__count")).toContainText("03 / 06", { timeout: 300 });
	});
});

test.describe("deck footer centering", () => {
	for (const [language, width] of [
		["en", 1440],
		["es", 1024],
		["es", 700],
		["es", 640],
	] as const) {
		test(`the hint sits on the screen center, ${language} at ${width}px`, async ({
			context,
			page,
		}) => {
			await context.addCookies([
				{ name: "PARAGLIDE_LOCALE", value: language, url: "http://localhost:4173" },
			]);
			await page.setViewportSize({ width, height: 800 });
			await page.goto("/");

			const offset = await page.locator(".deck__hint-text").evaluate((hint) => {
				const { left, width: size } = hint.getBoundingClientRect();

				return Math.abs(left + size / 2 - window.innerWidth / 2);
			});

			expect(offset).toBeLessThan(1);
		});
	}
});

for (const [device, viewport] of Object.entries({
	phone: { width: 390, height: 844 },
	desktop: { width: 1440, height: 900 },
})) {
	test(`the visible marks are symmetric on every slide, ${device}`, async ({ page }) => {
		const isPhone = viewport.width < 640;

		// Instant scrolling: a smooth scroll would still be running when the next slide opens.
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.setViewportSize(viewport);

		for (const id of ["intro", "projects", "story", "stack", "blog", "contact"]) {
			await page.goto(`/#${id}`);
			await expect(page.locator(`.deck__tick[href="#${id}"]`)).toHaveAttribute(
				"aria-current",
				"location"
			);

			const edges = await page.locator(".deck__tick").evaluateAll((ticks) =>
				ticks.map((tick) => {
					const { bottom, left, right, top } = tick.getBoundingClientRect();
					const mark = getComputedStyle(tick, "::before");
					const inset = (right - left - Number.parseFloat(mark.width)) / 2;
					const lift = (bottom - top - Number.parseFloat(mark.height)) / 2;

					return {
						bottom: bottom - lift,
						left: left + inset,
						right: right - inset,
						top: top + lift,
					};
				})
			);
			const first = edges.at(0) as (typeof edges)[number];
			const last = edges.at(-1) as (typeof edges)[number];
			const center = isPhone
				? (first.left + last.right) / 2 - viewport.width / 2
				: (first.top + last.bottom) / 2 - viewport.height / 2;

			expect(Math.abs(center)).toBeLessThan(1);
		}
	});
}

test("the phone dots share a line with the footer text", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");

	const center = async (selector: string) =>
		page.locator(selector).evaluate((element) => {
			const { top, height } = element.getBoundingClientRect();

			return top + height / 2;
		});

	const gap = Math.abs((await center(".deck__progress")) - (await center(".deck__count")));

	expect(gap).toBeLessThan(1.5);
});

test("hides the native scrollbar on the deck only", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("html")).toHaveCSS("scrollbar-width", "none");

	await page.goto("/story");
	await expect(page.locator("html")).toHaveCSS("scrollbar-width", "auto");
});

test("slides that are not ready say so", async ({ page }) => {
	await page.goto("/#projects");

	const slide = page.locator("#projects");

	await expect(slide.getByRole("heading", { level: 2 })).toHaveText("Projects");
	await expect(slide).toContainText("Work in progress");
	await expect(page.locator("#intro")).not.toContainText("Work in progress");
});

test("only the current theme's logo downloads", async ({ page }) => {
	const logos: string[] = [];

	page.on("request", (request) => {
		if (request.url().includes("logo-mark")) logos.push(request.url());
	});

	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/");
	await page.waitForLoadState("networkidle");

	expect(logos).toHaveLength(1);
	expect(logos[0]).toContain("logo-mark-dark");
});

test.describe("deck on a touch device", () => {
	test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

	test("does not download the animation library until it is needed", async ({
		browserName,
		page,
	}) => {
		test.skip(browserName === "firefox", "Firefox has no mobile emulation");

		await page.goto("/");
		await page.waitForLoadState("networkidle");

		expect(await page.evaluate(() => "AnimeJS" in window)).toBe(false);
	});
});

test.describe("deck, small laptop", () => {
	test.use({ viewport: { width: 1280, height: 720 } });

	test("fits the whole intro in one screen", async ({ page }) => {
		await page.goto("/");

		const height = await page.locator("#intro").evaluate((el) => el.getBoundingClientRect().height);

		expect(height).toBe(await fullHeight(page));
	});
});

test.describe("deck, phone", () => {
	test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

	test("shows the short copy and dots, without horizontal scroll", async ({ page }) => {
		await page.goto("/");

		await expect(page.locator(".intro__eyebrow--short")).toBeVisible();
		await expect(page.locator(".intro__lede--long")).toBeHidden();
		await expect(page.locator(".deck__progress")).toBeVisible();
		await expect(page.locator(".deck__next")).toBeHidden();
		await expect(page.locator(".deck__hint--scroll")).toBeHidden();
		await expect(page.locator(".intro")).toHaveJSProperty("tagName", "HGROUP");
		expect(
			await page.locator(".intro").evaluate((intro) => getComputedStyle(intro, "::before").width)
		).toBe("84px");
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
	});

	test("keeps everything reachable on a short screen", async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 480 });
		await page.goto("/");

		const github = page.getByRole("main").getByRole("link", { name: "GitHub" });

		await github.scrollIntoViewIfNeeded();
		await expect(github).toBeInViewport();
	});
});

test("keeps the Spanish headline on two lines on a small laptop", async ({ context, page }) => {
	await context.addCookies([
		{ name: "PARAGLIDE_LOCALE", value: "es", url: "http://localhost:4173" },
	]);
	await page.setViewportSize({ width: 1280, height: 720 });
	await page.goto("/");

	const lines = await page.locator(".intro__punchline").evaluate((el) => {
		const { fontSize, height } = getComputedStyle(el);

		return Math.round(Number.parseFloat(height) / (Number.parseFloat(fontSize) * 1.08));
	});

	expect(lines).toBe(1);
	expect(await page.locator("#intro").evaluate((el) => el.clientHeight)).toBe(720);
});

for (const [width, height, lines] of [
	[1440, 900, 1],
	[1280, 720, 1],
	[820, 1100, 1],
	[390, 844, 2],
] as const) {
	test(`the Spanish punchline takes ${lines} line(s) at ${width}px`, async ({ context, page }) => {
		await context.addCookies([
			{ name: "PARAGLIDE_LOCALE", value: "es", url: "http://localhost:4173" },
		]);
		await page.setViewportSize({ width, height });
		await page.goto("/");
		await page.evaluate(() => document.fonts.ready);

		const count = await page.locator(".intro__punchline").evaluate((element) => {
			const range = document.createRange();

			range.selectNodeContents(element);

			return new Set([...range.getClientRects()].map(({ top }) => Math.round(top))).size;
		});

		expect(count).toBe(lines);
	});
}

test("speaks Spanish with the language cookie", async ({ context, page }) => {
	await context.addCookies([
		{ name: "PARAGLIDE_LOCALE", value: "es", url: "http://localhost:4173" },
	]);
	await page.goto("/");

	await expect(page.getByRole("heading", { level: 1 })).toContainText(
		"Pozole primero, código después."
	);
	await expect(page.getByRole("link", { name: "Haz el recorrido" })).toBeVisible();
});

test("the deck has no wrapper and one navigation landmark", async ({ page }) => {
	await page.goto("/");

	await expect(page.locator("main > section.slide")).toHaveCount(6);
	await expect(page.locator("main > nav.deck")).toHaveCount(1);
	await expect(page.locator("main nav")).toHaveCount(1);
	await expect(page.locator("main > div")).toHaveCount(0);
	await expect(page.locator("main > footer")).toHaveCount(0);
});

test.describe("pages around the deck", () => {
	test("an unknown address shows a branded 404 with a way home", async ({ page }) => {
		const response = await page.goto("/nothing-here");

		expect(response?.status()).toBe(404);
		await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page got lost.");
		await expect(page.locator(".header__logo")).toBeVisible();
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");

		await page.waitForLoadState("networkidle");
		await page.getByRole("main").getByRole("link", { name: "Back home" }).click();
		await expect(page).toHaveURL("/");
	});

	test("the sitemap lists the public pages", async ({ request }) => {
		const response = await request.get("/sitemap.xml");

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("xml");
		expect(await response.text()).toContain("<loc>https://tuentyfaiv.com/story</loc>");
	});

	test("every page declares its canonical address and social tags", async ({ page }) => {
		await page.goto("/story");

		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			"https://tuentyfaiv.com/story"
		);
		await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary");
		await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "en_US");
	});

	test("structured data is valid JSON and the manifest loads", async ({ page, request }) => {
		await page.goto("/");

		const person = JSON.parse(
			(await page.locator('script[type="application/ld+json"]').textContent()) as string
		);

		expect(person.name).toBe("Tonalli López");
		expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
	});

	test("route changes keep working with view transitions", async ({ page }) => {
		const errors: string[] = [];

		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		await page.locator(".header__list").getByRole("link", { name: "Story" }).click();
		await expect(page.getByRole("heading", { level: 1 })).toHaveText("Story");
		await page.locator(".header__list").getByRole("link", { name: "Home" }).click();
		await expect(page.locator(".deck")).toBeVisible();

		expect(errors).toEqual([]);
	});
});
