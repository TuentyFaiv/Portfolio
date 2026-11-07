import { afterEach, describe, expect, it, vi } from "vitest";

import { logServerError } from "./errors.ts";

type Failure = Parameters<typeof logServerError>[0];

const event = {
	request: new Request("https://tuentyfaiv.com/blog?secret=1", {
		headers: { cookie: "session=private" },
	}),
	route: { id: "/blog" },
	url: new URL("https://tuentyfaiv.com/blog?secret=1"),
};

const failure = (input: object) => ({ event, ...input }) as unknown as Failure;

describe("logServerError", () => {
	const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

	afterEach(() => log.mockClear());

	it("logs crashes with their cause", () => {
		logServerError(failure({ kind: "unknown", error: new TypeError("boom") }));

		expect(log.mock.calls[0]?.[0]).toMatchObject({
			kind: "unknown",
			status: 500,
			method: "GET",
			route: "/blog",
			path: "/blog",
			error: { name: "TypeError", message: "boom" },
		});
	});

	it("survives values that are not errors", () => {
		logServerError(failure({ kind: "unknown", error: "boom" }));

		expect(log.mock.calls[0]?.[0]).toMatchObject({ error: { message: "boom" } });
	});

	it("logs a 503 thrown on purpose", () => {
		const error = { status: 503, message: "The blog is unavailable right now" };

		logServerError(failure({ kind: "app", error }));

		expect(log.mock.calls[0]?.[0]).toMatchObject({
			kind: "app",
			status: 503,
			error: { message: error.message },
		});
	});

	it("ignores normal 4xx traffic", () => {
		logServerError(failure({ kind: "framework", error: { status: 404 } }));
		logServerError(failure({ kind: "app", error: { status: 404, message: "Nope" } }));

		expect(log).not.toHaveBeenCalled();
	});

	it("never logs query strings or cookies", () => {
		logServerError(failure({ kind: "unknown", error: new Error("boom") }));

		const logged = JSON.stringify(log.mock.calls[0]?.[0]);

		expect(logged).not.toContain("secret");
		expect(logged).not.toContain("private");
	});
});
