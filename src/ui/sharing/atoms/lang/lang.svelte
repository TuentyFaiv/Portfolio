<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import { getLocale, setLocale } from "#lib/paraglide/runtime.js";
	import { languages } from "#utils/languages.ts";

	import "./lang.css";

	const current = getLocale();
	const other = current === "en" ? "es" : "en";
</script>

<button
	type="button"
	class="language"
	aria-label={m["translation:language-switch"]()}
	onclick={() => setLocale(other)}
>
	{languages[current].code}
</button>
