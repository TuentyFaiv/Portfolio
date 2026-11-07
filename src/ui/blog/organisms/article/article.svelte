<script lang="ts">
	import { formatMonth } from "#lib/blog/posts.ts";
	import { m } from "#lib/paraglide/messages.js";
	import { getLocale } from "#lib/paraglide/runtime.js";

	import "./article.css";

	import type { Props } from "./article.proptypes";

	let { post, headings, next }: Props = $props();
</script>

<div class="article">
	<article class="article__main">
		<a href="/blog" class="article__back">
			<span aria-hidden="true">←</span>
			{m["translation:blog-page.back"]()}
		</a>

		<p class="article__meta">
			{#if post.tags[0]}
				<span class="article__tag">{post.tags[0].title}</span>
			{/if}
			<span>
				<time datetime={post.publishedAt}>{formatMonth(post.publishedAt, getLocale())}</time>
				· {m["translation:blog-page.min-read"]({ minutes: post.readingMinutes })}
			</span>
		</p>

		<h1 class="article__title">{post.title}</h1>
		<p class="article__excerpt">{post.excerpt}</p>

		<div class="article__body">
			{@html post.html}
		</div>

		{#if next}
			<a href="/blog/{next.slug}" class="article__next">
				<span class="article__next-label">{m["translation:blog-page.next"]()}</span>
				<span class="article__next-title">{next.title}</span>
			</a>
		{/if}
	</article>

	{#if headings.length > 1}
		<nav class="article__toc" aria-label={m["translation:blog-page.toc"]()}>
			<p class="article__toc-label">{m["translation:blog-page.toc"]()}</p>
			{#each headings as { id, text } (id)}
				<a href="#{id}" class="article__toc-link">{text}</a>
			{/each}
		</nav>
	{/if}
</div>
