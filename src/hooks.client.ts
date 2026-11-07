import type { ClientInit } from "@sveltejs/kit/hooks";

import { reactiveLocale } from "#lib/text/locale.svelte.ts";

export const init: ClientInit = () => {
	reactiveLocale();
};
