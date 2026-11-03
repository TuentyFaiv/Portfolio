<script lang="ts">
	import { WorkInProgress } from "#sharing/atoms/work-in-progress/index.ts";
	import { slides } from "#utils/slides.ts";

	import "./slide.css";

	import type { Props } from "./slide.proptypes.ts";

	let { id, children }: Props = $props();

	let label = $derived(slides.find((slide) => slide.id === id)?.label());
</script>

<section {id} class="slide" aria-label={label}>
	{#if children}
		{@render children()}
	{:else}
		<WorkInProgress title={label} />
	{/if}
</section>
