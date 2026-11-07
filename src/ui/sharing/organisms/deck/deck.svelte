<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import { pad } from "#lib/shared/format.ts";
	import { scrambleTo } from "#lib/text/scramble.attach.ts";

	import "./deck.css";

	import type { Props } from "./deck.proptypes.ts";

	let { slides, children }: Props = $props();

	let first = $derived(slides[0]);
	let second = $derived(slides[1] ?? slides[0]);

	let tracked = $state<string>();
	let active = $derived(tracked ?? first.id);
	let index = $derived(slides.findIndex((slide) => slide.id === active));
	let last = $derived(index === slides.length - 1);
	let next = $derived(slides[index + 1] ?? slides[index]);

	function keepLinkedSlide() {
		const target = () => {
			const id = decodeURIComponent(window.location.hash.slice(1));

			return id ? document.getElementById(id) : null;
		};
		let moved = false;
		const onMove = () => (moved = true);
		const align = () => {
			const element = target();

			if (moved || !element) return;
			if (Math.abs(element.getBoundingClientRect().top) > 1)
				element.scrollIntoView({ behavior: "instant", block: "start" });
		};
		const settle = () => requestAnimationFrame(() => requestAnimationFrame(align));
		const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

		for (const name of events) window.addEventListener(name, onMove, { passive: true, once: true });
		if (document.readyState === "complete") settle();
		else window.addEventListener("load", settle, { once: true });

		return () => {
			for (const name of events) window.removeEventListener(name, onMove);
			window.removeEventListener("load", settle);
		};
	}

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

{@render children()}

<nav
	class="deck"
	aria-label={m["translation:deck.progress"]()}
	{@attach trackActive}
	{@attach keepLinkedSlide}
>
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
