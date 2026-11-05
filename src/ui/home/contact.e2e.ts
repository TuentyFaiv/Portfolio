import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

const email = "contact@tuentyfaiv.com";

/**
 * Contrast of each selector's text against the page and against the glow's brightest point
 * (14% of the brand color, the most the gradient ever reaches). The address is filled with
 * an image, not a color, so its own test below measures pixels instead.
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
		const primary = parse(
			getComputedStyle(document.querySelector(".contact__eyebrow") as Element).color
		);
		const glow = background
			.slice(0, 3)
			.map((value, index) => value * 0.85 + (primary[index] ?? 0) * 0.15);

		return selectors.flatMap((selector) =>
			[...document.querySelectorAll(`#contact ${selector}`)].flatMap((element) => {
				const text = parse(getComputedStyle(element).color);

				return [background, glow].map((under) => ({
					selector,
					ratio: contrast(over(text, under), under),
				}));
			})
		);
	}, selectors);
}

test.describe("contact slide, desktop", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("says hi, says what I'm open to, and gives every way to reach me", async ({ page }) => {
		await page.goto("/#contact");

		const slide = page.locator("#contact");

		await expect(slide).not.toContainText("Work in progress");
		await expect(slide.getByRole("heading", { level: 2 })).toHaveText("Bring pozole. Say hi.");
		await expect(slide).toContainText("Tell me what you're building and we'll see what it needs.");
		await expect(slide).toContainText("Open to side projects and new roles.");
		await expect(slide.getByRole("link", { name: email })).toHaveAttribute(
			"href",
			`mailto:${email}`
		);
		// The address is my contact details, and marked up as such.
		await expect(slide.locator("address").getByRole("link", { name: email })).toBeVisible();
		await expect(slide.locator("address")).toHaveCSS("font-style", "normal");

		const elsewhere = slide.getByRole("region", { name: "Elsewhere" });
		const links = elsewhere.getByRole("link");

		await expect(links).toHaveText([
			/GitHub\s*tuentyfaiv/,
			/LinkedIn\s*in\/tuentyfaiv/,
			/X\s*@tuentyfaiv/,
		]);
		for (const link of await links.all()) {
			await expect(link).toHaveAttribute("target", "_blank");
			await expect(link).toHaveAttribute("rel", /noopener/);
		}
		await expect(elsewhere).toContainText("Mexico City. Powered by pozole.");
	});

	test("never shows the phone number or a company name", async ({ page }) => {
		await page.goto("/#contact");

		const text = await page.locator("#contact").innerText();

		expect(text).not.toMatch(/\+?\d[\d\s-]{7,}/);
		expect(text).not.toMatch(/axial|nopal|consultant/i);
	});

	test("copies the address and says so", async ({ browserName, context, page }) => {
		test.skip(browserName !== "chromium", "only Chromium lets a test read the clipboard");
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		await page.goto("/#contact");
		await page.waitForLoadState("networkidle");

		const copy = page.getByRole("button", { name: "Copy email address" });

		await copy.click();

		const status = page.locator("#contact .contact__status");

		// The button shows a check; the word is only read out, never shown.
		await expect(page.locator("#contact .contact__icon--done")).toBeVisible();
		await expect(page.locator("#contact .contact__icon--copy")).toBeHidden();
		await expect(status).toHaveText("Copied");
		expect((await status.boundingBox())?.width).toBeLessThanOrEqual(1);
		expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(email);
		// The check and the message go away by themselves.
		await expect(status).toHaveText("", { timeout: 4000 });
		await expect(page.locator("#contact .contact__icon--copy")).toBeVisible();
	});

	test("says so when the copy fails", async ({ page }) => {
		await page.addInitScript(() => {
			Object.defineProperty(navigator, "clipboard", {
				value: { writeText: () => Promise.reject(new Error("denied")) },
			});
		});
		await page.goto("/#contact");
		await page.waitForLoadState("networkidle");

		await page.getByRole("button", { name: "Copy email address" }).click();

		const status = page.locator("#contact .contact__status");

		// No check here, so the words show on their own tag.
		await expect(status).toHaveText("Couldn't copy");
		expect((await status.boundingBox())?.width).toBeGreaterThan(40);
		await expect(page.locator("#contact .contact__icon--done")).toBeHidden();
	});

	for (const colorScheme of ["dark", "light"] as const) {
		test(`every text reaches 4.5:1, ${colorScheme}`, async ({ page }) => {
			await page.emulateMedia({ colorScheme });
			await page.goto("/#contact");
			await page.waitForLoadState("networkidle");

			const selectors = [
				".contact__eyebrow",
				".contact__title",
				".contact__lede",
				".contact__availability",
				".elsewhere__title",
				".elsewhere__name",
				".elsewhere__handle",
				".elsewhere__sign-off",
			];

			for (const { ratio, selector } of await ratios(page, selectors))
				expect(ratio, selector).toBeGreaterThanOrEqual(4.5);
		});
	}

	test("a live nebula band runs from the lede down and into the links, as in the design", async ({
		page,
	}) => {
		await page.goto("/#contact");

		const band = page.locator("#contact canvas.nebula--band");

		await expect(band).toHaveAttribute("aria-hidden", "true");
		// Drawn on the GPU wherever there is one; without one the page simply has no band.
		await expect
			.poll(() =>
				band.evaluate((canvas) =>
					canvas.dataset.ready !== undefined
						? `drawn with ${canvas.dataset.backend}`
						: (canvas.dataset.fallback ?? "")
				)
			)
			.toMatch(/^drawn with (webgpu|webgl)$|^no-gpu$/);

		const [slide, canvas, lede, links] = await Promise.all(
			[
				"#contact",
				"#contact canvas.nebula--band",
				"#contact .contact__lede",
				"#contact .elsewhere",
			].map((selector) => page.locator(selector).boundingBox())
		);

		if (!(slide && canvas && lede && links)) throw new Error("missing box");

		// From the screen's left edge into the links column.
		expect(canvas.x).toBeLessThanOrEqual(slide.x);
		expect(canvas.x + canvas.width).toBeGreaterThan(links.x + links.width / 2);
		// From just above the lede down to the slide's bottom edge.
		expect(canvas.y).toBeLessThan(lede.y);
		expect(canvas.y).toBeGreaterThan(lede.y - 48);
		expect(canvas.y + canvas.height).toBeCloseTo(slide.y + slide.height, 0);
	});

	for (const [width, height] of [
		[1440, 900],
		[1024, 768],
	] as const) {
		test(`the band fades out by the middle of the links, as in the design, ${width}x${height}`, async ({
			page,
		}) => {
			await page.setViewportSize({ height, width });
			await page.emulateMedia({ colorScheme: "dark" });
			await page.goto("/#contact");
			await expect(page.locator(".deck__count")).toContainText("06 / 06");

			const links = await page.locator("#contact .elsewhere").boundingBox();

			if (!links) throw new Error("missing box");

			// The band's box painted solid white in place of the clouds shows its fade at full strength.
			await page.evaluate(() => {
				for (const selector of ["#contact .contact__band canvas", "#contact .elsewhere"])
					(document.querySelector(selector) as HTMLElement).style.visibility = "hidden";
			});

			const without = await page.screenshot();

			await page.evaluate(() => {
				(document.querySelector("#contact .contact__band") as HTMLElement).style.backgroundColor =
					"#fff";
			});

			const painted = await page.screenshot();

			// The most any pixel changes with the band, at the start of the links and past their middle.
			const [start, end] = await page.evaluate(
				async ({ images, links }) => {
					const decode = async (base64: string) => {
						const image = new Image();

						image.src = `data:image/png;base64,${base64}`;
						await image.decode();

						const canvas = document.createElement("canvas");

						canvas.width = image.width;
						canvas.height = image.height;

						const context = canvas.getContext("2d", {
							willReadFrequently: true,
						}) as CanvasRenderingContext2D;

						context.drawImage(image, 0, 0);

						return context.getImageData(0, 0, image.width, image.height);
					};
					const [one, two] = await Promise.all(images.map(decode));

					if (!(one && two)) return [0, 0];

					// Screenshots are in device pixels (2x on the Safari profile), boxes in CSS pixels.
					const scale = one.width / window.innerWidth;
					const most = (from: number, to: number) => {
						let change = 0;

						for (let y = Math.ceil(links.y * scale); y < (links.y + links.height) * scale; y++)
							for (let x = Math.ceil(from * scale); x < to * scale; x++)
								for (let channel = 0; channel < 3; channel++) {
									const index = (y * one.width + x) * 4 + channel;

									change = Math.max(
										change,
										Math.abs((one.data[index] ?? 0) - (two.data[index] ?? 0))
									);
								}

						return change;
					};
					const middle = links.x + links.width / 2;

					return [most(links.x, links.x + 16), most(middle + 4, links.x + links.width)];
				},
				{ images: [without.toString("base64"), painted.toString("base64")], links }
			);

			expect(start, "band where the links start").toBeGreaterThan(20);
			expect(end, "band past the middle of the links").toBeLessThanOrEqual(1);
		});
	}

	test("on one column the band runs edge to edge from the lede through the links", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/#contact");

		const [slide, canvas, lede, links] = await Promise.all(
			[
				"#contact",
				"#contact canvas.nebula--band",
				"#contact .contact__lede",
				"#contact .elsewhere",
			].map((selector) => page.locator(selector).boundingBox())
		);

		if (!(slide && canvas && lede && links)) throw new Error("missing box");

		expect(canvas.x).toBe(slide.x);
		expect(canvas.width).toBe(slide.width);
		expect(canvas.y).toBeLessThan(lede.y);
		expect(canvas.y + canvas.height).toBeGreaterThanOrEqual(links.y + links.height);
	});

	test("the band only draws while its slide is on screen", async ({ page }) => {
		await page.goto("/#contact");

		const band = page.locator("#contact canvas.nebula--band");
		const draws = async () => {
			await band.dispatchEvent("nebula:stats");
			await expect(band).toHaveAttribute("data-stats", /draws/);

			const stats = JSON.parse((await band.getAttribute("data-stats")) ?? "{}") as {
				draws: number;
			};

			await band.evaluate((canvas) => delete canvas.dataset.stats);

			return stats.draws;
		};

		await expect(band).toHaveAttribute("data-ready", "");
		test.skip(
			(await band.getAttribute("data-mode")) !== "live",
			"a software renderer draws one still frame, so there is no loop to stop"
		);

		const shown = await draws();

		await page.waitForTimeout(1000);
		expect(await draws()).toBeGreaterThan(shown + 10);

		await page.locator(".deck").getByRole("link", { name: "Back to start" }).click();
		await expect(page.locator(".deck__count")).toContainText("01 / 06");
		await page.waitForTimeout(500);

		const hidden = await draws();

		await page.waitForTimeout(1000);
		expect(await draws()).toBe(hidden);
	});

	test("the email button has the size and type of the other buttons on the site", async ({
		page,
	}) => {
		await page.goto("/#contact");

		const measure = (selector: string) =>
			page.locator(selector).evaluate((element) => {
				const style = getComputedStyle(element);

				return {
					family: style.fontFamily,
					height: Math.round(element.getBoundingClientRect().height),
					size: style.fontSize,
					spacing: style.letterSpacing,
					weight: style.fontWeight,
				};
			});
		const ghost = await measure(".intro__action--ghost");
		const pill = await measure("#contact .contact__email");

		expect(pill).toEqual(ghost);
	});

	test("the last slide offers a way back to the start", async ({ page }) => {
		await page.goto("/#contact");
		await page.waitForLoadState("networkidle");

		const back = page.locator(".deck").getByRole("link", { name: "Back to start" });

		await expect(back).toBeVisible();
		await expect(back).toHaveAttribute("href", "#intro");

		await back.click();

		await expect(page.locator(".deck__count")).toContainText("01 / 06");
		await expect(back).toBeHidden();
	});

	test("speaks Spanish with the language cookie", async ({ context, page }) => {
		await context.addCookies([
			{ name: "PARAGLIDE_LOCALE", value: "es", url: "http://localhost:4173" },
		]);
		await page.goto("/#contact");
		await page.waitForLoadState("networkidle");

		const slide = page.locator("#contact");

		await expect(slide.getByRole("heading", { level: 2 })).toHaveText("Trae pozole. Saluda.");
		await expect(slide.getByRole("button", { name: "Copiar correo" })).toBeVisible();
		await expect(slide.getByRole("region", { name: "En otros lados" })).toBeVisible();
		await expect(
			page.locator(".deck").getByRole("link", { name: "Volver al inicio" })
		).toBeVisible();
	});
});

test.describe("contact slide without JavaScript", () => {
	test.use({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });

	test("keeps the mail link and hides the copy button, which could not work", async ({ page }) => {
		await page.goto("/#contact");

		await expect(page.locator("#contact").getByRole("link", { name: email })).toBeVisible();
		await expect(page.locator("#contact .contact__copy")).toBeHidden();
	});
});

test("on a phone everything fits above the footer, and the links keep their heading for screen readers", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/#contact");
	await page.waitForLoadState("networkidle");

	const bottom = await page
		.locator("#contact .elsewhere")
		.evaluate((section) => section.getBoundingClientRect().bottom);
	const footer = await page
		.locator(".deck__count")
		.evaluate((count) => count.getBoundingClientRect().top);

	expect(bottom).toBeLessThan(footer);
	await expect(page.locator("#contact .elsewhere__title")).toHaveCSS("position", "absolute");
	await expect(page.locator("#contact").getByRole("region", { name: "Elsewhere" })).toBeVisible();
	await expect(page.locator(".deck").getByRole("link", { name: "Back to start" })).toBeVisible();
});

/**
 * Every line of text against what is really drawn behind it, band included: the text is
 * hidden but keeps its box, one screenshot is taken, and each pixel inside each box must
 * reach 4.5:1 with that text's color.
 */
