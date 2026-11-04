<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import { Nebula } from "#sharing/atoms/nebula/index.ts";
	import { SEO } from "#sharing/atoms/seo/index.ts";
	import { Deck } from "#sharing/organisms/deck/index.ts";
	import { Chapter } from "#story/organisms/chapter/index.ts";
	import { Opening } from "#story/organisms/opening/index.ts";
	import { chapters, storySlides } from "#utils/story.ts";

	import "./story.css";
</script>

<SEO title={m["translation:story"]()} description={m["translation:story-page.description"]()} />

<Nebula />

<Deck slides={storySlides}>
	<Opening />

	{#each chapters as { year, title, body } (year)}
		<Chapter {year} title={title()} body={body()} />
	{/each}
</Deck>
