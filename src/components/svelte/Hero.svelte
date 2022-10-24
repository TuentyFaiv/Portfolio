<script lang="ts">
  import { onMount } from "svelte";
  import { updateRefs } from "@stores/refs";

  import "@stylescomp/Hero.scss";
  import "@stylescomp/responsive/_Hero.scss";
  import "@stylescomp/Button.scss";

  let ref: HTMLElement;

  onMount(() => {
    updateRefs(ref, "main");
  });
</script>

<section class="hero" bind:this={ref}>
  <h1 class="hero__title">
    Recuerda tener siempre la mente sana y el cuerpo sano.
  </h1>
  <p><span role="img" aria-label="icon">💪🏻</span></p>
  <a class="button" href="/#favs">Proyectos destacados</a>
</section>

<!-- <style lang="scss">
  @import "../styles/components/Hero.scss";
  @import "../styles/components/responsive/_Hero.css";
</style> -->
