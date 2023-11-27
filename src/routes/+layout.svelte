<script lang="ts">
  import { modeCurrent } from "@skeletonlabs/skeleton";

  import "@fontsource-variable/mulish/wght.css";
  import "@fontsource-variable/mulish/wght-italic.css";
  import "@fontsource-variable/orbitron";

  import "@styles";

  import { Header } from "@sharing/organisms";

  const LogoBlack = "/logo_dark@3x.webp";
  const LogoWhite = "/logo@3x.webp";
</script>

<svelte:head>
  <link rel="icon" href={$modeCurrent ? LogoWhite : LogoBlack} />
  <meta name="theme-color" content={$modeCurrent ? "#961E1E" : "#21C08B"} />
  <meta
    name="theme-color"
    media="(prefers-color-scheme: light)"
    content="#961E1E"
  />
  <meta
    name="theme-color"
    media="(prefers-color-scheme: dark)"
    content="#21C08B"
  />
</svelte:head>

<Header />

<main>
  <slot />
</main>
