<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";

	import config from "#config";
	import { m } from "#lib/paraglide/messages.js";

	import "./header.css";

	import { onMount } from "svelte";

	import { Lang } from "#sharing/atoms/lang/index.ts";
	import { Socials } from "#sharing/atoms/socials/index.ts";
	import { ThemeSwitch } from "#sharing/atoms/theme-switch/index.ts";

	const links = [
		{ content: m["translation:home"](), href: resolve("/") },
		{ content: m["translation:story"](), href: resolve("/story") },
		{ content: m["translation:blog"](), href: resolve("/blog") },
	];

	const isCurrent = (href: string) =>
		href === "/" ? page.url.pathname === "/" : page.url.pathname.startsWith(href);

	let menu = $state<HTMLElement>();

	/** Picking a link keeps the header mounted, so the phone menu closes itself here. */
	function closeMenu() {
		if (menu?.matches(":popover-open")) menu.hidePopover();
	}

	let scrambling = false;

	const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	async function scrambleLogo(event: Event) {
		if (scrambling || prefersReducedMotion()) return;

		const logo = event.currentTarget as HTMLElement;

		// Scrambled letters are wider, so hold the width or the icons beside it jitter.
		scrambling = true;
		logo.style.width = `${logo.getBoundingClientRect().width}px`;

		const { animate, scrambleText } = await import("animejs");

		animate(logo, {
			innerHTML: scrambleText({
				ease: "outExpo",
				override: false,
				revealRate: 15,
				revealDelay: 40,
			}),
			onComplete: () => {
				scrambling = false;
				logo.style.removeProperty("width");
			},
		});
	}

	onMount(async () => {
		// Only pointer devices show this hello: phones skip the download and the work.
		if (prefersReducedMotion() || !window.matchMedia("(hover: hover)").matches) return;

		const { animate, scrambleText } = await import("animejs");
		const logo = document.querySelector<HTMLElement>(".header__logo");
		const texts = document.querySelectorAll<HTMLElement>(".header__link");

		if (logo) {
			animate(logo, {
				innerHTML: scrambleText({
					ease: "outExpo",
					override: false,
					revealRate: 15,
					revealDelay: 100,
				}),
			});
		}

		for (const text of texts) {
			// Scrambled letters are wider, so hold the width or the links beside it jitter.
			text.style.width = `${text.getBoundingClientRect().width}px`;
			animate(text, {
				innerHTML: scrambleText({
					ease: "outExpo",
					override: false,
					revealRate: 15,
					revealDelay: 140,
				}),
				onComplete: () => text.style.removeProperty("width"),
			});
		}
	});
</script>

<header class="header">
	<div class="header__identity">
		<a
			href={resolve("/")}
			class="header__logo"
			onclick={closeMenu}
			onpointerenter={scrambleLogo}
			onfocus={scrambleLogo}
		>
			{config.brand}
		</a>
		<Socials variant="reveal" />
	</div>
	<nav class="header__nav" aria-label={m["translation:main-nav"]()}>
		<!-- Native popover: opens, closes and handles Escape with no JavaScript at all. -->
		<button
			type="button"
			class="header__burguer"
			aria-label={m["translation:menu"]()}
			popovertarget="header-menu"
		>
			<svg class="header__burguer-icon" viewBox="0 0 24 24" aria-hidden="true">
				<path class="header__burguer-open" d="M4 6h16M4 12h16M4 18h16" />
				<path class="header__burguer-close" d="M18 6 6 18M6 6l12 12" />
			</svg>
		</button>
		<div bind:this={menu} id="header-menu" class="header__menu" popover="auto">
			<ul class="header__list">
				{#each links as { href, content } (href)}
					<li class="header__item">
						<a
							{href}
							class="header__link"
							class:header__link--active={isCurrent(href)}
							aria-current={isCurrent(href) ? "page" : undefined}
							onclick={closeMenu}
						>
							{content}
						</a>
					</li>
				{/each}
			</ul>
			<address class="header__contact">
				<Socials variant="menu" />
				<a class="header__email" href="mailto:{config.email}">{config.email}</a>
			</address>
			<Lang />
		</div>
	</nav>
	<div class="header__actions">
		<ThemeSwitch />
		<Lang />
	</div>
</header>
