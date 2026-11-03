<script lang="ts">
	import { Slide } from "#home/molecules/slide/index.ts";
	import { Deck } from "#home/organisms/deck/index.ts";
	import { Intro } from "#home/organisms/intro/index.ts";
	import { SEO } from "#sharing/atoms/seo/index.ts";
	import { slides } from "#utils/slides.ts";
</script>

<SEO />

<Deck>
	<Intro />

	{#each slides.slice(1) as { id } (id)}
		<Slide {id} />
	{/each}
</Deck>
