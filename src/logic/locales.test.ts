import { describe, expect, it } from "vitest";

import en from "../../locales/en/translation.json";
import es from "../../locales/es/translation.json";

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function keys(messages: object, prefix = ""): string[] {
	return Object.entries(messages)
		.filter(([key]) => key !== "$schema")
		.flatMap(([key, value]) =>
			typeof value === "object" ? keys(value, `${prefix}${key}.`) : `${prefix}${key}`
		);
}

describe("locale keys", () => {
	it.each(Object.entries({ en, es }))("%s uses kebab case only", (_, messages) => {
		const invalid = keys(messages).filter(
			(key) => !key.split(".").every((part) => KEBAB_CASE.test(part))
		);

		expect(invalid).toEqual([]);
	});

	it("has the same keys in every language", () => {
		expect(keys(es)).toEqual(keys(en));
	});
});
