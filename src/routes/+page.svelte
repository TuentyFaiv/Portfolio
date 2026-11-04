<script lang="ts">
	import { BlogTeaser } from "#home/organisms/blog-teaser/index.ts";
	import { Intro } from "#home/organisms/intro/index.ts";
	import { StoryTeaser } from "#home/organisms/story-teaser/index.ts";
	import { SEO } from "#sharing/atoms/seo/index.ts";
	import { Slide } from "#sharing/molecules/slide/index.ts";
	import { Deck } from "#sharing/organisms/deck/index.ts";
	import { slides } from "#utils/slides.ts";
</script>

<SEO />

<Deck {slides}>
	<Intro />

	<!-- Story and Blog have pages of their own: here they are doorways into them. -->
	{#each slides.slice(1) as { id, label } (id)}
		{#if id === "story"}
			<StoryTeaser />
		{:else if id === "blog"}
			<BlogTeaser />
		{:else}
			<Slide {id} label={label()} />
		{/if}
	{/each}
</Deck>
