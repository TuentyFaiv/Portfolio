<script lang="ts">
	import { onNavigate } from "$app/navigation";
	import { ModeWatcher, mode } from "mode-watcher";

	import { m } from "#lib/paraglide/messages.js";

	import "#styles";

	import type { LayoutProps } from "./$types";

	import { Header } from "#sharing/organisms/header/index.ts";
	import { morph } from "#utils/morph.ts";
	import { routeTransition } from "#utils/transition.ts";

	let { children }: LayoutProps = $props();

	/*
	 * Route changes crossfade natively, and what both pages show (the Story and Blog slides'
	 * headings) moves into place; hash jumps inside a page just scroll.
	 */
	onNavigate(({ complete, from, to }) => {
		const samePage = from?.route.id === to?.route.id;
		const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		const hidden = document.visibilityState !== "visible";

		// A new page lands where it should at once, never with a smooth scroll (see deck.css).
		if (!samePage) {
			const root = document.documentElement;

			const done = () => delete root.dataset.routing;

			root.dataset.routing = "";
			// Also when the navigation fails or is cancelled.
			complete.then(done, done);
		}

		if (!document.startViewTransition || samePage || calm || hidden) return;

		const arrive = morph(
			{ route: from?.route.id ?? null, hash: from?.url.hash ?? "" },
			{ route: to?.route.id ?? null, hash: to?.url.hash ?? "" }
		);
		let settle: (() => void) | undefined;

		return new Promise<void>((resolve) => {
			let transition: ViewTransition;

			try {
				transition = document.startViewTransition(async () => {
					resolve();
					await complete;
					settle = arrive();
				});
			} catch {
				// Some browsers throw instead of skipping: the route then changes without it.
				return resolve();
			}

			transition.finished.finally(() => settle?.());
			routeTransition.set(transition.finished);
			// The navigation must never wait on the effect: if the browser skips or aborts
			// the transition, or it simply has not started yet, the route changes anyway.
			transition.ready.catch(() => resolve());
			transition.finished.finally(() => resolve());
			window.setTimeout(resolve, 300);
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
