<script lang="ts">
	import { walk } from "#attach/walk.ts";
	import { m } from "#lib/paraglide/messages.js";
	import { Slide } from "#sharing/molecules/slide/index.ts";
	import { layers } from "#utils/stack.ts";

	import "./stack.css";
</script>

<Slide id="stack" label={m["translation:deck.stack"]()}>
	<hgroup class="stack">
		<p class="stack__eyebrow">{m["translation:stack.eyebrow"]()}</p>
		<h2 class="stack__title">
			{m["translation:stack.title"]()}
			<span class="stack__punchline">{m["translation:stack.title-end"]()}</span>
		</h2>
	</hgroup>

	<!-- In order: from what people see down to how it ships. -->
	<ol class="layers" {@attach walk}>
		{#each layers as { id, label, tools, used } (id)}
			<li class="layers__layer">
				<h3 class="layers__name">{label()}</h3>
				<ul class="layers__tools">
					{#each tools as tool (tool)}
						<li class="layers__tool">{tool}</li>
					{/each}
				</ul>
				<p class="layers__used">{used()}</p>
			</li>
		{/each}
	</ol>
</Slide>
