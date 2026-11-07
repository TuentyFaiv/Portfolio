<script lang="ts">
	import { prefersReducedMotion } from "svelte/motion";
	import { onNavigate } from "$app/navigation";
	import { ModeWatcher, mode } from "mode-watcher";

	import { m } from "#lib/paraglide/messages.js";

	import "#styles";

	import type { LayoutProps } from "./$types";

	import { routeTransition } from "#lib/shared/transition.ts";
	import { morph } from "#lib/text/morph.ts";
	import { Header } from "#sharing/organisms/header/index.ts";

	let { children }: LayoutProps = $props();

	onNavigate(({ complete, from, to }) => {
		const samePage = from?.route.id === to?.route.id;

		const hidden = document.visibilityState !== "visible";

		if (!samePage) {
			const root = document.documentElement;

			const done = () => delete root.dataset.routing;

			root.dataset.routing = "";
			complete.then(done, done);
		}

		if (!document.startViewTransition || samePage || prefersReducedMotion.current || hidden) return;

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
				return resolve();
			}

			transition.finished.finally(() => settle?.());
			routeTransition.set(transition.finished);
			// Never block navigation on the transition: browsers may skip or abort it.
			transition.ready.catch(() => resolve());
			transition.finished.finally(() => resolve());
			window.setTimeout(resolve, 300);
		});
	});
</script>

<svelte:head>
	<meta name="theme-color" content={mode.current === "dark" ? "#21C08B" : "#961E1E"}>
	<link rel="icon" href={mode.current === "dark" ? "/logo-dark-3x.webp" : "/logo-3x.webp"}>
</svelte:head>

<ModeWatcher defaultMode="system" disableTransitions={false} disableHeadScriptInjection />

<a class="skip-link" href="#main">{m["translation:skip"]()}</a>

<Header />

<main id="main" tabindex="-1">
	{@render children()}
</main>
