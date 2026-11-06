import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

const STRAYS = 18;
const STOPS = 8;
const NAMES = [
	"00 Into the nebula",
	"01 fetchzen",
	...Array.from({ length: 6 }, (_, index) => `0${index + 2} Undiscovered`),
];

async function open(page: Page) {
	await page.goto("/#projects");
	await page.waitForLoadState("networkidle");
	await expect(page.locator(".deck__count")).toContainText("02 / 06");
}

const track = (page: Page) => page.locator(".track");
const stopButtons = (page: Page) => track(page).getByRole("listitem").getByRole("button");

/** Which stop fills the track, from where it has scrolled to. */
const stopInView = (page: Page) =>
	page.evaluate(() => {
		const element = document.querySelector(".journey__track") as HTMLElement;

		return element.scrollLeft / element.clientWidth;
	});

async function goTo(page: Page, stop: number) {
	await stopButtons(page).nth(stop).click();
	await expect.poll(() => stopInView(page)).toBe(stop);
}

test.describe("into the nebula, desktop", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("one screen, like every slide, with a track of eight stops", async ({ page }) => {
		await open(page);

		const slide = page.locator("#projects");

		await expect(slide).not.toContainText("Work in progress");
		await expect(slide.getByRole("heading", { level: 2 })).toHaveText("Into the nebula.");
		expect(await slide.evaluate((element) => (element as HTMLElement).offsetHeight)).toBe(900);
		await expect(page.getByRole("group", { name: "Constellations" })).toBeVisible();
		await expect(stopButtons(page)).toHaveText(NAMES);
		await expect(stopButtons(page).first()).toHaveAttribute("aria-current", "step");
		await expect(track(page).getByRole("button", { name: "Previous" })).toHaveAttribute(
			"aria-disabled",
			"true"
		);
	});

	test("left and right travel along the track; the deck stays on Projects", async ({ page }) => {
		await open(page);

		await page.keyboard.press("ArrowRight");
		await expect.poll(() => stopInView(page)).toBe(1);
		await expect(page.locator(".journey")).toHaveAttribute("data-stop", "1");
		await expect(stopButtons(page).nth(1)).toHaveAttribute("aria-current", "step");
		await expect(page.getByRole("heading", { level: 3, name: "fetchzen" })).toBeVisible();
		// Sideways only: the page itself has not moved.
		expect(await page.evaluate(() => window.scrollY)).toBe(900);
		await expect(page.locator(".deck__count")).toContainText("02 / 06");

		await page.keyboard.press("ArrowRight");
		await expect.poll(() => stopInView(page)).toBe(2);
		await page.keyboard.press("ArrowLeft");
		await page.keyboard.press("ArrowLeft");
		await expect.poll(() => stopInView(page)).toBe(0);
		// The ends do not wrap.
		await page.keyboard.press("ArrowLeft");
		await page.waitForTimeout(300);
		expect(await stopInView(page)).toBe(0);
	});

	test("a horizontal trackpad swipe travels too", async ({ page }) => {
		await open(page);

		await page.mouse.move(720, 450);
		await page.mouse.wheel(1000, 0);
		await expect.poll(() => stopInView(page)).toBe(1);
		await expect(page.locator(".deck__count")).toContainText("02 / 06");
	});

	test("up and down always change slide, from any stop", async ({ page }) => {
		await open(page);
		await goTo(page, 3);

		// The wheel over the track scrolls the page, not the track. (One synthetic wheel of a
		// screen's height can carry WebKit past the next slide, so only the leaving is checked.)
		await page.mouse.move(720, 450);
		await page.mouse.wheel(0, 900);
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(1800);
		await expect(page.locator(".deck__count")).not.toContainText("02 / 06");
		expect(await stopInView(page)).toBe(3);
	});

	test("the arrows and the dots move along the track", async ({ page }) => {
		await open(page);

		const next = track(page).getByRole("button", { name: "Next" });

		await next.click();
		await expect.poll(() => stopInView(page)).toBe(1);
		await next.click();
		await expect.poll(() => stopInView(page)).toBe(2);
		await expect(page.locator(".stop[data-index='2'] .project__crumbs")).toHaveText(
			"Projects / 02 of 07"
		);
		await expect(page.locator(".stop[data-index='2']")).not.toContainText("Open project");

		// On the last stop, forward is the way home.
		await goTo(page, 7);
		await expect(track(page).getByRole("button", { name: "Back to the start" })).toBeEnabled();
		await expect(next).toHaveCount(0);

		await stopButtons(page).nth(1).click();
		await expect.poll(() => stopInView(page)).toBe(1);
		await expect(stopButtons(page).nth(1)).toHaveAttribute("aria-current", "step");
	});

	test("lands on fetchzen: what it is, its facts, where to find it", async ({ page }) => {
		await open(page);
		await goTo(page, 1);

		const stop = page.locator(".stop[data-index='1']");

		await expect(stop.getByRole("heading", { level: 3 })).toHaveText("fetchzen");
		await expect(stop.getByRole("list", { name: "Built with" }).getByRole("listitem")).toHaveText([
			"TypeScript",
			"Fetch API",
			"Vitest",
			"npm",
		]);
		await expect(stop.locator(".project__facts dd")).toHaveText([
			"Author & maintainer",
			"2023",
			"0.2.0 on npm",
		]);

		const project = stop.getByRole("link", { name: "Open project" });
		const source = stop.getByRole("link", { name: "Source" });

		await expect(project).toHaveAttribute("href", "https://fetchzen.dev");
		await expect(source).toHaveAttribute("href", "https://github.com/TuentyFaiv/http");
		for (const link of [project, source]) {
			await expect(link).toHaveAttribute("target", "_blank");
			await expect(link).toHaveAttribute("rel", "noopener noreferrer");
		}
		await expect(
			stop.getByRole("figure", { name: "What it does" }).getByRole("listitem")
		).toHaveText(["Typed responses", "Validation", "Retries", "Timeout", "Progress", "Hooks"]);
	});

	test("Tab reaching a link on another stop brings that stop into view", async ({ page }) => {
		await open(page);

		await page.getByRole("link", { name: "Open project" }).focus();
		await expect.poll(() => stopInView(page)).toBe(1);
		await expect(stopButtons(page).nth(1)).toHaveAttribute("aria-current", "step");
		expect(await page.evaluate(() => window.scrollY)).toBe(900);
	});

	test("finding all eighteen strays, stop by stop, reveals the name", async ({ page }) => {
		await open(page);
		await expect(page.locator(".strays__hit")).toHaveCount(STRAYS);

		for (let stop = 0; stop < STOPS; stop++) {
			await goTo(page, stop);

			const hits = page.locator(`.stop[data-index='${stop}'] .strays__hit`);

			for (const hit of await hits.all()) await hit.click();
		}

		await expect(page.locator(".journey__found")).toHaveText("18 found");

		const reveal = page.getByRole("dialog", { name: /Twenty-five/ });

		await expect(reveal).toBeVisible();
		await expect(reveal).toContainText(
			"I was born on a 25th, so 25 became my name: twenty-five, spelled the way it sounds in Spanish."
		);
		await expect(reveal).toContainText("You found every star.");
		await reveal.getByRole("button", { name: "Close" }).click();
		await expect(reveal).toBeHidden();

		await page.reload();
		await page.waitForLoadState("networkidle");
		await expect(page.locator(".journey__found")).toHaveText("18 found");
		// The keepsake can be opened again later; Escape closes it like the button.
		await page.getByRole("button", { name: "See it again" }).click();
		await expect(reveal).toBeVisible();
		await expect(reveal.locator(".emblem__name")).toHaveText("tuentyfaiv");
		await page.keyboard.press("Escape");
		await expect(reveal).toBeHidden();
	});

	const seventeen = (page: Page) =>
		page.addInitScript(() =>
			localStorage.setItem(
				"tuentyfaiv:strays",
				JSON.stringify(Array.from({ length: 17 }, (_, index) => index))
			)
		);

	test("the found stars are born as the name, on the live nebula", async ({ page }) => {
		// Seventeen found already: the eighteenth opens it.
		await seventeen(page);
		await open(page);
		await expect(page.getByRole("button", { name: "See it again" })).toHaveCount(0);
		await expect(track(page).locator(".track__count")).toHaveText("17");
		await goTo(page, 7);
		await page.locator(".stop[data-index='7'] .strays__hit[data-stray='17']").click();

		const reveal = page.getByRole("dialog", { name: /Twenty-five/ });
		const emblem = reveal.locator(".emblem");

		await expect(reveal).toBeVisible();
		await expect(emblem.locator(".emblem__name")).toHaveText("tuentyfaiv");
		await expect(emblem.locator(".emblem__letter[data-heard]")).toHaveText(["u", "a", "i"]);
		await expect(emblem).toContainText("twenty-five, said out loud");
		// One star for each constellation and each stray: they become the name.
		await expect(reveal.locator(".birth__star[data-kind='constellation']")).toHaveCount(7);
		await expect(reveal.locator(".birth__star[data-kind='stray']")).toHaveCount(STRAYS);
		// A drawing beside the words: hidden from assistive tech.
		await expect(emblem).toHaveAttribute("aria-hidden", "true");
		// Only the words and the art: no badge, no other button than closing it.
		await expect(reveal.getByRole("button")).toHaveText(["Close"]);
		// Nothing ties the stars to the name's origin: the name comes from a birthday.
		expect(await reveal.textContent()).not.toMatch(/constellation|stray/i);
		// The page steps aside so the live nebula is the background.
		await expect(page.locator(".header")).toHaveCSS("opacity", "0");
		await expect(page.locator(".journey__track")).toHaveCSS("opacity", "0");
		await expect(page.locator("#projects canvas.nebula--slide")).toBeVisible();
		// Once born, the stars are gone into the letters.
		await expect
			.poll(() =>
				reveal
					.locator(".birth__star")
					.evaluateAll(
						(stars) => stars.filter((star) => getComputedStyle(star).opacity !== "0").length
					)
			)
			.toBe(0);

		// A click around the art closes it: first the stars go home while the page comes back,
		// then the reveal is gone.
		await page.mouse.click(40, 860);
		await expect(reveal).toHaveAttribute("data-leaving", "");
		await expect(page.locator(".header")).not.toHaveCSS("opacity", "0");
		await expect(reveal).toBeHidden();
		await expect(page.locator(".header")).toHaveCSS("opacity", "1");
		await expect(page.locator(".journey__track")).toHaveCSS("opacity", "1");
		// Closed where it was opened: the last constellation.
		expect(await stopInView(page)).toBe(7);
	});

	test("the stars fly home after Escape too, and the reveal opens again", async ({ page }) => {
		await seventeen(page);
		await open(page);
		await goTo(page, 7);
		await page.locator(".stop[data-index='7'] .strays__hit[data-stray='17']").click();

		const reveal = page.getByRole("dialog", { name: /Twenty-five/ });

		await expect(reveal).toBeVisible();
		// Escape no longer closes at once: it sends the stars home first.
		await page.keyboard.press("Escape");
		await expect(reveal).toHaveAttribute("data-leaving", "");
		await expect(reveal).toBeHidden();
		const replay = track(page).getByRole("button", { name: "See it again" });

		await expect(replay).toHaveText(/18/);
		await replay.click();
		await expect(reveal).toBeVisible();
		await expect(reveal).not.toHaveAttribute("data-leaving", "");
	});

	test("the same stray twice counts once", async ({ page }) => {
		await open(page);

		const hit = page.locator(".stop[data-index='0'] .strays__hit").first();

		await hit.click();
		await expect(page.locator(".journey__found")).toHaveText("01 found");
		await hit.click();
		await expect(page.locator(".journey__found")).toHaveText("01 found");
	});

	test("the count closes the bar, and once complete its star replays the reveal", async ({
		page,
	}) => {
		await open(page);

		const count = track(page).locator(".track__count");

		// Nothing to see until the first find; no pills anywhere.
		await expect(count).toHaveCount(0);
		await page.locator(".stop[data-index='0'] .strays__hit").first().click();
		await expect(count).toHaveText("01");
		await expect(count).toHaveAttribute("aria-hidden", "true");
		await expect(page.locator(".journey__chart")).toHaveCount(0);
		await expect(track(page).getByRole("button", { name: "See it again" })).toHaveCount(0);
	});

	test("never names a company, a client, private work or unfinished projects", async ({ page }) => {
		await open(page);

		const text = await page.locator("#projects").evaluate((element) => element.textContent ?? "");

		expect(text).not.toMatch(/axial|nopal|consultant/i);
		expect(text).not.toMatch(/svelte-form|sveaming|tfverse|galleryreact|starter kits/i);
	});

	test("the nebula travels with the camera, and stops when the slide leaves", async ({ page }) => {
		await open(page);

		const canvas = page.locator("#projects canvas.nebula--slide");

		await expect(canvas).toHaveAttribute("data-ready", "");

		const stats = async () => {
			await canvas.dispatchEvent("nebula:stats");
			await page.waitForTimeout(100);

			return JSON.parse((await canvas.getAttribute("data-stats")) ?? "{}") as {
				draws: number;
				pan: number;
				rise: number;
			};
		};
		// Half a screen height of sky per map unit (a constellation's width) travelled.
		const unit = await page
			.locator(".stop[data-index='1'] .project__focus")
			.evaluate((element) => element.getBoundingClientRect().width / window.innerHeight / 2);

		await goTo(page, 1);
		await expect.poll(async () => (await stats()).pan, { timeout: 5000 }).toBeCloseTo(0, 2);
		// 02 sits a unit higher on the chart: the sky follows the camera up.
		await goTo(page, 2);
		await expect.poll(async () => (await stats()).rise, { timeout: 5000 }).toBeCloseTo(1 * unit, 2);
		await goTo(page, 3);
		await expect
			.poll(async () => (await stats()).pan, { timeout: 5000 })
			.toBeCloseTo(2.24 * unit, 2);

		await page.locator("#contact").scrollIntoViewIfNeeded();
		await page.waitForTimeout(400);

		const paused = (await stats()).draws;

		await page.waitForTimeout(600);
		expect((await stats()).draws).toBe(paused);
	});

	test("without a GPU, a plain CSS sky stands in", async ({ page }) => {
		await page.goto("/?nebula=none#projects");
		await page.waitForLoadState("networkidle");

		await expect(page.locator("#projects canvas")).toHaveAttribute("data-fallback", "disabled");
		expect(
			await page
				.locator(".journey__sky")
				.evaluate((element) => getComputedStyle(element).backgroundImage)
		).toContain("radial-gradient");
	});

	test("reads in Spanish", async ({ page }) => {
		await open(page);
		await page.locator(".header__actions .language").click();
		await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");

		await expect(page.locator(".journey__title")).toHaveText("Hacia la nebulosa.");
		await expect(page.getByRole("group", { name: "Constelaciones" })).toBeVisible();
		await goTo(page, 1);
		await expect(page.locator(".stop[data-index='1'] .project__crumbs")).toHaveText(
			"Proyectos / 01 de 07"
		);
		await expect(page.getByRole("link", { name: "Abrir proyecto" })).toBeVisible();
		await expect(page.locator(".stop[data-index='1'] .project__facts dd")).toHaveText([
			"Autor y mantenedor",
			"2023",
			"0.2.0 en npm",
		]);
	});
});

