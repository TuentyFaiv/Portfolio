import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

const years = ["2016", "2018", "2021", "2022", "2023", "2024", "2025", "2026"];

interface Stats {
	draws: number;
	presence: number;
	ripple: number[];
	theme: number;
	scale: number;
}

/** The renderer's own report, which works whether it draws on the page or in a worker. */
async function stats(page: Page): Promise<Stats> {
	return page.locator(".nebula").evaluate(async (canvas) => {
		const before = canvas.dataset.stats;

		canvas.dispatchEvent(new Event("nebula:stats"));

		for (let wait = 0; wait < 40 && canvas.dataset.stats === before; wait += 1) {
			await new Promise((resolve) => setTimeout(resolve, 25));
		}

		return JSON.parse(canvas.dataset.stats ?? "{}");
	});
}

async function openStory(page: Page, hash = "") {
	await page.goto(`/story${hash}`);
	await page.waitForLoadState("networkidle");
}

test.describe("story deck, desktop", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("opens with the headline and lists one slide per year, in order", async ({ page }) => {
		await openStory(page);

		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"Learning since 2016. Shipping since 17."
		);
		await expect(page.locator("main > section.slide")).toHaveCount(9);
		await expect(page.locator(".chapter__year")).toHaveText(years);
		await expect(page.getByRole("heading", { level: 2 })).toHaveText([
			"Learning to code",
			"First clients",
			"First team",
			"Frontend Lead",
			"Going deeper",
			"AI, with judgment",
			"Rust at work",
			"Not done yet",
		]);
	});

	test("shares the home deck: footer, rail and Space", async ({ page }) => {
		await openStory(page);

		await expect(page.locator(".deck__count")).toContainText("01 / 09");
		await expect(page.locator(".deck__next")).toContainText("2016");
		await expect(page.locator(".deck__progress").getByRole("link")).toHaveCount(9);

		await page.keyboard.press("Space");

		await expect(page.locator(".deck__count")).toContainText("02 / 09");
		await expect(page.locator(".deck__next")).toContainText("2018");
	});

	test("a year can be linked directly and marks itself current", async ({ page }) => {
		await openStory(page, "#year-2022");

		await expect(page.locator(".deck__count")).toContainText("05 / 09");
		await expect(
			page.locator(".deck__progress").getByRole("link", { name: "2022", exact: true })
		).toHaveAttribute("aria-current", "location");
	});

	test("a shared link to a year lands exactly on it, every time", async ({ browser }) => {
		for (let attempt = 0; attempt < 5; attempt += 1) {
			const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
			const page = await context.newPage();

			await page.goto("http://localhost:4173/story#year-2022");
			await page.waitForLoadState("networkidle");

			const offset = await page
				.locator("#year-2022")
				.evaluate((slide) => Math.round(slide.getBoundingClientRect().top));

			expect(offset).toBe(0);
			await context.close();
		}
	});

	test("the last chapter ends the deck with no next link", async ({ page }) => {
		await openStory(page, "#year-2026");

		await expect(page.locator(".deck__count")).toContainText("09 / 09");
		await expect(page.locator(".deck__next")).toBeHidden();
	});

	test("never names a company or prints the hidden number", async ({ page }) => {
		await openStory(page);

		const text = await page.locator("main").innerText();

		// The number on its own: the year 2025 is fine.
		expect(text).not.toMatch(/(?<!\d)25(?!\d)/);
		expect(text).not.toMatch(/axial|nopal/i);
	});

	test("the story is still the current page in the header", async ({ page }) => {
		await openStory(page);

		await expect(
			page.locator(".header__list").getByRole("link", { name: "Story" })
		).toHaveAttribute("aria-current", "page");
	});
});

