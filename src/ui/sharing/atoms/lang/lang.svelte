<script lang="ts">
	import type { Locale } from "#lib/paraglide/runtime.js";

	import { m } from "#lib/paraglide/messages.js";
	import { getLocale } from "#lib/paraglide/runtime.js";
	import { languages } from "#utils/languages.ts";
	import { switchLocale } from "#utils/locale.svelte.ts";

	import "./lang.css";

	let current = $derived(getLocale());
	let other = $derived<Locale>(current === "en" ? "es" : "en");
</script>

<!-- Switches in place, with no reload: the page keeps its scroll and this button its focus. -->
<button
	type="button"
	class="language"
	aria-label={m["translation:language-switch"]()}
	onclick={() => switchLocale(other)}
>
	{languages[current].code}
</button>
