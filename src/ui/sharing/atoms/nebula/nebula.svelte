<script lang="ts">
	import { beforeNavigate } from "$app/navigation";

	import { nebula } from "#lib/nebula/nebula.attach.ts";

	import "./nebula.css";

	import type { Props } from "./nebula.proptypes.ts";

	let { scene = "sky" }: Props = $props();

	let canvas = $state<HTMLCanvasElement>();

	beforeNavigate(({ to }) => {
		if (to?.url.pathname !== window.location.pathname)
			canvas?.dispatchEvent(new Event("nebula:pause"));
	});
</script>

<canvas
	bind:this={canvas}
	class={["nebula", scene !== "sky" && `nebula--${scene}`]}
	aria-hidden="true"
	{@attach nebula(scene)}
></canvas>