test.describe("story nebula", () => {
	for (const [colorScheme, width] of [
		["dark", 1440],
		["light", 390],
	] as const) {
		test(`downloads no image at all, ${colorScheme} at ${width}px`, async ({ browser }) => {
			const context = await browser.newContext({ colorScheme, viewport: { width, height: 844 } });
			const page = await context.newPage();
			const images: string[] = [];

			page.on("request", (request) => {
				if (request.resourceType() === "image") images.push(request.url());
			});

			await page.goto("http://localhost:4173/story");
			await page.waitForLoadState("networkidle");
			await page.waitForTimeout(500);

			// The nebula is computed on the GPU; the sky before it is plain CSS.
			expect(images.filter((url) => !url.includes("logo"))).toEqual([]);
			await context.close();
		});
	}

	test("other pages never download it", async ({ page }) => {
		const images: string[] = [];

		page.on("request", (request) => {
			if (request.resourceType() === "image" && !request.url().includes("logo"))
				images.push(request.url());
		});

		await page.goto("/");
		await page.waitForLoadState("networkidle");

		expect(images).toEqual([]);
	});

	test("more contrast replaces it with a plain background", async ({ browser }) => {
		const context = await browser.newContext({ contrast: "more" });
		const page = await context.newPage();

		await page.goto("http://localhost:4173/story");

		const image = await page.evaluate(
			() => getComputedStyle(document.body, "::before").backgroundImage
		);

		expect(image).toBe("none");
		await context.close();
	});
});

/*
 * axe cannot measure text over a photo, so this test does: it hides the text, takes a
 * screenshot of what is really behind each line, and checks the worst pixel.
 */
test.describe("story text over the nebula", () => {
	test.use({ bypassCSP: true, reducedMotion: "reduce" });

	for (const colorScheme of ["dark", "light"] as const) {
		for (const viewport of [
			{ width: 1440, height: 900 },
			{ width: 390, height: 844 },
		]) {
			test(`reaches WCAG AA on every slide, ${colorScheme} at ${viewport.width}px`, async ({
				page,
			}) => {
				await page.emulateMedia({ colorScheme });
				await page.setViewportSize(viewport);
				await openStory(page);

				const slides = ["story", ...years.map((year) => `year-${year}`)];

				for (const id of slides) {
					await page.goto(`/story#${id}`);
					await page.waitForTimeout(150);

					const targets = await page.locator(`#${id}`).evaluate((slide) => {
						const elements = slide.querySelectorAll<HTMLElement>(
							".opening__eyebrow, .opening__title, .chapter__year, .chapter__title, .chapter__body"
						);

						return [...elements].map((element) => {
							const { height, left, top, width } = element.getBoundingClientRect();
							const styles = getComputedStyle(element);
							const big = Number.parseFloat(styles.fontSize) >= 24;
							const gradient = styles.backgroundImage.includes("gradient");
							const colors = gradient
								? [
										getComputedStyle(document.documentElement).getPropertyValue("--headline-from"),
										getComputedStyle(document.documentElement).getPropertyValue("--headline-to"),
									]
								: [styles.color];

							return { big, colors, rect: { height, width, x: left, y: top } };
						});
					});

					await page.addStyleTag({
						content: "main * { color: transparent !important; background: none !important; }",
					});

					for (const { big, colors, rect } of targets) {
						const shot = await page.screenshot({ clip: rect });
						const ratio = await page.evaluate(
							async ({ data, colors }) => {
								const image = new Image();

								image.src = `data:image/png;base64,${data}`;
								await image.decode();

								const canvas = document.createElement("canvas");
								const context = canvas.getContext("2d", {
									willReadFrequently: true,
								}) as CanvasRenderingContext2D;

								canvas.width = image.width;
								canvas.height = image.height;
								context.drawImage(image, 0, 0);

								const parse = (color: string) => {
									context.fillStyle = color.trim();
									context.fillRect(0, 0, 1, 1);

									const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;

									context.drawImage(image, 0, 0);

									return [r, g, b];
								};
								const luminance = ([r = 0, g = 0, b = 0]: number[]) =>
									[r, g, b]
										.map((value) => {
											const channel = value / 255;

											return channel <= 0.03928
												? channel / 12.92
												: ((channel + 0.055) / 1.055) ** 2.4;
										})
										.reduce(
											(sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index],
											0
										);

								const texts = colors.map((color) => luminance(parse(color)));
								const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
								let worst = Number.POSITIVE_INFINITY;

								for (let index = 0; index < pixels.length; index += 4) {
									const background = luminance([
										pixels[index],
										pixels[index + 1],
										pixels[index + 2],
									] as number[]);

									for (const text of texts) {
										const [low, high] = [text, background].sort((a, b) => a - b);

										worst = Math.min(worst, ((high as number) + 0.05) / ((low as number) + 0.05));
									}
								}

								return worst;
							},
							{ data: shot.toString("base64"), colors }
						);

						expect(ratio, `${id} at ${rect.y}`).toBeGreaterThanOrEqual(big ? 3 : 4.5);
					}

					await page.reload();
					await page.waitForLoadState("networkidle");
				}
			});
		}
	}
});

