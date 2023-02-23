<script lang="ts">
  let count = 0;
  function setCounter() {
    count += 1;
  }
</script>

<header>
  <button on:click={setCounter}>
    Svelte counter
    {" "}
    {count}
  </button>
</header>
