<script lang="ts">
	import { PostList } from "#blog/organisms/post-list/index.ts";
	import { m } from "#lib/paraglide/messages.js";
	import { SEO } from "#sharing/atoms/seo/index.ts";
</script>

<SEO
	title={m["translation:blog"]()}
	description={m["translation:blog-page.lede"]()}
	cover="/og/blog.jpg"
	coverAlt={m["translation:seo.blog-cover"]()}
/>

<PostList posts={[]} />
