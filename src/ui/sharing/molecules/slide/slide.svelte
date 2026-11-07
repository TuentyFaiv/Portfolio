<script lang="ts">
	import "./slide.css";

	import type { Props } from "./slide.proptypes.ts";

	let { id, label, children }: Props = $props();
</script>

<section {id} class="slide" aria-label={label}>
	{@render children()}
</section>
