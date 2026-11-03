<script lang="ts">
	import { page } from "$app/state";

	import type { Props } from "./seo.proptypes";

	import config from "#config";
	import { m } from "#lib/paraglide/messages.js";
	import { getLocale } from "#lib/paraglide/runtime.js";
	import { languages } from "#utils/languages.ts";

	let { title, description, cover, metas = [], metaid = "id" }: Props = $props();

	let titleSeo = $derived(!title ? config.brand : `${title} | ${config.brand}`);
	let descriptionSeo = $derived(description || m["translation:intro.lede-short"]());
	// From config, never the request, so a forged Host header cannot end up in the page.
	let url = $derived(`${config.url}${page.url.pathname}`);
	let coverSeo = $derived(cover ?? `${config.url}/logo-dark-3x.webp`);
	let locale = $derived(languages[getLocale()].tag.replace("-", "_"));
</script>

<svelte:head>
	<title>{titleSeo}</title>
	<meta name="description" content={descriptionSeo}>
	<link rel="canonical" href={url}>

	<meta name="twitter:card" content="summary">
	<meta name="twitter:title" content={titleSeo}>
	<meta name="twitter:description" content={descriptionSeo}>
	<meta name="twitter:image" content={coverSeo}>

	<meta property="og:type" content="website">
	<meta property="og:site_name" content={config.brand}>
	<meta property="og:title" content={titleSeo}>
	<meta property="og:description" content={descriptionSeo}>
	<meta property="og:image" content={coverSeo}>
	<meta property="og:url" content={url}>
	<meta property="og:locale" content={locale}>

	{#each metas as meta (meta[metaid])}
		<meta {...meta}>
	{/each}
</svelte:head>
