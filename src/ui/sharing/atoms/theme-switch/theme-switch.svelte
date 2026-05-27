<script lang="ts">
	import { m } from "$lib/paraglide/messages";
	import { mode, toggleMode } from "mode-watcher";

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
	<span class="themeswitch__star"> </span>

	<span class="themeswitch__cloud"> </span>
	<span class="themeswitch__cloud"> </span>
	<span class="themeswitch__cloud"> </span>
	<span class="themeswitch__litte-star"> </span>
	<span class="themeswitch__litte-star"> </span>
	<span class="themeswitch__litte-star"> </span>
</button>
