import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
	CMS_URL: {
		description: "Where the Payload CMS lives. Without it, /blog answers 503 (see cms/README.md).",
		schema: (value) => value || undefined,
	},
});
