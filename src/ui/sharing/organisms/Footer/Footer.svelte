<script lang="ts">
  import type { Props } from "./Footer.proptypes";

  import "./Footer.postcss";

  export let prop: Props["prop"];
</script>

<div class="footer">
  {prop}
</div>
