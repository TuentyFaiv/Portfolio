import { describe, expect, it } from "vitest";

import { readUpTo } from "./body.server.ts";

const streamed = (...parts: string[]) =>
	new Request("https://tuentyfaiv.com/api", {
		method: "POST",
		body: new ReadableStream({
			start(controller) {
				for (const part of parts) controller.enqueue(new TextEncoder().encode(part));
				controller.close();
			},
		}),
		duplex: "half",
	} as RequestInit);

describe("reading a request body up to a limit", () => {
	it("returns the body when it fits", async () => {
		expect(await readUpTo(streamed('{"id":', '"a"}'), 64)).toBe('{"id":"a"}');
	});

	it("refuses a streamed body past the limit, with no content-length to trust", async () => {
		expect(await readUpTo(streamed("x".repeat(40), "x".repeat(40)), 64)).toBeNull();
	});

	it("reads an empty request as empty", async () => {
		expect(await readUpTo(new Request("https://tuentyfaiv.com/api", { method: "POST" }), 64)).toBe(
			""
		);
	});
});
