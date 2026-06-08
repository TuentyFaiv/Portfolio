<script lang="ts">
	import { ModeWatcher, mode } from "mode-watcher";

	import "~styles";

	import type { LayoutProps } from "./$types";

	import { Header } from "~sharing/organisms/header";

	let { children }: LayoutProps = $props();

	$effect(() => {
		const href = mode.current === "dark" ? "/logo_dark@3x.webp" : "/logo@3x.webp";
		const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
		if (link) link.href = href;
	});
</script>

<svelte:head>
	<meta name="theme-color" content={mode.current === "dark" ? "#21C08B" : "#961E1E"}>
</svelte:head>

<ModeWatcher defaultMode="dark" disableTransitions={false} disableHeadScriptInjection />

<Header />

<main>
	{@render children()}
</main>
