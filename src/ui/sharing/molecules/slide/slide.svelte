<script lang="ts">
	import { WorkInProgress } from "#sharing/atoms/work-in-progress/index.ts";

	import "./slide.css";

	import type { Props } from "./slide.proptypes.ts";

	let { id, label, children }: Props = $props();
</script>

<section {id} class="slide" aria-label={label}>
	{#if children}
		{@render children()}
	{:else}
		<WorkInProgress title={label} />
	{/if}
</section>
