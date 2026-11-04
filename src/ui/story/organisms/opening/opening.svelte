<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import { Slide } from "#sharing/molecules/slide/index.ts";

	import "./opening.css";
</script>

<Slide id="story" label={m["translation:story"]()}>
	<hgroup class="opening">
		<p class="opening__eyebrow">{m["translation:story-page.eyebrow"]()}</p>
		<h1 class="opening__title">
			{m["translation:story-page.title"]()}
			<span class="opening__punchline">{m["translation:story-page.title-end"]()}</span>
		</h1>
	</hgroup>
</Slide>
