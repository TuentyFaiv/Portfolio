<script lang="ts">
	import { page } from "$app/state";

	import { m } from "#lib/paraglide/messages.js";
	import { getLocale } from "#lib/paraglide/runtime.js";
	import { collectTags, formatMonth, groupByYear } from "#utils/blog.ts";

	import "./post-list.css";

	import type { Props } from "./post-list.proptypes";

	let { posts }: Props = $props();

	let active = $derived(page.url.searchParams.get("tag"));
	let tags = $derived(collectTags(posts));
	let visible = $derived(
		active ? posts.filter((post) => post.tags.some((tag) => tag.slug === active)) : posts
	);
	let years = $derived(groupByYear(visible));
</script>

<section class="posts">
	<header class="posts__hero">
		<p class="posts__eyebrow">{m["translation:blog-page.eyebrow"]()}</p>
		<h1 class="posts__title">{m["translation:blog-page.title"]()}</h1>
		<p class="posts__lede">{m["translation:blog-page.lede"]()}</p>

		{#if tags.length > 1}
			<nav class="posts__filters" aria-label={m["translation:blog-page.filter"]()}>
				<a href="/blog" class="posts__filter" aria-current={active ? undefined : "page"}>
					{m["translation:blog-page.all"]()}
				</a>
				{#each tags as tag (tag.slug)}
					<a
						href="/blog?tag={tag.slug}"
						class="posts__filter"
						aria-current={active === tag.slug ? "page" : undefined}
					>
						{tag.title}
					</a>
				{/each}
			</nav>
		{/if}
	</header>

	{#if posts.length === 0}
		<div class="posts__empty">
			<p class="posts__empty-label">{m["translation:blog-page.empty-label"]()}</p>
			<h2 class="posts__empty-title">{m["translation:blog-page.empty-title"]()}</h2>
			<p class="posts__empty-body">{m["translation:blog-page.empty-body"]()}</p>
			<a href="/" class="posts__empty-action">
				{m["translation:blog-page.empty-action"]()}
				<span aria-hidden="true">→</span>
			</a>
		</div>
	{:else if visible.length === 0}
		<p class="posts__none">{m["translation:blog-page.no-results"]()}</p>
	{:else}
		{#each years as { year, items } (year)}
			<section class="posts__year">
				<h2 class="posts__year-label">{year}</h2>
				<ul class="posts__items">
					{#each items as post (post.id)}
						<li class="posts__item">
							<div class="posts__text">
								<h3 class="posts__post-title">
									<a href="/blog/{post.slug}" class="posts__link">{post.title}</a>
								</h3>
								<p class="posts__excerpt">{post.excerpt}</p>
							</div>
							<p class="posts__meta">
								{#if post.tags[0]}
									<span class="posts__tag">{post.tags[0].title}</span>
								{/if}
								<span>
									<time datetime={post.publishedAt}
										>{formatMonth(post.publishedAt, getLocale())}</time
									>
									· {m["translation:blog-page.min-read"]({ minutes: post.readingMinutes })}
								</span>
							</p>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{/if}
</section>
