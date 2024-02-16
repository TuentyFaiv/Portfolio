<script lang="ts">
  import { onMount } from "svelte";
  import {
    modeCurrent,
    setModeUserPrefers,
    setModeCurrent,
    getModeOsPrefers,
    setInitialClassState,
  } from "@skeletonlabs/skeleton";

  import "./ThemeSwitch.postcss";

  function onToggle() {
    $modeCurrent = !$modeCurrent;
    setModeUserPrefers($modeCurrent);
    setModeCurrent($modeCurrent);
  }

  onMount(() => {
    if (!("modeCurrent" in localStorage)) {
      setModeCurrent(getModeOsPrefers());
    }
    setInitialClassState();
  });
</script>

<button
  class="themeswitch"
  on:click|stopPropagation={onToggle}
  role="switch"
  aria-label="Theme switch"
  aria-checked={$modeCurrent}
>
  <span class="themeswitch__star" />
  <span class="themeswitch__decoration">
    <span class="themeswitch__cloud" />
    <span class="themeswitch__cloud" />
    <span class="themeswitch__cloud" />
    <span class="themeswitch__litte-star" />
    <span class="themeswitch__litte-star" />
    <span class="themeswitch__litte-star" />
  </span>
</button>
