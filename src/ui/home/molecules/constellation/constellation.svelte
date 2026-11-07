<script lang="ts">
	import "./constellation.css";

	import type { Props } from "./constellation.proptypes.ts";

	let { shape }: Props = $props();

	const segments = $derived(
		shape.lines.map(([from, to]) => {
			const [x1, y1] = shape.stars[from] ?? [0, 0];
			const [x2, y2] = shape.stars[to] ?? [0, 0];

			return { id: `${from}-${to}`, x1, y1, x2, y2 };
		})
	);
	const land = $derived(shape.stars[shape.land]);
	const end = $derived(shape.end === undefined ? undefined : shape.stars[shape.end]);
</script>

<svg class="constellation-shape" viewBox="0 0 100 100" aria-hidden="true">
	{#each segments as { id, ...line } (id)}
		<line class="constellation-shape__line" {...line} />
	{/each}
	<g class="constellation-shape__sparks">
		{#each segments as { id, ...line } (id)}
			<line class="constellation-shape__spark" {...line} pathLength="1" />
		{/each}
	</g>
	{#each shape.stars as [cx, cy], index (index)}
		<circle
			class="constellation-shape__star"
			{cx}
			{cy}
			r="1.8"
			data-land={index === shape.land || undefined}
		/>
	{/each}
	{#if land}
		<circle class="constellation-shape__core" cx={land[0]} cy={land[1]} r="0.9" />
	{/if}
	{#if end}
		<circle class="constellation-shape__end" cx={end[0]} cy={end[1]} r="3.4" />
	{/if}
</svg>
