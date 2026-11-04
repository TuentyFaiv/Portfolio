<script lang="ts">
	import { Teaser } from "#home/molecules/teaser/index.ts";
	import { m } from "#lib/paraglide/messages.js";
	import { chapterId, chapters } from "#utils/story.ts";

	import "./story-teaser.css";
</script>

<Teaser
	id="story"
	label={m["translation:deck.story"]()}
	eyebrow={m["translation:story-page.eyebrow"]()}
	title={m["translation:story-page.title"]()}
	punchline={m["translation:story-page.title-end"]()}
	action={{ href: "/story", text: m["translation:story-teaser.action"]() }}
>
	<!-- Each year opens the story right at its chapter. -->
	<ol class="story-teaser" aria-label={m["translation:story-teaser.years"]()}>
		{#each chapters as { year, title } (year)}
			<li>
				<a class="story-teaser__year" href="/story#{chapterId(year)}">
					{year}<span class="sr-only">: {title()}</span>
				</a>
			</li>
		{/each}
	</ol>
</Teaser>
