<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import { Slide } from "#sharing/molecules/slide/index.ts";
	import { chapterId } from "#utils/story.ts";

	import "./chapter.css";

	import type { Props } from "./chapter.proptypes.ts";

	let { year, title, body }: Props = $props();
</script>

<Slide id={chapterId(year)} label={year}>
	<article class="chapter">
		<hgroup class="chapter__heading">
			<p class="chapter__year"><time datetime={year}>{year}</time></p>
			<h2 class="chapter__title">{title}</h2>
		</hgroup>
		<p class="chapter__body">{body}</p>
	</article>
</Slide>
