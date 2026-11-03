import type { Locale } from "#lib/paraglide/runtime.js";

/**
 * The site speaks en-US and es-MX. Locales stay plain "en" and "es" so any Spanish
 * browser (es-ES, es-AR, es-CO) matches: Paraglide only compares exact tags and base
 * languages, so "es-MX" as a locale would send those visitors to English.
 */
export const languages: Record<Locale, { code: string; tag: string }> = {
	en: { code: "EN", tag: "en-US" },
	es: { code: "ES", tag: "es-MX" },
};
