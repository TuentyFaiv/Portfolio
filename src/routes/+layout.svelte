<script lang="ts">
  import { modeCurrent } from "@skeletonlabs/skeleton";

  import "@fontsource-variable/mulish/wght.css";
  import "@fontsource-variable/mulish/wght-italic.css";
  import "@fontsource-variable/orbitron";

  import "@styles";
  import { ThemeSwitch } from "@sharing/atoms";

  const LogoBlack = "/logo_dark@3x.webp";
  const LogoWhite = "/logo@3x.webp";
</script>

<svelte:head>
  <link rel="icon" href={$modeCurrent ? LogoWhite : LogoBlack} />
</svelte:head>
<ThemeSwitch />
<slot />
