<script lang="ts">
  import { modeCurrent } from "@skeletonlabs/skeleton";
  import { page } from "$app/stores";
  import config from "@config";

  import type { Props } from "./SEO.proptypes";

  export let title: Props["title"] = null;
  export let cover: Props["cover"] = null;
  export let description: Props["description"] = "";
  export let largeDescription: Props["largeDescription"] = undefined;
  export let metas: Props["metas"] = [];
  export let metaid: Props["metaid"] = "id";

  $: titleSeo = !title ? config.brand : `${title} | ${config.brand}`;
  $: descriptionSeo = !description ? config.description : description;
  $: defaulCover = !$modeCurrent ? "/logo_dark@3x.webp" : "/logo@3x.webp";
  $: coverSeo = !cover ? `${$page.url.origin}${defaulCover}` : cover;
</script>

<svelte:head>
  <title>
    {titleSeo}
  </title>
  <meta name="description" content={descriptionSeo} />

  <meta property="twitter:title" content={titleSeo} />
  <meta property="twitter:image" content={coverSeo} />
  <meta property="twitter:description" content={descriptionSeo} />
  {#if largeDescription}
    <meta property="twitter:card" content={largeDescription} />
  {/if}
  <meta property="og:title" content={titleSeo} />
  <meta property="og:image" content={coverSeo} />
  <meta property="og:description" content={descriptionSeo} />
  <meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />

  {#each metas as meta (meta[metaid])}
    <meta {...meta} />
  {/each}
</svelte:head>
