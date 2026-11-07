<script lang="ts">
	import type { Locale } from "#lib/paraglide/runtime.js";

	import { m } from "#lib/paraglide/messages.js";
	import { getLocale } from "#lib/paraglide/runtime.js";
	import { languages } from "#lib/text/languages.ts";
	import { switchLocale } from "#lib/text/locale.svelte.ts";

	import "./lang.css";

	let current = $derived(getLocale());
	let other = $derived<Locale>(current === "en" ? "es" : "en");
</script>

<button
	type="button"
	class="language"
	aria-label={m["translation:language-switch"]()}
	onclick={() => switchLocale(other)}
>
	{languages[current].code}
</button>