// Every stray can be clicked where it is: nothing on its stop covers it.
for (const [width, height] of [
	[1440, 900],
	[1280, 720],
] as const) {
	test(`every stray is clickable, ${width}×${height}`, async ({ page }) => {
		await page.setViewportSize({ width, height });
		await open(page);

		const covered: string[] = [];

		for (let stop = 0; stop < STOPS; stop++) {
			await goTo(page, stop);
			covered.push(
				...(await page.evaluate((index) => {
					const hits = document.querySelectorAll<SVGCircleElement>(
						`.stop[data-index='${index}'] .strays__hit`
					);

					return [...hits].flatMap((hit) => {
						const box = hit.getBoundingClientRect();
						const top = document.elementFromPoint(
							box.left + box.width / 2,
							box.top + box.height / 2
						);

						return top === hit ? [] : [`stray ${hit.dataset.stray} under ${top?.className}`];
					});
				}, stop))
			);
		}

		expect(covered).toEqual([]);
	});
}

// fetchzen's stars are placed by CSS and its lines by the SVG: they must meet.
for (const [width, height] of [
	[1440, 900],
	[390, 844],
] as const) {
	test(`every fetchzen star sits on the end of its lines, ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height });
		await open(page);
		await goTo(page, 1);

		const misses = await page.evaluate(() => {
			const figure = document.querySelector(
				".chart__place[data-place='0'] .constellation"
			) as HTMLElement;
			const box = figure.getBoundingClientRect();
			const ends = [...figure.querySelectorAll(".constellation__links > line")].flatMap((line) => [
				[Number(line.getAttribute("x1")), Number(line.getAttribute("y1"))],
				[Number(line.getAttribute("x2")), Number(line.getAttribute("y2"))],
			]);

			return [...figure.querySelectorAll<HTMLElement>(".constellation__feature")].flatMap(
				(star) => {
					const style = getComputedStyle(star);
					const x = (Number.parseFloat(style.left) / box.width) * 100;
					const y = (Number.parseFloat(style.top) / box.height) * 100;
					const hit = ends.some(([ex = 0, ey = 0]) => Math.hypot(ex - x, ey - y) < 0.2);

					return hit ? [] : [`${star.dataset.feature} at ${x.toFixed(1)}, ${y.toFixed(1)}`];
				}
			);
		});

		expect(misses).toEqual([]);
	});
}

test.describe("into the nebula, phone", () => {
	test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

	test("a sideways swipe travels; the dots follow", async ({ page }) => {
		await open(page);

		await page.locator(".journey__track").evaluate((element) => element.scrollBy({ left: 390 }));
		await expect.poll(() => stopInView(page)).toBe(1);
		await expect(stopButtons(page).nth(1)).toHaveAttribute("aria-current", "step");
		await expect(page.locator(".track__swipe")).toBeVisible();
		await expect(page.locator(".deck__count")).toContainText("02 / 06");
	});

	// Phones have no room for the stray game, as in the design.
	test("hides the strays and their counter", async ({ page }) => {
		await page.addInitScript(() => localStorage.setItem("tuentyfaiv:strays", "[0, 1]"));
		await open(page);
		await goTo(page, 1);

		await expect(page.locator(".stop[data-index='1'] .strays")).toBeHidden();
		await expect(page.locator(".track__stars")).toBeHidden();
	});
});

// Every stop fits the screen: nothing spills sideways, and nothing reaches the controls.
for (const [width, height] of [
	[1440, 900],
	[1280, 720],
	[834, 1112],
	[390, 844],
	[375, 667],
] as const) {
	test(`every stop fits, ${width}×${height}`, async ({ page }) => {
		await page.setViewportSize({ width, height });
		await open(page);

		for (let stop = 0; stop < STOPS; stop++) {
			await goTo(page, stop);

			const fit = await page.evaluate((index) => {
				const controls = (document.querySelector(".track") as HTMLElement).getBoundingClientRect();
				const parts = document.querySelectorAll<HTMLElement>(
					`.stop[data-index='${index}'] :is(.journey__intro, .project__text, .constellation)`
				);
				const bottom = Math.max(...[...parts].map((part) => part.getBoundingClientRect().bottom));
				const top = Math.min(...[...parts].map((part) => part.getBoundingClientRect().top));

				return {
					scrollWidth: document.documentElement.scrollWidth,
					slide: (document.getElementById("projects") as HTMLElement).offsetHeight,
					room: Math.round(controls.top - bottom),
					top: Math.round(top),
				};
			}, stop);

			expect(fit.scrollWidth, `stop ${stop}`).toBe(width);
			expect(fit.slide, `stop ${stop}`).toBe(height);
			expect(fit.room, `stop ${stop}`).toBeGreaterThanOrEqual(0);
			expect(fit.top, `stop ${stop}`).toBeGreaterThanOrEqual(56);
		}
	});
}

// The star chart: one map behind the track, and a camera that glides along its route.
const boxes = (page: Page, stop: number) =>
	page.evaluate((index) => {
		const rect = (selector: string) => {
			const box = (document.querySelector(selector) as Element).getBoundingClientRect();

			return { x: box.x, y: box.y, w: box.width, h: box.height };
		};
		const places = [...document.querySelectorAll(".chart__place")].map((_, slot) =>
			rect(`.chart__place[data-place='${slot}']`)
		);

		return {
			places,
			focus: index > 0 ? rect(`.stop[data-index='${index}'] .project__focus`) : undefined,
			area: rect(".journey__area"),
		};
	}, stop);

/** Puts the track at any point, even between two stops, as a half swipe would. */
async function travelTo(page: Page, progress: number) {
	await page.locator(".journey__track").evaluate((element, at) => {
		element.style.scrollSnapType = "none";
		element.scrollTo({ left: at * element.clientWidth, behavior: "instant" });
	}, progress);
	await expect.poll(() => stopInView(page)).toBeCloseTo(progress, 3);
}

for (const [width, height] of [
	[1440, 900],
	[390, 844],
] as const) {
	test.describe(`the star chart, ${width}px`, () => {
		test.use({ viewport: { width, height } });

		test("the camera lands each constellation exactly on its stop", async ({ page }) => {
			await open(page);
			await expect(page.locator(".chart")).toHaveAttribute("data-ready", "");

			for (let stop = 1; stop < STOPS; stop++) {
				await goTo(page, stop);
				// The chart drifts a little with the pointer: back to the middle, where it rests.
				await page.mouse.move(width / 2, height / 2);
				await expect
					.poll(
						async () => {
							const { places, focus } = await boxes(page, stop);
							const place = places[stop - 1];

							return Math.max(
								...(["x", "y", "w", "h"] as const).map((key) =>
									Math.abs((place?.[key] ?? 0) - (focus?.[key] ?? 1e6))
								)
							);
						},
						{ message: `stop ${stop}` }
					)
					.toBeLessThan(1);
			}
		});

		test("the intro shows the whole chart inside its area", async ({ page }) => {
			await open(page);
			await expect(page.locator(".chart")).toHaveAttribute("data-ready", "");

			const { places, area } = await boxes(page, 0);

			for (const [slot, place] of places.entries()) {
				expect(place.x, `place ${slot}`).toBeGreaterThanOrEqual(area.x - 1);
				expect(place.y, `place ${slot}`).toBeGreaterThanOrEqual(area.y - 1);
				expect(place.x + place.w, `place ${slot}`).toBeLessThanOrEqual(area.x + area.w + 1);
				expect(place.y + place.h, `place ${slot}`).toBeLessThanOrEqual(area.y + area.h + 1);
			}
		});
	});
}

test.describe("the star chart on the way", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test("halfway between stops the camera pulls back and the words make way", async ({ page }) => {
		await open(page);
		await goTo(page, 1);

		await page.mouse.move(720, 450);
		await expect
			.poll(async () => {
				const { places, focus } = await boxes(page, 1);

				return Math.abs((places[0]?.w ?? 0) - (focus?.w ?? 1e6));
			})
			.toBeLessThan(1);

		const atStop = await boxes(page, 1);
		const words = (index: number) =>
			page
				.locator(`.stop[data-index='${index}'] .project`)
				.evaluate((element) => Number(getComputedStyle(element).opacity));

		await travelTo(page, 1.5);

		// Smaller than on a stop: the camera has pulled back to show the way.
		await expect
			.poll(async () => (await boxes(page, 1)).places[0]?.w ?? 0)
			.toBeLessThan((atStop.places[0]?.w ?? 0) * 0.85);
		for (const index of [1, 2])
			await expect.poll(() => words(index), { message: `stop ${index}` }).toBeLessThan(0.2);
	});

	test("the route lights up as far as you have travelled", async ({ page }) => {
		await open(page);

		// 1 is a leg still dark, 0 a leg fully lit.
		const lit = () =>
			page
				.locator("[data-trail]")
				.evaluateAll((paths) =>
					paths.map((path) =>
						Number.parseFloat(getComputedStyle(path).getPropertyValue("stroke-dashoffset"))
					)
				);

		await goTo(page, 1);
		await expect.poll(lit).toEqual([1, 1, 1, 1, 1, 1]);
		await goTo(page, 3);
		await expect.poll(lit).toEqual([0, 0, 1, 1, 1, 1]);
		// Going back keeps the way you came lit.
		await goTo(page, 1);
		await expect.poll(lit).toEqual([0, 0, 1, 1, 1, 1]);
	});

	// Regression: Gecko dropped a stroke width computed in CSS, and the route turned into a
	// band a whole constellation wide. The widths are attributes now, in map units.
	test("the route stays a thin line on screen at any zoom", async ({ page }) => {
		await open(page);

		const widths = () =>
			page.evaluate(() => {
				const svg = document.querySelector(".chart__route") as SVGSVGElement;
				const pixelsPerUnit = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;

				return [...svg.querySelectorAll("path")].map(
					(path) => Number(path.getAttribute("stroke-width")) * pixelsPerUnit
				);
			});

		for (const stop of [0, 1, 4]) {
			await goTo(page, stop);
			await expect
				.poll(async () => Math.max(...(await widths())), { message: `stop ${stop}` })
				.toBeLessThan(2.5);
			expect(Math.min(...(await widths())), `stop ${stop}`).toBeGreaterThan(1);
		}
	});

	test("fetchzen's words show only on its own stop", async ({ page }) => {
		await open(page);

		const hub = page.locator(".chart__place[data-place='0'] .constellation__core");

		await goTo(page, 1);
		await expect(hub).toHaveCSS("opacity", "1");
		await goTo(page, 2);
		await expect(hub).toHaveCSS("opacity", "0");
		await goTo(page, 0);
		await expect(hub).toHaveCSS("opacity", "0");
	});

	test("the chart is a drawing: hidden from assistive tech, words live in the stops", async ({
		page,
	}) => {
		await open(page);

		await expect(page.locator(".chart")).toHaveAttribute("aria-hidden", "true");
		await expect(page.locator(".chart")).toHaveCSS("pointer-events", "none");
	});
});

test.describe("the star chart, reduced motion", () => {
	test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

	test("the reveal is simply there, with nothing flying in", async ({ page }) => {
		await page.addInitScript(() =>
			localStorage.setItem(
				"tuentyfaiv:strays",
				JSON.stringify(Array.from({ length: 17 }, (_, index) => index))
			)
		);
		await open(page);
		await goTo(page, 7);
		await page.locator(".stop[data-index='7'] .strays__hit[data-stray='17']").click();
		const reveal = page.getByRole("dialog", { name: /Twenty-five/ });

		await expect(reveal).toBeVisible();
		expect(
			await page.evaluate(
				() => document.querySelector(".reveal")?.getAnimations({ subtree: true }).length
			)
		).toBe(0);
		// And it closes at once: no stars flying home.
		await reveal.getByRole("button", { name: "Close" }).click();
		await expect(reveal).toBeHidden();
	});

	test("holds still: no sparks, no twinkle, no drift with the pointer", async ({ page }) => {
		await open(page);
		await goTo(page, 2);

		await expect(page.locator(".chart .constellation-shape__spark").first()).toBeHidden();
		await expect(page.locator(".chart .constellation-shape__star").first()).toHaveCSS(
			"animation-name",
			"none"
		);

		await expect
			.poll(async () => {
				const { places, focus } = await boxes(page, 2);

				return Math.abs((places[1]?.w ?? 0) - (focus?.w ?? 1e6));
			})
			.toBeLessThan(1);

		const before = await boxes(page, 2);

		await page.mouse.move(100, 100);
		await page.mouse.move(1300, 800);
		await page.waitForTimeout(400);
		expect((await boxes(page, 2)).places).toEqual(before.places);
	});
});

// The project in view is kept: in the tab (a reload comes back to it) and in the address.
test.describe("remembering the project", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	const address = (page: Page) =>
		page.evaluate(() => window.location.search + window.location.hash);

	test("the address names the project in view, and a reload comes back to it", async ({ page }) => {
		await open(page);
		await goTo(page, 3);
		await expect.poll(() => address(page)).toBe("?project=undiscovered-3#projects");

		await page.reload();
		await page.waitForLoadState("networkidle");
		await expect.poll(() => stopInView(page)).toBe(3);
		await expect(page.locator(".deck__count")).toContainText("02 / 06");

		// Back on the intro, the address no longer names a project.
		await goTo(page, 0);
		await expect.poll(() => address(page)).toBe("#projects");
	});

	test("a link to a project opens it", async ({ page }) => {
		await page.goto("/?project=fetchzen#projects");
		await page.waitForLoadState("networkidle");
		await expect.poll(() => stopInView(page)).toBe(1);
		await expect(page.locator(".stop[data-index='1'] .project__name")).toBeInViewport();
		await expect(page.locator(".deck__count")).toContainText("02 / 06");
	});

	test("changing project never adds a history entry", async ({ page }) => {
		await open(page);

		const before = await page.evaluate(() => history.length);

		for (const stop of [1, 2, 3]) await goTo(page, stop);
		await expect.poll(() => address(page)).toContain("project=undiscovered-3");
		expect(await page.evaluate(() => history.length)).toBe(before);
	});

	test("a link to a project that does not exist starts at the intro", async ({ page }) => {
		await page.goto("/?project=nope#projects");
		await page.waitForLoadState("networkidle");
		await page.waitForTimeout(300);
		expect(await stopInView(page)).toBe(0);
	});
});

// The bar along the bottom: a little copy of the route, and nothing in it moves.
test.describe("the little route", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	const dots = (page: Page) =>
		page
			.locator(".track__stop")
			.evaluateAll((stops) => stops.map((stop) => Math.round(stop.getBoundingClientRect().x)));

	test("names the stop you are on and lights the way up to it", async ({ page }) => {
		await open(page);

		const plate = page.locator(".track__plate");

		await expect(plate).toHaveText("00 Into the nebula");
		await expect(plate).toHaveAttribute("aria-hidden", "true");
		await expect(page.locator(".track__keys")).toHaveCount(0);
		await expect(page.locator(".track__leg[data-passed]")).toHaveCount(1);

		await goTo(page, 3);
		await expect(plate).toHaveText("03 Undiscovered");
		await expect(page.locator(".track__leg[data-passed]")).toHaveCount(4);
		await expect(track(page).getByRole("button", { name: "Next" })).toHaveAttribute(
			"aria-keyshortcuts",
			"ArrowRight"
		);
	});

	test("never shifts: the bar and every dot stay where they are", async ({ page }) => {
		await open(page);

		const bar = async () => {
			const box = await track(page).boundingBox();

			return [Math.round(box?.x ?? 0), Math.round(box?.width ?? 0)];
		};
		const at = { bar: await bar(), dots: await dots(page) };

		for (const stop of [1, 4, 7]) {
			await goTo(page, stop);
			expect(await bar(), `stop ${stop}`).toEqual(at.bar);
			expect(await dots(page), `stop ${stop}`).toEqual(at.dots);
		}
	});
});

// The route runs through a star of every constellation, and home again from the last one.
test.describe("the way home", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	/** How far the end of leg `leg` is from constellation `place`'s landing star, on screen. */
	const miss = (page: Page, leg: number, place: number) =>
		page.evaluate(
			([index, slot]) => {
				const path = document.querySelector(`[data-trail='${index}']`) as SVGPathElement;
				const end = path.getPointAtLength(path.getTotalLength());
				const matrix = path.getScreenCTM() as DOMMatrix;
				const x = matrix.a * end.x + matrix.c * end.y + matrix.e;
				const y = matrix.b * end.x + matrix.d * end.y + matrix.f;
				const star = (
					document.querySelector(`.chart__place[data-place='${slot}'] [data-land]`) as Element
				).getBoundingClientRect();

				return Math.hypot(x - (star.x + star.width / 2), y - (star.y + star.height / 2));
			},
			[leg, place]
		);

	test("the route lands on a star, even on the stop where it has grown", async ({ page }) => {
		await open(page);
		await page.mouse.move(720, 450);

		// On the intro (the whole map), and on 03 and 07 (grown through the lens).
		await expect.poll(() => miss(page, 1, 2)).toBeLessThan(1.5);
		for (const stop of [3, 7]) {
			await goTo(page, stop);
			await page.mouse.move(720, 450);
			await expect
				.poll(() => miss(page, stop - 2, stop - 1), { message: `stop ${stop}` })
				.toBeLessThan(1.5);
		}
	});

	test("a landing star lights up once you have been there", async ({ page }) => {
		await open(page);

		const core = (slot: number) =>
			page
				.locator(`.chart__place[data-place='${slot}'] .constellation-shape__core`)
				.evaluate((element) => Number(getComputedStyle(element).opacity));

		await goTo(page, 3);
		await expect.poll(() => core(2)).toBe(1);
		await expect.poll(() => core(5)).toBe(0);
	});

	test("from the last stop, forward flies home to fetchzen", async ({ page }) => {
		await open(page);
		await goTo(page, 7);

		const home = track(page).getByRole("button", { name: "Back to the start" });
		const way = page.locator("[data-home-trail]");
		const lit = () =>
			way.evaluate((path) =>
				Number.parseFloat(getComputedStyle(path).getPropertyValue("stroke-dashoffset"))
			);

		await expect(page.locator("[data-home-road]")).toHaveAttribute("stroke-dasharray", /\d/);
		expect(await lit()).toBe(1);

		await home.focus();
		await page.keyboard.press("Enter");
		await expect(page.locator(".journey")).toHaveAttribute("data-flying", "");
		await expect.poll(() => stopInView(page)).toBe(1);
		await expect(page.locator(".journey")).not.toHaveAttribute("data-flying", "");
		await expect(stopButtons(page).nth(1)).toHaveAttribute("aria-current", "step");
		await expect(page.getByRole("heading", { level: 3, name: "fetchzen" })).toBeVisible();
		await expect.poll(lit).toBe(0);
		await expect.poll(() => new URL(page.url()).searchParams.get("project")).toBe("fetchzen");
		// The focus stays on the same button, now forward again.
		await expect(track(page).getByRole("button", { name: "Next" })).toBeFocused();
	});

	test("the way home closes the loop on the whole map only, into fetchzen's Hooks star", async ({
		page,
	}) => {
		await open(page);
		await page.mouse.move(720, 450);

		const way = page.locator("[data-home-road]");
		const shown = () => way.evaluate((path) => Number(getComputedStyle(path).opacity));
		const miss = () =>
			page.evaluate(() => {
				const path = document.querySelector("[data-home-trail]") as SVGPathElement;
				const end = path.getPointAtLength(path.getTotalLength());
				const matrix = path.getScreenCTM() as DOMMatrix;
				const x = matrix.a * end.x + matrix.c * end.y + matrix.e;
				const y = matrix.b * end.x + matrix.d * end.y + matrix.f;
				const box = (
					document.querySelector(".chart__place[data-place='0']") as Element
				).getBoundingClientRect();

				return Math.hypot(x - (box.x + box.width * 0.094), y - (box.y + box.height * 0.5));
			});

		await expect.poll(shown).toBeGreaterThan(0.95);
		await expect.poll(miss).toBeLessThan(1.5);
		for (const stop of [1, 7]) {
			await goTo(page, stop);
			await expect.poll(shown, { message: `stop ${stop}` }).toBe(0);
		}
		// The route ends on the hook's last star, ringed.
		await expect(
			page.locator(".chart__place[data-place='6'] .constellation-shape__end")
		).toHaveCount(1);
		await expect(page.locator(".constellation-shape__end")).toHaveCount(1);
	});

	test("the right arrow key goes home from the last stop too", async ({ page }) => {
		await open(page);
		await goTo(page, 7);
		await page.keyboard.press("ArrowRight");
		await expect.poll(() => stopInView(page)).toBe(1);
	});

	test("the sparks leave no dots at the ends of the lines", async ({ page }) => {
		await open(page);
		expect(
			await page
				.locator(".constellation-shape__spark")
				.first()
				.evaluate((line) => getComputedStyle(line).strokeLinecap)
		).toBe("butt");
	});
});

test.describe("the way home, reduced motion", () => {
	test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

	test("lands on fetchzen at once, with no flight", async ({ page }) => {
		await open(page);
		await goTo(page, 7);
		await track(page).getByRole("button", { name: "Back to the start" }).click();
		expect(await page.locator(".journey").getAttribute("data-flying")).toBeNull();
		await expect.poll(() => stopInView(page)).toBe(1);
	});
});

// Who found every star: one random id per browser, sent once, read privately.
test.describe("counting the finders", () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	const seventeen = (page: Page) =>
		page.addInitScript(() =>
			localStorage.setItem(
				"tuentyfaiv:strays",
				JSON.stringify(Array.from({ length: 17 }, (_, index) => index))
			)
		);

	test("the last find sends this browser's id once; the replay sends nothing", async ({ page }) => {
		const sent: unknown[] = [];

		await page.route("**/api/stars", async (route) => {
			sent.push(route.request().postDataJSON());
			await route.fulfill({ status: 204 });
		});
		await seventeen(page);
		await open(page);
		await goTo(page, 7);

		const cookies = await page.context().cookies();

		await page.locator(".stop[data-index='7'] .strays__hit[data-stray='17']").click();

		await expect.poll(() => sent.length).toBe(1);

		const id = await page.evaluate(() => localStorage.getItem("tuentyfaiv:finder"));

		expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
		expect(sent[0]).toEqual({ id });
		// No cookie is set for it (the language cookie was there before).
		expect(await page.context().cookies()).toEqual(cookies);

		await page.keyboard.press("Escape");
		await expect(page.getByRole("dialog")).toBeHidden();
		await track(page).getByRole("button", { name: "See it again" }).click();
		await page.waitForTimeout(300);
		expect(sent).toHaveLength(1);
	});

	test("a failed count never gets in the way of the reveal", async ({ page }) => {
		await page.route("**/api/stars", (route) => route.abort());
		await seventeen(page);
		await open(page);
		await goTo(page, 7);
		await page.locator(".stop[data-index='7'] .strays__hit[data-stray='17']").click();
		await expect(page.getByRole("dialog", { name: /Twenty-five/ })).toBeVisible();
	});

	test("the endpoint takes a finder id from this site only, and nothing else", async ({
		page,
		baseURL,
	}) => {
		const post = (data: unknown, origin = baseURL ?? "") =>
			page.request.post("/api/stars", {
				data: data as Record<string, unknown>,
				headers: { origin },
			});
		const id = "6f9619ff-8b86-4011-b42d-00c04fc964ff";

		expect((await post({ id })).status()).toBe(204);
		// The same browser twice still counts once (the second is ignored, not refused).
		expect((await post({ id })).status()).toBe(204);
		expect((await post({ id: "not-an-id" })).status()).toBe(400);
		expect((await post({})).status()).toBe(400);
		expect((await post({ id }, "https://elsewhere.example")).status()).toBe(403);
		// JSON only, and small: a big body is refused before it is read.
		const plain = await page.request.post("/api/stars", {
			data: JSON.stringify({ id }),
			headers: { origin: baseURL ?? "", "content-type": "text/plain" },
		});

		expect(plain.status()).toBe(415);
		expect((await post({ id, padding: "x".repeat(400) })).status()).toBe(413);
		// The site's security headers come with it.
		expect((await post({ id })).headers()["x-content-type-options"]).toBe("nosniff");
		// Nothing reads the count back.
		expect((await page.request.get("/api/stars")).status()).toBe(405);
	});
});

// The violet words about the strays are small: they need 4.5:1 in both themes.
for (const colorScheme of ["dark", "light"] as const) {
	test.describe(`the stray words, ${colorScheme}`, () => {
		test.use({ colorScheme, viewport: { width: 1440, height: 900 } });

		test("the count and the toast's title reach 4.5:1 on the page", async ({ page }) => {
			await page.addInitScript(() => localStorage.setItem("tuentyfaiv:strays", "[0]"));
			await open(page);

			const ratios = await page.evaluate(() => {
				const parse = (color: string) => {
					const context = document.createElement("canvas").getContext("2d", {
						willReadFrequently: true,
					}) as CanvasRenderingContext2D;

					context.fillStyle = color;
					context.fillRect(0, 0, 1, 1);

					return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
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
				const page = parse(getComputedStyle(document.body).backgroundColor);

				return [".track__count", ".journey__toast-title"].map((selector) =>
					contrast(parse(getComputedStyle(document.querySelector(selector) as Element).color), page)
				);
			});

			for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
		});
	});
}
