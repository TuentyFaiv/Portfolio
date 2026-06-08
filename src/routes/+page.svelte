<script lang="ts">
	import { getLocale } from "$lib/paraglide/runtime";

	import { Hero } from "~home/organisms/hero";
	import { SEO } from "~sharing/atoms/seo";
</script>

<SEO />

<Hero />

{getLocale()}
