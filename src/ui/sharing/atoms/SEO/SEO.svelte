<script lang="ts">
  import config from "@config";

  import type { Props } from "./SEO.proptypes";

  export let title: Props["title"] = null;
  export let description: Props["description"] = "";
  export let metas: Props["metas"] = [];
  export let metaid: Props["metaid"] = "id";

  $: titleSeo = !title ? config.brand : `${title} | ${config.brand}`;
</script>

<svelte:head>
  <title>
    {titleSeo}
  </title>
  {#if description === ""}
    <meta name="description" content={config.description} />
  {:else}
    <meta name="description" content={description} />
  {/if}

  {#each metas as meta (meta[metaid])}
    <meta {...meta} />
  {/each}
</svelte:head>
