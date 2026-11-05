<script lang="ts">
	import { Slide } from "#sharing/molecules/slide/index.ts";

	import "./teaser.css";

	import type { Props } from "./teaser.proptypes.ts";

	let { id, label, eyebrow, title, punchline, lede, action, children }: Props = $props();
</script>

<!-- A doorway to a page of its own: a short heading, maybe shortcuts, and the way in. -->
<Slide {id} {label}>
	<hgroup class="teaser">
		{#if eyebrow}
			<p class="teaser__eyebrow">{eyebrow}</p>
		{/if}
		<h2 class="teaser__title">
			{title}
			{#if punchline}
				<span class="teaser__punchline">{punchline}</span>
			{/if}
		</h2>
		{#if lede}
			<p class="teaser__lede">{lede}</p>
		{/if}
	</hgroup>

	{@render children?.()}

	<a class="teaser__action" href={action.href}>
		{action.text}
		<svg class="teaser__icon" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M5 12h14M13 6l6 6-6 6" />
		</svg>
	</a>
</Slide>
