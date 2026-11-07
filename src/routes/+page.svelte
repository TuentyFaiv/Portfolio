<script lang="ts">
	import { page } from "$app/state";

	import type { Component } from "svelte";
	import type { SlideId } from "#lib/content/slides.ts";

	import config from "#config";
	import { BlogTeaser } from "#home/organisms/blog-teaser/index.ts";
	import { Contact } from "#home/organisms/contact/index.ts";
	import { Intro } from "#home/organisms/intro/index.ts";
	import { Projects } from "#home/organisms/projects/index.ts";
	import { Stack } from "#home/organisms/stack/index.ts";
	import { StoryTeaser } from "#home/organisms/story-teaser/index.ts";
	import { slides } from "#lib/content/slides.ts";
	import { m } from "#lib/paraglide/messages.js";
	import { project, slots } from "#lib/projects/data.ts";
	import { SEO } from "#sharing/atoms/seo/index.ts";
	import { Deck } from "#sharing/organisms/deck/index.ts";

	const sections = {
		intro: Intro,
		projects: Projects,
		story: StoryTeaser,
		stack: Stack,
		blog: BlogTeaser,
		contact: Contact,
	} satisfies Record<SlideId, Component>;

	const lit = $derived(
		slots.find(({ id, lit }) => lit && id === page.url.searchParams.get("project"))
	);
	const tagline = $derived(m["translation:projects.tagline"]());
	const seo = $derived(
		lit
			? {
					title: `${project.name} · ${tagline}`,
					description: m["translation:projects.lede"](),
					cover: project.cover,
					coverAlt: m["translation:seo.project-cover"]({ name: project.name, tagline }),
					shared: `${config.url}/?project=${lit.id}`,
				}
			: {
					fullTitle: m["translation:seo.home-title"](),
					coverAlt: m["translation:seo.home-cover"](),
				}
	);
	const software = $derived({
		"@type": "SoftwareSourceCode",
		name: project.name,
		description: m["translation:projects.lede"](),
		url: project.href,
		codeRepository: project.source,
		programmingLanguage: "TypeScript",
		license: "https://opensource.org/licenses/MIT",
		author: { "@id": `${config.url}/#person` },
	});
</script>

<SEO {...seo} schema={software} />

<Deck {slides}>
	{#each slides as { id } (id)}
		{@const Section = sections[id]}
		<Section />
	{/each}
</Deck>
