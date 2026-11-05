import type { ClientInit } from "@sveltejs/kit/hooks";

import { reactiveLocale } from "#utils/locale.svelte.ts";

export const init: ClientInit = () => {
	reactiveLocale();
};
