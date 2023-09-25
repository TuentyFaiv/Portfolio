<script lang="ts">
  import "@fontsource-variable/mulish/wght.css";
  import "@fontsource-variable/mulish/wght-italic.css";
  import "@fontsource-variable/orbitron";

  import "@styles";
  import { AppShell, AppBar, LightSwitch } from "@skeletonlabs/skeleton";
</script>

<AppShell>
  <svelte:fragment slot="header">
    <AppBar>
      <svelte:fragment slot="lead">
        <strong class="text-xl uppercase">Skeleton</strong>
        <LightSwitch />
      </svelte:fragment>
      <svelte:fragment slot="trail">
        <a
          class="btn btn-sm variant-ghost-surface"
          href="https://discord.gg/EXqV7W8MtY"
          target="_blank"
          rel="noreferrer"
        >
          Discord
        </a>
        <a
          class="btn btn-sm variant-ghost-surface"
          href="https://twitter.com/SkeletonUI"
          target="_blank"
          rel="noreferrer"
        >
          Twitter
        </a>
        <a
          class="btn btn-sm variant-ghost-surface"
          href="https://github.com/skeletonlabs/skeleton"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>
  <slot />
</AppShell>