test.describe("live nebula", () => {
	test.use({ viewport: { width: 800, height: 500 } });

	// The animation only runs on a real GPU; without one there is nothing to test here.
	test.beforeEach(async ({ page }) => {
		await page.goto("/blog");

		const software = await page.evaluate(() => {
			const gl = document.createElement("canvas").getContext("webgl");
			const info = gl?.getExtension("WEBGL_debug_renderer_info");

			return (
				!gl ||
				/swiftshader|llvmpipe|software/i.test(
					String(info && gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
				)
			);
		});

		test.skip(software, "No GPU in this browser: one still frame is drawn instead");
	});

	const frame = (page: Page) => page.locator(".nebula").screenshot();

	test("draws and keeps moving when motion is allowed", async ({ page }) => {
		await openStory(page);
		await expect(page.locator(".nebula")).toHaveAttribute("data-ready", "");
		// Past the fade-in, so any change below comes from the animation itself.
		await page.waitForTimeout(800);

		const before = await frame(page);

		await page.waitForTimeout(700);

		expect((await frame(page)).equals(before)).toBe(false);
	});

	test("draws one still frame and stops with reduced motion", async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await openStory(page);
		await expect(page.locator(".nebula")).toHaveAttribute("data-ready", "");

		const before = await frame(page);

		await page.mouse.move(700, 100);
		await page.mouse.click(400, 250);
		await page.waitForTimeout(700);

		expect((await frame(page)).equals(before)).toBe(true);
	});

	test("stops drawing while the tab is hidden", async ({ page }) => {
		await openStory(page);
		await expect(page.locator(".nebula")).toHaveAttribute("data-ready", "");

		const visible = (await stats(page)).draws;

		await page.waitForTimeout(500);
		expect((await stats(page)).draws).toBeGreaterThan(visible);

		await page.evaluate(() => {
			Object.defineProperty(document, "hidden", { configurable: true, value: true });
			document.dispatchEvent(new Event("visibilitychange"));
		});
		await page.waitForTimeout(100);

		const hidden = (await stats(page)).draws;

		await page.waitForTimeout(700);
		expect((await stats(page)).draws).toBe(hidden);
	});

	test("a CPU-only renderer draws one still frame and never animates", async ({
		browserName,
		playwright,
	}) => {
		test.skip(browserName !== "chromium", "Launches its own Chromium");

		// SwiftShader: Chromium's renderer for machines with no usable GPU.
		const browser = await playwright.chromium.launch({
			args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
		});
		const page = await browser.newPage();

		await page.goto("http://localhost:4173/story");
		await page.waitForLoadState("networkidle");

		await expect(page.locator(".nebula")).toHaveAttribute("data-mode", "still");

		const drawn = (await stats(page)).draws;

		await page.waitForTimeout(700);
		expect((await stats(page)).draws).toBe(drawn);
		await browser.close();
	});

	test("without a GPU the CSS sky stays, with no image", async ({ page }) => {
		await page.goto("/story?nebula=none");
		await page.waitForLoadState("networkidle");

		await expect(page.locator(".nebula")).toHaveAttribute("data-fallback", "disabled");
		await expect(page.locator(".nebula")).toHaveCSS("opacity", "0");

		const sky = await page.evaluate(
			() => getComputedStyle(document.body, "::before").backgroundImage
		);

		expect(sky).toContain("radial-gradient");
		expect(sky).not.toContain("url(");
	});

	test("WebGPU and WebGL draw the same nebula", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });

		const capture = async (query: string) => {
			await page.goto(`/story${query}`);
			await page.waitForLoadState("networkidle");
			await expect(page.locator(".nebula")).toHaveAttribute("data-ready", "");
			await page.waitForTimeout(400);

			return {
				backend: await page.locator(".nebula").getAttribute("data-backend"),
				shot: (await page.screenshot()).toString("base64"),
			};
		};
		const best = await capture("");
		const webgl = await capture("?nebula=webgl");

		test.skip(best.backend !== "webgpu", "No WebGPU in this browser");
		expect(webgl.backend).toBe("webgl");

		const difference = await page.evaluate(
			async ({ a, b }) => {
				const load = async (data: string) => {
					const image = new Image();

					image.src = `data:image/png;base64,${data}`;
					await image.decode();

					return image;
				};
				const [one, two] = await Promise.all([load(a), load(b)]);
				const canvas = document.createElement("canvas");
				const context = canvas.getContext("2d", {
					willReadFrequently: true,
				}) as CanvasRenderingContext2D;

				canvas.width = one.width;
				canvas.height = one.height;
				context.drawImage(one, 0, 0);

				const first = context.getImageData(0, 0, canvas.width, canvas.height).data;

				context.drawImage(two, 0, 0);

				const second = context.getImageData(0, 0, canvas.width, canvas.height).data;
				let total = 0;

				for (let index = 0; index < first.length; index += 1) {
					total += Math.abs((first[index] ?? 0) - (second[index] ?? 0));
				}

				return total / first.length;
			},
			{ a: best.shot, b: webgl.shot }
		);

		expect(difference).toBeLessThan(1);
	});

	test("a GPU reset brings the CSS sky back", async ({ page }) => {
		await openStory(page);
		await expect(page.locator(".nebula")).toHaveAttribute("data-ready", "");
		expect(
			await page.evaluate(() => getComputedStyle(document.body, "::before").backgroundImage)
		).toBe("none");

		// The page cannot reach the worker's context, so it simulates the renderer's report.
		await page.locator(".nebula").evaluate((canvas) => {
			delete canvas.dataset.ready;
		});

		expect(
			await page.evaluate(() => getComputedStyle(document.body, "::before").backgroundImage)
		).toContain("radial-gradient");
	});

	test("switching theme keeps the same clouds and only changes their colors", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" });

		const images: string[] = [];

		page.on("request", (request) => {
			if (request.url().includes("/story/nebula"))
				images.push(request.url().split("/").pop() ?? "");
		});
		await openStory(page);
		await expect(page.locator(".nebula")).toHaveAttribute("data-ready", "");

		await page.locator(".themeswitch").click();

		await expect(page.locator("html")).not.toHaveClass(/dark/);
		await page.waitForTimeout(800);
		await expect(page.locator(".nebula")).toHaveAttribute("data-ready", "");
		// The same shader recolors itself: switching theme fetches nothing.
		expect(images.filter((url) => !url.includes("logo"))).toEqual([]);
	});

	test("hover and click bend the clouds near the pointer only", async ({ browserName, page }) => {
		// WebKit screenshots take long enough for the ripple to leave the measured area;
		// "the pointer reaches the shader" below covers WebKit through the shader inputs.
		test.skip(browserName === "webkit", "Screenshots are too slow to catch a moving ripple");
		await page.emulateMedia({ colorScheme: "dark" });
		await openStory(page);
		await page.waitForTimeout(600);

		const change = async (act: () => Promise<void>) => {
			const before = await page.screenshot();

			await act();
			await page.waitForTimeout(450);

			const after = await page.screenshot();

			return page.evaluate(
				async ({ a, b }) => {
					const load = async (data: string) => {
						const image = new Image();

						image.src = `data:image/png;base64,${data}`;
						await image.decode();

						return image;
					};
					const [first, second] = await Promise.all([load(a), load(b)]);
					const canvas = document.createElement("canvas");
					const context = canvas.getContext("2d", {
						willReadFrequently: true,
					}) as CanvasRenderingContext2D;

					canvas.width = first.width;
					canvas.height = first.height;
					context.drawImage(first, 0, 0);

					const one = context.getImageData(0, 0, canvas.width, canvas.height).data;

					context.drawImage(second, 0, 0);

					const two = context.getImageData(0, 0, canvas.width, canvas.height).data;
					let near = 0;
					let far = 0;
					let nearCount = 0;
					let farCount = 0;

					for (let index = 0; index < one.length; index += 4) {
						const x = (index / 4) % canvas.width;
						const y = Math.floor(index / 4 / canvas.width);
						const distance = Math.hypot(x - 600, y - 250);
						const value =
							Math.abs((one[index] ?? 0) - (two[index] ?? 0)) +
							Math.abs((one[index + 1] ?? 0) - (two[index + 1] ?? 0));

						if (distance < 180) {
							near += value;
							nearCount += 1;
						} else if (distance > 320) {
							far += value;
							farCount += 1;
						}
					}

					return near / nearCount / Math.max(far / farCount, 0.01);
				},
				{ a: before.toString("base64"), b: after.toString("base64") }
			);
		};

		// The clouds drift on their own, so each effect is measured against the same wait
		// with no pointer at all.
		const idle = await change(async () => undefined);

		expect(await change(() => page.mouse.move(600, 250, { steps: 6 }))).toBeGreaterThan(idle * 1.2);
		expect(await change(() => page.mouse.click(600, 250))).toBeGreaterThan(idle * 1.2);
	});

	for (const reducedMotion of ["no-preference", "reduce"] as const) {
		test(`the pointer ${reducedMotion === "reduce" ? "never reaches" : "reaches"} the shader with motion ${reducedMotion}`, async ({
			page,
		}) => {
			await page.emulateMedia({ reducedMotion });
			await openStory(page);
			await expect(page.locator(".nebula")).toHaveAttribute("data-ready", "");

			await page.mouse.move(600, 250, { steps: 6 });
			await page.mouse.click(600, 250);
			await page.waitForTimeout(900);

			const { presence, ripple } = await stats(page);

			if (reducedMotion === "reduce") {
				expect(presence).toBe(0);
				expect(ripple[2]).toBe(-99);
			} else {
				expect(presence).toBeGreaterThan(0.5);
				// The renderer keeps the ripple as a fraction of the 800 by 500 canvas.
				expect([Math.round((ripple[0] ?? 0) * 800), Math.round((ripple[1] ?? 0) * 500)]).toEqual([
					600, 250,
				]);
			}
		});
	}

	test("is hidden with more contrast", async ({ browser }) => {
		const context = await browser.newContext({ contrast: "more" });
		const page = await context.newPage();

		await page.goto("http://localhost:4173/story");

		await expect(page.locator(".nebula")).toBeHidden();
		await context.close();
	});

	test("stops drawing as soon as the visitor leaves", async ({ page }) => {
		await openStory(page);
		await expect(page.locator(".nebula")).toHaveAttribute("data-ready", "");
		await page
			.locator(".nebula")
			.evaluate((canvas) => canvas.dispatchEvent(new Event("nebula:pause")));
		await page.waitForTimeout(100);

		const paused = (await stats(page)).draws;

		await page.waitForTimeout(600);
		expect((await stats(page)).draws).toBe(paused);
		// The still image takes over, so a route crossfade never captures the canvas.
		await expect(page.locator(".nebula")).toBeHidden();
		expect(
			await page.evaluate(() => getComputedStyle(document.body, "::before").backgroundImage)
		).toContain("radial-gradient");
	});

	test("leaves no canvas behind on other pages", async ({ page }) => {
		await openStory(page);
		await page.locator(".header__list").getByRole("link", { name: "Home" }).click();

		await expect(page.locator(".deck__count")).toContainText("Intro");
		await expect(page.locator("canvas:not(.nebula--band)")).toHaveCount(0);
		// The home page's own band waits for the Contact slide: nothing draws on the intro.
		await expect(page.locator("canvas.nebula--band")).not.toHaveAttribute("data-backend", /.+/);
	});
});

test.describe("story deck, phone", () => {
	test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

	test("fits every chapter without horizontal scroll", async ({ page }) => {
		await openStory(page);

		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
	});

	test("keeps everything reachable on a short screen", async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 480 });
		await openStory(page, "#year-2018");

		const body = page.locator("#year-2018 .chapter__body");

		await body.scrollIntoViewIfNeeded();
		await expect(body).toBeInViewport();
	});
});

test("speaks Spanish with the language cookie", async ({ context, page }) => {
	await context.addCookies([
		{ name: "PARAGLIDE_LOCALE", value: "es", url: "http://localhost:4173" },
	]);
	await openStory(page);

	await expect(page.getByRole("heading", { level: 1 })).toContainText("Aprendiendo desde 2016.");
	await expect(page.locator(".deck__count")).toContainText("Historia");
});
