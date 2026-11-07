import { expect, test } from "@playwright/test";

import type { APIRequestContext, Page } from "@playwright/test";

const meta = (page: Page, key: string) =>
	page.locator(`meta[property="${key}"], meta[name="${key}"]`).first().getAttribute("content");

const structured = async (page: Page) =>
	(await page.locator('script[type="application/ld+json"]').allTextContents()).map(
		(text) => JSON.parse(text) as Record<string, unknown>
	);

async function jpegSize(request: APIRequestContext, path: string) {
	const response = await request.get(path);
	const bytes = await response.body();

	expect(response.status(), path).toBe(200);
	expect(response.headers()["content-type"], path).toContain("image/jpeg");
	for (let at = 2; at < bytes.length; ) {
		const marker = bytes[at + 1] ?? 0;

		if (marker === 0xc0 || marker === 0xc2)
			return {
				bytes: bytes.length,
				height: bytes.readUInt16BE(at + 5),
				width: bytes.readUInt16BE(at + 7),
			};
		at += 2 + bytes.readUInt16BE(at + 2);
	}

	throw new Error(`${path} has no frame header`);
}

test.describe("search and link previews", () => {
	test.use({ locale: "en-US" });

	test("the home page names you, says what you do plainly, and has a large card", async ({
		page,
	}) => {
		await page.goto("/");

		await expect(page).toHaveTitle("Tonalli López (tuentyfaiv) · Frontend Lead");
		expect(await meta(page, "description")).toBe(
			"I'm Tonalli, a frontend engineer in Mexico City. I build web interfaces with Svelte, TypeScript and some Rust."
		);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			"https://tuentyfaiv.com/"
		);
		expect(await meta(page, "twitter:card")).toBe("summary_large_image");
		expect(await meta(page, "og:image")).toBe("https://tuentyfaiv.com/og/home.jpg");
		expect(await meta(page, "og:image:width")).toBe("1200");
		expect(await meta(page, "og:image:height")).toBe("630");
		expect(await meta(page, "og:image:alt")).toContain("Tonalli López");
		expect(await meta(page, "og:locale")).toBe("en_US");
		expect(await meta(page, "og:locale:alternate")).toBe("es_MX");
	});

	test("a link to fetchzen previews fetchzen, while search keeps one home page", async ({
		page,
	}) => {
		await page.goto("/?project=fetchzen");

		expect(await meta(page, "og:title")).toBe("fetchzen · TypeScript HTTP client | tuentyfaiv");
		expect(await meta(page, "og:description")).toContain("TypeScript-first HTTP client");
		expect(await meta(page, "og:image")).toBe("https://tuentyfaiv.com/og/fetchzen.jpg");
		expect(await meta(page, "og:url")).toBe("https://tuentyfaiv.com/?project=fetchzen");
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			"https://tuentyfaiv.com/"
		);
	});

	test("an undiscovered or unknown project link previews the home page", async ({ page }) => {
		for (const id of ["undiscovered-3", "nope", "<script>"]) {
			await page.goto(`/?project=${encodeURIComponent(id)}`);
			expect(await meta(page, "og:image"), id).toBe("https://tuentyfaiv.com/og/home.jpg");
			expect(await meta(page, "og:url"), id).toBe("https://tuentyfaiv.com/");
		}
	});

	test("Story and Blog have cards of their own", async ({ page }) => {
		for (const [path, card] of [
			["/story", "story"],
			["/blog", "blog"],
		] as const) {
			await page.goto(path);
			expect(await meta(page, "og:image"), path).toBe(`https://tuentyfaiv.com/og/${card}.jpg`);
			expect(await meta(page, "og:image:alt"), path).toBeTruthy();
		}
	});

	test("every card is a 1200×630 JPEG, small enough for any platform", async ({ request }) => {
		for (const card of ["home", "fetchzen", "story", "blog"]) {
			const { bytes, height, width } = await jpegSize(request, `/og/${card}.jpg`);

			expect({ card, height, width }).toEqual({ card, height: 630, width: 1200 });
			expect(bytes, card).toBeLessThan(300_000);
		}
	});

	test("structured data: you, the site, and fetchzen by you", async ({ page }) => {
		await page.goto("/");

		const blocks = await structured(page);
		const graph = blocks.flatMap((block) =>
			Array.isArray(block["@graph"]) ? (block["@graph"] as Record<string, unknown>[]) : [block]
		);
		const person = graph.find((node) => node["@type"] === "Person");
		const site = graph.find((node) => node["@type"] === "WebSite");
		const code = graph.find((node) => node["@type"] === "SoftwareSourceCode");

		expect(person?.["@id"]).toBe("https://tuentyfaiv.com/#person");
		expect(site?.inLanguage).toEqual(["en-US", "es-MX"]);
		expect(code?.name).toBe("fetchzen");
		expect(code?.codeRepository).toBe("https://github.com/TuentyFaiv/http");
		expect(code?.author).toEqual({ "@id": "https://tuentyfaiv.com/#person" });
	});
});

test.describe("one address, two languages", () => {
	test("each response says its language and that it varies by it", async ({ request }) => {
		const english = await request.get("/", { headers: { "accept-language": "en-US" } });
		const spanish = await request.get("/", { headers: { "accept-language": "es-MX,es;q=0.9" } });

		expect(english.headers()["content-language"]).toBe("en-US");
		expect(spanish.headers()["content-language"]).toBe("es-MX");
		for (const response of [english, spanish]) {
			expect(response.headers().vary).toMatch(/Accept-Language/i);
			expect(response.headers().vary).toMatch(/Cookie/i);
		}
		expect(await spanish.text()).toContain(
			"Soy Tonalli, ingeniero frontend en la Ciudad de México."
		);
	});

	test("fetchzen's structured description follows the page's language", async ({ request }) => {
		const spanish = await (
			await request.get("/", { headers: { "accept-language": "es-MX" } })
		).text();

		expect(spanish).toContain('"description":"Un cliente HTTP hecho para TypeScript');
	});

	test("the language cookie wins over the browser's setting", async ({ request }) => {
		const response = await request.get("/", {
			headers: { "accept-language": "en-US", cookie: "PARAGLIDE_LOCALE=es" },
		});

		expect(response.headers()["content-language"]).toBe("es-MX");
	});
});
