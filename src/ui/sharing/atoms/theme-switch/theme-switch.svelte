<script lang="ts">
	import { mode, toggleMode } from "mode-watcher";

	import { m } from "#lib/paraglide/messages.js";

	import "./theme-switch.css";
</script>

<button
	type="button"
	class="themeswitch"
	onclick={toggleMode}
	role="switch"
	aria-label={m["translation:theme.change"]()}
	aria-checked={mode.current === "dark"}
>
	<svg class="themeswitch__icon themeswitch__icon--moon" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
	</svg>
	<svg class="themeswitch__icon themeswitch__icon--sun" viewBox="0 0 24 24" aria-hidden="true">
		<circle cx="12" cy="12" r="4" />
		<path
			d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
		/>
	</svg>
</button>
