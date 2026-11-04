<script lang="ts">
	import { Teaser } from "#home/molecules/teaser/index.ts";
	import { m } from "#lib/paraglide/messages.js";
</script>

<!-- Until the first posts are out, it says what the blog itself says. Once they are, the
     latest three go between the heading and the link. -->
<Teaser
	id="blog"
	label={m["translation:deck.blog"]()}
	eyebrow={m["translation:blog-page.empty-label"]()}
	title={m["translation:blog-page.empty-title"]()}
	lede={m["translation:blog-page.empty-body"]()}
	action={{ href: "/blog", text: m["translation:blog-teaser.action"]() }}
/>
