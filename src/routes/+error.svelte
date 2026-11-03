<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";

	import { m } from "#lib/paraglide/messages.js";
	import { SEO } from "#sharing/atoms/seo/index.ts";

	import "./error.css";

	let missing = $derived(page.status === 404);
	let title = $derived(
		missing ? m["translation:error.not-found"]() : m["translation:error.unexpected"]()
	);
</script>

<SEO {title} metas={[{ name: "robots", content: "noindex" }]} metaid="name" />

<section class="error">
	<hgroup class="error__heading">
		<p class="error__status">{page.status}</p>
		<h1 class="error__title">{title}</h1>
	</hgroup>
	<a class="error__home" href={resolve("/")}>{m["translation:error.home"]()}</a>
</section>
