<script lang="ts">
	import { onNavigate } from "$app/navigation";
	import { ModeWatcher, mode } from "mode-watcher";

	import { m } from "#lib/paraglide/messages.js";

	import "#styles";

	import type { LayoutProps } from "./$types";

	import { Header } from "#sharing/organisms/header/index.ts";

	let { children }: LayoutProps = $props();

	// Route changes crossfade natively; hash jumps inside a page just scroll.
	onNavigate(({ complete, from, to }) => {
		const samePage = from?.route.id === to?.route.id;
		const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (!document.startViewTransition || samePage || calm) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await complete;
			});
		});
	});

	$effect(() => {
		const href = mode.current === "dark" ? "/logo-dark-3x.webp" : "/logo-3x.webp";
		const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
		if (link) link.href = href;
	});
</script>

<svelte:head>
	<meta name="theme-color" content={mode.current === "dark" ? "#21C08B" : "#961E1E"}>
</svelte:head>

<ModeWatcher defaultMode="system" disableTransitions={false} disableHeadScriptInjection />

<a class="skip-link" href="#main">{m["translation:skip"]()}</a>

<Header />

<main id="main" tabindex="-1">
	{@render children()}
</main>