const texts = [
	"#contact .contact__eyebrow",
	"#contact .contact__title",
	"#contact .contact__lede",
	"#contact .contact__availability",
	"#contact .contact__mail",
	"#contact .elsewhere__title",
	"#contact .elsewhere__name",
	"#contact .elsewhere__handle",
	"#contact .elsewhere__sign-off",
	".deck__count",
	".deck__back",
];

for (const [width, height] of [
	[1440, 900],
	[1280, 640],
	[1024, 768],
	[768, 1024],
	[390, 844],
] as const) {
	for (const colorScheme of ["dark", "light"] as const) {
		test(`every line of text stays readable over the band, ${width}x${height}, ${colorScheme}`, async ({
			page,
		}) => {
			await page.setViewportSize({ height, width });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/#contact");
			await page.waitForLoadState("networkidle");
			await expect
				.poll(() =>
					page
						.locator("#contact canvas.nebula--band")
						.evaluate((canvas) => "ready" in canvas.dataset || "fallback" in canvas.dataset)
				)
				.toBe(true);
			// The footer swaps its text when the slide settles; measure the final one.
			await expect(page.locator(".deck__count")).toContainText("06 / 06");

			const boxes = await page.evaluate((selectors) => {
				const found = selectors.flatMap((selector) =>
					[...document.querySelectorAll<HTMLElement>(selector)].map((element) => {
						const range = document.createRange();

						range.selectNodeContents(element);

						const { height, width, x, y } = range.getBoundingClientRect();

						return { element, height, ink: getComputedStyle(element).color, selector, width, x, y };
					})
				);
				const visible = found.filter(
					(box) =>
						box.width > 2 &&
						box.height > 2 &&
						box.y >= 0 &&
						box.y + box.height <= window.innerHeight
				);

				// No fade: the screenshot must not catch the letters halfway out.
				for (const box of visible) {
					box.element.style.transition = "none";
					box.element.style.color = "transparent";
				}

				return visible.map(({ element: _, ...box }) => box);
			}, texts);

			expect(boxes.length).toBeGreaterThan(6);

			const shot = await page.screenshot();
			const results = await page.evaluate(
				async ({ base64, boxes }) => {
					const luminance = (r: number, g: number, b: number) => {
						const [lr = 0, lg = 0, lb = 0] = [r, g, b].map((value) => {
							const channel = value / 255;

							return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
						});

						return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
					};
					const image = new Image();

					image.src = `data:image/png;base64,${base64}`;
					await image.decode();

					const canvas = document.createElement("canvas");

					canvas.width = image.width;
					canvas.height = image.height;

					const context = canvas.getContext("2d", {
						willReadFrequently: true,
					}) as CanvasRenderingContext2D;

					context.drawImage(image, 0, 0);

					const { data } = context.getImageData(0, 0, image.width, image.height);
					// Screenshots are in device pixels (2x on the Safari profile), boxes in CSS pixels.
					const scale = image.width / window.innerWidth;
					const probe = document.createElement("canvas").getContext("2d", {
						willReadFrequently: true,
					}) as CanvasRenderingContext2D;

					return boxes.map((box) => {
						probe.fillStyle = box.ink;
						probe.fillRect(0, 0, 1, 1);

						const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data;
						const text = luminance(r, g, b);
						let lowest = Number.POSITIVE_INFINITY;

						for (
							let y = Math.ceil(box.y * scale);
							y < Math.floor((box.y + box.height) * scale);
							y++
						) {
							for (
								let x = Math.ceil(box.x * scale);
								x < Math.floor((box.x + box.width) * scale);
								x++
							) {
								const index = (y * image.width + x) * 4;
								const behind = luminance(
									data[index] ?? 0,
									data[index + 1] ?? 0,
									data[index + 2] ?? 0
								);

								lowest = Math.min(
									lowest,
									(Math.max(text, behind) + 0.05) / (Math.min(text, behind) + 0.05)
								);
							}
						}

						return { lowest, selector: box.selector };
					});
				},
				{ base64: shot.toString("base64"), boxes }
			);

			for (const { lowest, selector } of results)
				expect(lowest, selector).toBeGreaterThanOrEqual(4.5);
		});
	}
}
