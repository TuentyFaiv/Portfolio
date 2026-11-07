import type { Locale } from "#lib/paraglide/runtime.js";

// Paraglide matches exact tags or bases only: "es" (not "es-MX") also matches es-AR, es-ES.
export const languages: Record<Locale, { code: string; tag: string }> = {
	en: { code: "EN", tag: "en-US" },
	es: { code: "ES", tag: "es-MX" },
};
