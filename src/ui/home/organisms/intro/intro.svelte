<script lang="ts">
	import config from "#config";
	import { Slide } from "#home/molecules/slide/index.ts";
	import { m } from "#lib/paraglide/messages.js";

	import "./intro.css";

	const github = config.socials.find(({ content }) => content === "GitHub");
</script>

<Slide id="intro">
	<hgroup class="intro">
		<p class="intro__eyebrow intro__eyebrow--long">{m["translation:intro.eyebrow"]()}</p>
		<p class="intro__eyebrow intro__eyebrow--short">{m["translation:intro.eyebrow-short"]()}</p>

		<h1 class="intro__title">
			{m["translation:intro.greeting"]()}
			<span class="intro__punchline">{m["translation:intro.punchline"]()}</span>
		</h1>

		<p class="intro__lede intro__lede--long">{m["translation:intro.lede"]()}</p>
		<p class="intro__lede intro__lede--short">{m["translation:intro.lede-short"]()}</p>
	</hgroup>

	<footer class="intro__actions">
		<a class="intro__action intro__action--primary" href="#projects">
			{m["translation:intro.tour"]()}
			<svg class="intro__icon intro__icon--stroke" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M6 3.5v17l14-8.5z" />
			</svg>
		</a>
		{#if github}
			<a
				class="intro__action intro__action--ghost"
				href={github.href}
				target="_blank"
				rel="me noopener noreferrer"
			>
				{github.content}
				<svg class="intro__icon" viewBox="0 0 24 24" aria-hidden="true">
					<path d={github.icon} />
				</svg>
			</a>
		{/if}
	</footer>
</Slide>
