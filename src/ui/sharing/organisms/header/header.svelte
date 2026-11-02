<script lang="ts">
	import { page } from "$app/state";

	import config from "#config";
	import { m } from "#lib/paraglide/messages.js";

	import "./header.css";

	import { onMount } from "svelte";
	import { MediaQuery } from "svelte/reactivity";
	import { animate, scrambleText } from "animejs";

	import { Lang } from "#sharing/atoms/lang/index.ts";
	import { Socials } from "#sharing/atoms/socials/index.ts";
	import { ThemeSwitch } from "#sharing/atoms/theme-switch/index.ts";

	const desktop = new MediaQuery("(min-width: 640px)", false);

	let links = [];
	// let links = [
	// 	{
	// 		content: m["translation:home"](),
	// 		href: "/",
	// 	},
	// 	{
	// 		content: m["translation:story"](),
	// 		href: "/story",
	// 	},
	// 	{
	// 		content: m["translation:blog"](),
	// 		href: "/blog",
	// 	},
	// ];

	let open = $state(false);

	function toggle() {
		open = !open;
	}

	$effect(() => {
		if (desktop.current) open = false;
	});

	let scrambling = false;

	function scrambleLogo(event: Event) {
		if (scrambling) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const logo = event.currentTarget as HTMLElement;

		// Scrambled letters are wider, so hold the width or the icons beside it jitter.
		scrambling = true;
		logo.style.width = `${logo.offsetWidth}px`;
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

	onMount(() => {
		const links = document.querySelectorAll(".header__link-text");

		const logo = document.querySelector(".header__logo");

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

		for (const link of links) {
			animate(link, {
				innerHTML: scrambleText({
					ease: "outExpo",
					override: false,
					revealRate: 15,
					revealDelay: 140,
				}),
			});
		}
	});
</script>

<header class="header">
	<div class="header__brand">
		<div class="header__identity">
			<a href="/" class="header__logo" onpointerenter={scrambleLogo} onfocus={scrambleLogo}>
				{config.brand}
			</a>
			<Socials variant="reveal" />
		</div>
	</div>
	<nav class="header__nav">
		{#if !desktop.current}
			<button
				type="button"
				class="header__burguer"
				aria-label={m["translation:menu"]()}
				onclick={toggle}
				data-active={open}
			>
				<span></span>
			</button>
		{/if}
		<ul class="header__list" data-active={open} inert={!open && !desktop.current}>
			{#each links as { href, content }}
				<li class="header__item">
					<a {href} class="header__link" class:header__link--active={href === page.url.pathname}>
						<span class="header__link-text"> {content} </span>
					</a>
				</li>
			{/each}
			<li class="header__item header__item--socials">
				<Socials variant="menu" />
			</li>
		</ul>
	</nav>
	<div class="header__actions">
		<ThemeSwitch />
		<Lang />
	</div>
</header>
