<script lang="ts">
	import "./constellation.css";

	import type { Props } from "./constellation.proptypes.ts";

	let { shape, lit = false, class: className }: Props = $props();
</script>

<!-- A drawing only: whatever it stands for is named by the element around it. -->
<svg
	class={["constellation-shape", lit && "constellation-shape--lit", className]}
	viewBox="0 0 100 100"
	aria-hidden="true"
>
	{#each shape.lines as [from, to] (`${from}-${to}`)}
		{@const a = shape.stars[from] ?? [0, 0]}
		{@const b = shape.stars[to] ?? [0, 0]}
		<line class="constellation-shape__line" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
	{/each}
	<!-- A spark of light runs along the lines, one after another (with motion allowed). -->
	<g class="constellation-shape__sparks">
		{#each shape.lines as [from, to] (`${from}-${to}`)}
			{@const a = shape.stars[from] ?? [0, 0]}
			{@const b = shape.stars[to] ?? [0, 0]}
			<line
				class="constellation-shape__spark"
				x1={a[0]}
				y1={a[1]}
				x2={b[0]}
				y2={b[1]}
				pathLength="1"
			/>
		{/each}
	</g>
	{#each shape.stars as [x, y], index (index)}
		{#if lit}
			<circle class="constellation-shape__glow" cx={x} cy={y} r="7" />
		{/if}
		<circle
			class="constellation-shape__star"
			cx={x}
			cy={y}
			r={lit ? 2.2 : 1.8}
			data-land={index === shape.land || undefined}
		/>
	{/each}
	<!-- The star the route runs through: its core lights up once you have been there. -->
	{#if shape.stars[shape.land]}
		{@const [x, y] = shape.stars[shape.land] ?? [0, 0]}
		<circle class="constellation-shape__core" cx={x} cy={y} r="0.9" />
	{/if}
	<!-- Where the route ends: a second, wider ring, like the end of a line on a chart. -->
	{#if shape.end !== undefined && shape.stars[shape.end]}
		{@const [x, y] = shape.stars[shape.end] ?? [0, 0]}
		<circle class="constellation-shape__end" cx={x} cy={y} r="3.4" />
	{/if}
</svg>
