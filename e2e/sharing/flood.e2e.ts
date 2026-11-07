import { expect, test } from "@playwright/test";

test("the csp report endpoint answers 429 to a flood", async ({ request }) => {
	const statuses = await Promise.all(
		Array.from({ length: 90 }, () =>
			request.post("/api/csp-report", {
				data: JSON.stringify({ "csp-report": { "blocked-uri": "https://example.com" } }),
				headers: { "content-type": "application/csp-report", origin: "http://localhost:4173" },
			})
		)
	);

	expect(statuses.map((response) => response.status())).toContain(429);
});
