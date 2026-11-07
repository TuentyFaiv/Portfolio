import { flushSync } from "svelte";

import type { Locale } from "#lib/paraglide/runtime.js";

import {
	baseLocale,
	getLocale,
	getTextDirection,
	overwriteGetLocale,
	setLocale,
} from "#lib/paraglide/runtime.js";
import { languages } from "#lib/text/languages.ts";
import { play, settle, snapshot } from "#lib/text/retext.ts";

// Paraglide reloads on switch, which repaints from the top and jumps back to the slide.
const locale = $state<{ current: Locale }>({ current: baseLocale });

export function reactiveLocale() {
	locale.current = getLocale();
	overwriteGetLocale(() => locale.current);
}

export function switchLocale(next: Locale) {
	if (next === locale.current) return;

	// A running scramble would be recorded mid-noise and then finish on the old words.
	settle();
	const before = snapshot();

	setLocale(next, { reload: false });
	locale.current = next;
	document.documentElement.lang = languages[next].tag;
	document.documentElement.dir = getTextDirection(next);
	flushSync();

	play(before);
}
