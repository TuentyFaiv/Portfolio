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

<ModeWatcher
	defaultMode="dark"
	disableTransitions={false}
	themeColors={{ dark: "#21C08B", light: "#961E1E" }}
	disableHeadScriptInjection
/>

<svelte:head>
	<link rel="icon" href="/logo@3x.webp">
</svelte:head>

<Header />

<main>
	{@render children()}
</main>
