import { flushSync } from "svelte";

import type { Locale } from "#lib/paraglide/runtime.js";

import {
	baseLocale,
	getLocale,
	getTextDirection,
	overwriteGetLocale,
	setLocale,
} from "#lib/paraglide/runtime.js";
import { languages } from "#utils/languages.ts";
import { play, settle, snapshot } from "#utils/retext.ts";

/*
 * Switching language without reloading the page. Paraglide reloads by default, which
 * paints the page from the top before the browser scrolls back to the slide you were on.
 * Here every message reads the locale from Svelte state instead, so changing it rewrites
 * the text where it stands: same scroll, same focus, the nebula keeps drawing.
 *
 * Browser only. On the server each request has its own locale, so it is never overridden.
 */
const locale = $state<{ current: Locale }>({ current: baseLocale });

/** Called once, before the app hydrates (see hooks.client.ts). */
export function reactiveLocale() {
	locale.current = getLocale();
	overwriteGetLocale(() => locale.current);
}

export function switchLocale(next: Locale) {
	if (next === locale.current) return;

	// A scramble still running would be recorded mid-noise, then finish on the old words.
	settle();
	const before = snapshot();

	// Writes the cookie, so the next visit and the server agree.
	setLocale(next, { reload: false });
	locale.current = next;
	document.documentElement.lang = languages[next].tag;
	document.documentElement.dir = getTextDirection(next);
	flushSync();

	play(before);
}
