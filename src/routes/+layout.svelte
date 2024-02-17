<script lang="ts">
  import { dev } from "$app/environment";
  import { inject } from "@vercel/analytics";
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
  import { modeCurrent } from "@skeletonlabs/skeleton";

  import "@fontsource-variable/mulish/wght.css";
  import "@fontsource-variable/mulish/wght-italic.css";
  import "@fontsource-variable/orbitron";

  import "@styles";

  import { Header } from "@sharing/organisms";

  inject({ mode: dev ? "development" : "production" });
  injectSpeedInsights();

  const LogoBlack = "/logo_dark@3x.webp";
  const LogoWhite = "/logo@3x.webp";
</script>

<svelte:head>
  <link rel="icon" href={$modeCurrent ? LogoWhite : LogoBlack} />
  <meta name="theme-color" content={$modeCurrent ? "#961E1E" : "#21C08B"} />
</svelte:head>

<Header />

<main>
  <slot />
</main>
