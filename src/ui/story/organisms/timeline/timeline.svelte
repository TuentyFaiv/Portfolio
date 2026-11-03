<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";

	import "./timeline.css";

	const milestones = [
		{
			year: "2018",
			title: m["translation:story-page.2018-title"],
			body: m["translation:story-page.2018-body"],
		},
		{
			year: "2021",
			title: m["translation:story-page.2021-title"],
			body: m["translation:story-page.2021-body"],
		},
		{
			year: "2023",
			title: m["translation:story-page.2023-title"],
			body: m["translation:story-page.2023-body"],
		},
		{
			year: "2025",
			title: m["translation:story-page.2025-title"],
			body: m["translation:story-page.2025-body"],
		},
		{
			year: "2026",
			title: m["translation:story-page.2026-title"],
			body: m["translation:story-page.2026-body"],
		},
	];
</script>

<section class="timeline">
	<hgroup class="timeline__head">
		<p class="timeline__eyebrow">{m["translation:story-page.eyebrow"]()}</p>
		<h1 class="timeline__title">
			{m["translation:story-page.title"]()}
			<span class="timeline__title-end">{m["translation:story-page.title-end"]()}</span>
		</h1>
	</hgroup>

	<ol class="timeline__line" aria-label={m["translation:story-page.timeline"]()}>
		{#each milestones as { year, title, body } (year)}
			<li class="timeline__stop">
				<time class="timeline__year" datetime={year}>{year}</time>
				<h2 class="timeline__milestone">{title()}</h2>
				<p class="timeline__body">{body()}</p>
			</li>
		{/each}
	</ol>
</section>
