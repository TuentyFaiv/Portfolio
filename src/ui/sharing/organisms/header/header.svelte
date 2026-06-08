<script lang="ts">
	import { page } from "$app/state";
	import { m } from "$lib/paraglide/messages";
	import config from "~config";

	import "./header.css";

	import { onMount } from "svelte";
	import { MediaQuery } from "svelte/reactivity";
	import { animate, scrambleText } from "animejs";

	import { Lang } from "~sharing/atoms/lang";
	import { ThemeSwitch } from "~sharing/atoms/theme-switch";

	const desktop = new MediaQuery("(min-width: 640px)", false);

	let links = [
		{
			content: m["translation:home"](),
			href: "/",
		},
		{
			content: m["translation:story"](),
			href: "/story",
		},
		{
			content: m["translation:blog"](),
			href: "/blog",
		},
	];

	let open = $state(false);

	function toggle() {
		open = !open;
	}

	$effect(() => {
		if (desktop.current) open = false;
	});

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
	<a href="/" class="header__logo"> {config.brand} </a>
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
		</ul>
	</nav>
	<div class="header__actions">
		<ThemeSwitch />
		<Lang />
	</div>
</header>
