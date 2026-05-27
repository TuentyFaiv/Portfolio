<script lang="ts">
	import { page } from "$app/state";
	import config from "~config";

	import type { Props } from "./seo.proptypes";

	let { title, description, cover, largeDescription, metas = [], metaid = "id" }: Props = $props();

	let titleSeo = $derived(!title ? config.brand : `${title} | ${config.brand}`);
	let descriptionSeo = $derived(!description ? config.description : description);
	let defaultCover = $derived(!cover ? "/logo_dark@3x.webp" : cover);
	let coverSeo = $derived(!cover ? `${page.url.origin}${defaultCover}` : cover);
</script>

<svelte:head>
	<title>
		{titleSeo}
	</title>
	<meta name="description" content={descriptionSeo}>

	<meta property="twitter:title" content={titleSeo}>
	<meta property="twitter:image" content={coverSeo}>
	<meta property="twitter:description" content={descriptionSeo}>
	{#if largeDescription}
		<meta property="twitter:card" content={largeDescription}>
	{/if}
	<meta property="og:title" content={titleSeo}>
	<meta property="og:image" content={coverSeo}>
	<meta property="og:description" content={descriptionSeo}>
	<meta property="og:url" content="{page.url.origin}{page.url.pathname}">

	{#each metas as meta (meta[metaid])}
		<meta {...meta}>
	{/each}
</svelte:head>
