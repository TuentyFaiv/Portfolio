import { describe, expect, it } from "vitest";

import { quietly } from "./quietly.ts";

describe("quietly", () => {
	it("returns what the function returns", () => {
		expect(quietly(() => 42)).toBe(42);
	});

	it("returns undefined instead of throwing", () => {
		expect(
			quietly(() => {
				throw new Error("storage blocked");
			})
		).toBeUndefined();
	});
});
