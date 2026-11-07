<script lang="ts">
	import { page } from "$app/state";

	import type { Props } from "./seo.proptypes";

	import config from "#config";
	import { m } from "#lib/paraglide/messages.js";
	import { getLocale, locales } from "#lib/paraglide/runtime.js";
	import { jsonLd } from "#lib/seo/json-ld.ts";
	import { languages } from "#lib/text/languages.ts";

	let {
		title,
		fullTitle,
		description,
		cover = "/og/home.jpg",
		coverAlt,
		shared,
		schema,
		metas = [],
		metaid = "id",
	}: Props = $props();

	let titleSeo = $derived(fullTitle ?? (!title ? config.brand : `${title} | ${config.brand}`));
	let descriptionSeo = $derived(description || m["translation:seo.home-description"]());
	// From config, never the request: a forged Host header must not reach the page.
	let url = $derived(`${config.url}${page.url.pathname}`);
	let coverSeo = $derived(`${config.url}${cover}`);
	let locale = $derived(languages[getLocale()].tag.replace("-", "_"));
	let alternates = $derived(
		locales
			.filter((code) => code !== getLocale())
			.map((code) => languages[code].tag.replace("-", "_"))
	);
</script>

<svelte:head>
	<title>{titleSeo}</title>
	<meta name="description" content={descriptionSeo}>
	<link rel="canonical" href={url}>

	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={titleSeo}>
	<meta name="twitter:description" content={descriptionSeo}>
	<meta name="twitter:image" content={coverSeo}>
	<meta name="twitter:image:alt" content={coverAlt ?? titleSeo}>

	<meta property="og:type" content="website">
	<meta property="og:site_name" content={config.brand}>
	<meta property="og:title" content={titleSeo}>
	<meta property="og:description" content={descriptionSeo}>
	<meta property="og:image" content={coverSeo}>
	<meta property="og:image:type" content="image/jpeg">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta property="og:image:alt" content={coverAlt ?? titleSeo}>
	<meta property="og:url" content={shared ?? url}>
	<meta property="og:locale" content={locale}>
	{#each alternates as alternate (alternate)}
		<meta property="og:locale:alternate" content={alternate}>
	{/each}

	{#each metas as meta (meta[metaid])}
		<meta {...meta}>
	{/each}

	{#if schema}
		{@html jsonLd(schema)}
	{/if}
</svelte:head>
