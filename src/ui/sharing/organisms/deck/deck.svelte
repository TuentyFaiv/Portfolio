<script lang="ts">
	import { scrambleTo } from "#attach/scramble.ts";
	import { m } from "#lib/paraglide/messages.js";

	import "./deck.css";

	import type { Props } from "./deck.proptypes.ts";

	let { slides, children }: Props = $props();

	const pad = (value: number) => String(value).padStart(2, "0");
	let first = $derived(slides[0]);
	let second = $derived(slides[1] ?? slides[0]);

	// Empty until a slide crosses the middle of the screen: the first one is current until then.
	let tracked = $state<string>();
	let active = $derived(tracked ?? first.id);
	let index = $derived(slides.findIndex((slide) => slide.id === active));
	let last = $derived(index === slides.length - 1);
	// The last slide has no next one: its link fades out still showing the previous label.
	let next = $derived(slides[index + 1] ?? slides[index]);

	/** The slide crossing the middle of the screen is the current one, whatever its height. */
	function trackActive() {
		const observer = new IntersectionObserver(
			(entries) => {
				const current = entries.find((entry) => entry.isIntersecting);

				if (current) tracked = current.target.id;
			},
			{ rootMargin: "-50% 0px" }
		);

		for (const slide of document.querySelectorAll(".slide")) observer.observe(slide);

		return () => observer.disconnect();
	}
</script>

<!-- The slides and this nav are direct children of the layout's <main>. -->
{@render children()}

<nav class="deck" aria-label={m["translation:deck.progress"]()} {@attach trackActive}>
	<p class="deck__count">
		<span {@attach scrambleTo(pad(index + 1), "0-9")}>{pad(1)}</span>
		/ {pad(slides.length)}<span class="deck__name"
			>&nbsp; · &nbsp;<span {@attach scrambleTo(slides[index].label())}>{first.label()}</span></span
		>
	</p>

	<ol class="deck__progress">
		{#each slides as slide (slide.id)}
			<li>
				<a
					class="deck__tick"
					href="#{slide.id}"
					aria-current={active === slide.id ? "location" : undefined}
				>
					<span class="sr-only">{slide.label()}</span>
				</a>
			</li>
		{/each}
	</ol>

	<p class="deck__hint deck__hint--scroll" data-hidden={last}>
		<span class="deck__hint-text">{m["translation:deck.scroll-hint"]()}</span>
		<svg class="deck__chevron" viewBox="0 0 24 24" aria-hidden="true">
			<path d="m6 9 6 6 6-6" />
		</svg>
	</p>
	<!-- One spot on the right: the next slide, or the way back once there is no next one. -->
	<div class="deck__end">
		<p class="deck__hint deck__hint--swipe" data-hidden={last}>
			{m["translation:deck.swipe-hint"]()}
		</p>
		<a class="deck__next" href="#{next.id}" data-hidden={last}>
			{m["translation:deck.next"]()}&nbsp; · &nbsp;<span {@attach scrambleTo(next.label())}
				>{second.label()}</span
			>
		</a>
		<a class="deck__back" href="#{first.id}" data-hidden={!last}>
			{m["translation:deck.back-to-start"]()}
		</a>
	</div>
</nav>
