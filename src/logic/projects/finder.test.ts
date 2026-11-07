import { describe, expect, it } from "vitest";

import { isFinderId } from "./finder.ts";

describe("finder ids", () => {
	it("takes what crypto.randomUUID() makes", () => {
		for (let i = 0; i < 20; i++) expect(isFinderId(crypto.randomUUID())).toBe(true);
	});

	it("refuses anything else", () => {
		for (const value of [
			undefined,
			null,
			42,
			"",
			"not-an-id",
			"00000000-0000-1000-8000-000000000000",
			"6F9619FF-8B86-4011-B42D-00C04FC964FF",
			`${crypto.randomUUID()} `,
			`${crypto.randomUUID()}'; drop table finders; --`,
		])
			expect(isFinderId(value), String(value)).toBe(false);
	});
});
