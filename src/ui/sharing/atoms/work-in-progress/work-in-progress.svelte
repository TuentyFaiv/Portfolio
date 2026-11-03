<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";

	import "./work-in-progress.css";

	import type { Props } from "./work-in-progress.proptypes.ts";

	let { title, level = 2 }: Props = $props();
</script>

<hgroup class="work-in-progress">
	<svelte:element this={`h${level}`} class="work-in-progress__title">{title}</svelte:element>
	<p class="work-in-progress__status">{m["translation:deck.work-in-progress"]()}</p>
</hgroup>
