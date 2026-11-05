<script lang="ts">
	import { beforeNavigate } from "$app/navigation";

	import { nebula } from "#attach/nebula.ts";

	import "./nebula.css";

	import type { Props } from "./nebula.proptypes.ts";

	let { scene = "sky" }: Props = $props();

	let canvas = $state<HTMLCanvasElement>();

	// Leaving the page: stop drawing at once, so the GPU is free for the route change.
	beforeNavigate(({ to }) => {
		if (to?.url.pathname !== window.location.pathname)
			canvas?.dispatchEvent(new Event("nebula:pause"));
	});
</script>

<!-- Decorative: the page reads the same without it. -->
<canvas
	bind:this={canvas}
	class={["nebula", scene === "band" && "nebula--band"]}
	aria-hidden="true"
	{@attach nebula(scene)}
></canvas>
