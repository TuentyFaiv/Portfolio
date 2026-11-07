<script lang="ts">
	import { prefersReducedMotion } from "svelte/motion";
	import { SvelteSet } from "svelte/reactivity";
	import { replaceState } from "$app/navigation";

	import config from "#config";
	import { Constellation } from "#home/molecules/constellation/index.ts";
	import { slides } from "#lib/content/slides.ts";
	import { m } from "#lib/paraglide/messages.js";
	import { assign, swirl } from "#lib/projects/birth.ts";
	import { starChart } from "#lib/projects/chart.attach.ts";
	import { features, links, project, STOPS, STRAYS, slots, strays } from "#lib/projects/data.ts";
	import { FINDER } from "#lib/projects/finder.ts";
	import { pad } from "#lib/shared/format.ts";
	import { quietly } from "#lib/shared/quietly.ts";
	import { Nebula } from "#sharing/atoms/nebula/index.ts";
	import { Slide } from "#sharing/molecules/slide/index.ts";

	import "./projects.css";

	import type { Attachment } from "svelte/attachments";

	const KEY = "tuentyfaiv:strays";
	const PLACE = "tuentyfaiv:stop";
	const github = config.socials.find(({ content }) => content === "GitHub");
	const number = pad(slides.findIndex(({ id }) => id === "projects") + 1);
	const total = pad(slots.length);
	const at = (id: (typeof links)[number][number]) =>
		id === "core"
			? { x: 50, y: 50 }
			: (features.find((feature) => feature.id === id) ?? { x: 50, y: 50 });
	const name = (stop: number) =>
		stop === 0
			? m["translation:projects.intro"]()
			: slots[stop - 1]?.lit
				? project.name
				: m["translation:projects.undiscovered"]();
	const stops = Array.from({ length: STOPS }, (_, stop) => stop);
	const points = slots.map(({ at }) => at);
	const sizes = slots.map(({ size }) => size);
	const lands = slots.map(({ shape }) => shape.stars[shape.land] ?? ([50, 50] as const));
	const departure = slots.at(-1)?.shape.stars.at(-1) ?? ([50, 50] as const);
	const hooks = features.find(({ id }) => id === "hooks");
	const arrival = [hooks?.x ?? 0, hooks?.y ?? 50] as const;
	const born = [
		...slots.map((_, index) => ({ kind: "constellation", index })),
		...strays.map((_, index) => ({ kind: "stray", index })),
	];
	const letters = [..."tuentyfaiv"].map((letter, index) => ({
		letter,
		heard: [1, 7, 8].includes(index),
	}));

	let current = $state(0);
	let farthest = $state(0);
	const atEnd = $derived(current === STOPS - 1);
	const found = new SvelteSet<number>();
	let toast = $state(false);
	let inView = false;

	let track = $state<HTMLElement>();
	let reveal = $state<HTMLDialogElement>();
	let toastTimer: ReturnType<typeof setTimeout> | undefined;
	let leaving = false;

	function go(stop: number) {
		if (!track || stop < 0 || stop >= STOPS) return;
		arrive(stop);
		track.scrollTo({
			left: stop * track.clientWidth,
			behavior: prefersReducedMotion.current ? "instant" : "smooth",
		});
	}

	function arrive(stop: number) {
		current = stop;
		farthest = Math.max(farthest, stop);
	}

	function loop() {
		track?.closest(".journey")?.dispatchEvent(new Event("chart:loop"));
	}

	function find(index: number) {
		if (found.has(index)) return;
		found.add(index);
		quietly(() => localStorage.setItem(KEY, JSON.stringify([...found])));
		if (found.size === STRAYS) {
			toast = false;
			counted();
			open();
			return;
		}
		toast = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast = false), 2600);
	}

	function counted() {
		const id = quietly(() => localStorage.getItem(FINDER)) ?? crypto.randomUUID();

		quietly(() => localStorage.setItem(FINDER, id));

		fetch("/api/stars", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ id }),
			keepalive: true,
		}).catch(() => undefined);
	}

	const dismiss: Attachment<HTMLDialogElement> = (dialog) => {
		const onClick = (event: MouseEvent) => {
			if (event.target === dialog) close();
		};
		const onCancel = (event: Event) => {
			event.preventDefault();
			close();
		};

		dialog.addEventListener("click", onClick);
		dialog.addEventListener("cancel", onCancel);

		return () => {
			dialog.removeEventListener("click", onClick);
			dialog.removeEventListener("cancel", onCancel);
		};
	};

	const glide = "cubic-bezier(0.45, 0, 0.2, 1)";
	const ease = "cubic-bezier(0.2, 0.8, 0.2, 1)";
	const px = ([x, y]: [number, number]) => `${x}px ${y}px`;

	function home(kind: string | undefined, index: number): [number, number] {
		if (kind === "constellation") {
			const rect = document
				.querySelector(`.chart__place[data-place='${index}']`)
				?.getBoundingClientRect();

			if (rect && rect.width > 0) return [rect.left + rect.width / 2, rect.top + rect.height / 2];
		}

		const [stop = 0, x = 50, y = 50] = strays[index] ?? [];
		const box = track?.getBoundingClientRect();
		const width = track?.clientWidth ?? window.innerWidth;

		return [
			(box?.left ?? 0) + stop * width - (track?.scrollLeft ?? 0) + (x / 100) * width,
			(box?.top ?? 0) + (y / 100) * (box?.height ?? window.innerHeight),
		];
	}

	function onTheName(reveal: HTMLDialogElement) {
		const letters = [...reveal.querySelectorAll<HTMLElement>(".emblem__letter")];

		return assign(
			letters.map((letter) => {
				const { left, top, width, height } = letter.getBoundingClientRect();

				return {
					box: { x: left, y: top, w: width, h: height },
					heard: letter.dataset.heard !== undefined,
				};
			}),
			slots.length,
			STRAYS
		);
	}

	function fadePage(to: 0 | 1, duration: number) {
		const parts = document.querySelectorAll<HTMLElement>(
			".header, .deck, .chart, .journey__track, .track"
		);

		for (const part of parts)
			part.animate({ opacity: to === 0 ? [1, 0] : [0, 1] }, { duration, easing: ease });
		document
			.querySelector(".journey__sky")
			?.animate(
				{ opacity: to === 0 ? [1, 0] : [0, 1] },
				{ duration, easing: ease, pseudoElement: "::after" }
			);
	}

	function open() {
		if (!reveal) return;
		reveal.showModal();
		if (prefersReducedMotion.current) return;

		const name = reveal.querySelector(".emblem__name")?.getBoundingClientRect();
		const letters = [...reveal.querySelectorAll<HTMLElement>(".emblem__letter")];

		if (!name || letters.length === 0) return;

		const core: [number, number] = [name.left + name.width / 2, name.top + name.height / 2];
		const targets = onTheName(reveal);
		const birth = 3200;

		fadePage(0, 700);

		reveal.querySelectorAll<HTMLElement>(".birth__star").forEach((star, order) => {
			const kind = star.dataset.kind;
			const index = Number(star.dataset.index);
			const start = home(kind, index);
			const circling = swirl(core, order, born.length, Math.min(name.width * 0.35, 220));
			const landing =
				(kind === "constellation" ? targets.constellations : targets.strays)[index] ?? core;

			// Easing per keyframe with linear overall timing, or the offsets drift.
			star.animate(
				[
					{ translate: px(start), opacity: 0, scale: 0.6, easing: ease },
					{ translate: px(start), opacity: 1, scale: 1, offset: 0.03, easing: glide },
					{ translate: px(circling), opacity: 1, scale: 1, offset: 0.4, easing: glide },
					{ translate: px(core), opacity: 1, scale: 1.8, offset: 0.52, easing: glide },
					{ translate: px(landing), opacity: 1, scale: 1, offset: 0.74, easing: ease },
					{ translate: px(landing), opacity: 0, scale: 0 },
				],
				{ duration: birth, delay: order * 18, fill: "both" }
			);
		});
		reveal.querySelector(".emblem__bloom")?.animate(
			[
				{ opacity: 0, scale: 0.15, easing: ease },
				{ opacity: 0.6, scale: 0.4, offset: 0.4, easing: glide },
				{ opacity: 1, scale: 1.3, offset: 0.56, easing: ease },
				{ opacity: 1, scale: 1 },
			],
			{ duration: birth, fill: "backwards" }
		);
		// No filter on the letters: a blur redrawn every frame at this size stutters.
		letters.forEach((letter, index) => {
			const order = letter.dataset.heard === undefined ? index : 10 + index;

			letter.animate(
				{ opacity: [0, 1], translate: ["0 0.12em", "0 0"], scale: [0.9, 1] },
				{ duration: 700, delay: birth * 0.76 + order * 40, easing: ease, fill: "backwards" }
			);
		});
		reveal
			.querySelector(".emblem__glow")
			?.animate(
				{ opacity: [0, 1] },
				{ duration: 900, delay: birth * 0.86, easing: ease, fill: "backwards" }
			);
		for (const part of reveal.querySelectorAll(".emblem__said, .reveal__words > *"))
			part.animate(
				{ opacity: [0, 1], translate: ["0 0.5rem", "0 0"] },
				{ duration: 600, delay: birth * 1.02, easing: ease, fill: "backwards" }
			);
	}

	function close() {
		if (!reveal?.open || leaving) return;
		if (prefersReducedMotion.current) {
			reveal.close();
			return;
		}

		const dialog = reveal;
		const targets = onTheName(dialog);
		const journey = 1600;

		leaving = true;
		dialog.dataset.leaving = "";
		fadePage(1, 900);

		for (const part of dialog.querySelectorAll(
			".emblem__name, .emblem__glow, .emblem__said, .reveal__words, .emblem__bloom"
		))
			part.animate(
				{ opacity: [1, 0], scale: [1, 1.04] },
				{ duration: 450, easing: ease, fill: "forwards" }
			);

		const flights = [...dialog.querySelectorAll<HTMLElement>(".birth__star")].map((star, order) => {
			const kind = star.dataset.kind;
			const index = Number(star.dataset.index);
			const start = (kind === "constellation" ? targets.constellations : targets.strays)[index] ?? [
				0, 0,
			];

			return star.animate(
				[
					{ translate: px(start), opacity: 0, scale: 0.4, easing: ease },
					{ translate: px(start), opacity: 1, scale: 1.4, offset: 0.15, easing: glide },
					{ translate: px(home(kind, index)), opacity: 1, scale: 1, offset: 0.85, easing: ease },
					{ translate: px(home(kind, index)), opacity: 0, scale: 0.4 },
				],
				{ duration: journey, delay: order * 14, fill: "both" }
			).finished;
		});

		Promise.allSettled(flights).then(() => {
			for (const animation of dialog.getAnimations({ subtree: true })) animation.cancel();
			delete dialog.dataset.leaving;
			leaving = false;
			dialog.close();
		});
	}

	function onKey(event: KeyboardEvent) {
		const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
		const target = event.target as HTMLElement | null;

		if (!step || !inView || reveal?.open || event.defaultPrevented) return;
		if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
		if (target?.closest("input, textarea, select, [contenteditable]")) return;
		event.preventDefault();
		if (step === 1 && atEnd) loop();
		else go(current + step);
	}

	const watch: Attachment<HTMLElement> = (element) => {
		const saved = quietly(() => JSON.parse(localStorage.getItem(KEY) ?? "[]") as unknown);

		if (Array.isArray(saved))
			for (const index of saved)
				if (Number.isInteger(index) && index >= 0 && index < STRAYS) found.add(index);

		const observer = new IntersectionObserver(
			([entry]) => {
				inView = entry?.isIntersecting ?? false;
			},
			{ threshold: 0.6 }
		);

		const onClick = (event: MouseEvent) => {
			const hit = (event.target as Element).closest<SVGElement>("[data-stray]");

			if (hit) find(Number(hit.dataset.stray));
		};

		observer.observe(element);
		element.addEventListener("click", onClick);

		return () => {
			observer.disconnect();
			element.removeEventListener("click", onClick);
			clearTimeout(toastTimer);
		};
	};

	function remembered(): number {
		const id = new URLSearchParams(window.location.search).get("project");
		const linked = slots.findIndex((slot) => slot.id === id);

		if (linked >= 0) return linked + 1;

		const stop = Number(quietly(() => sessionStorage.getItem(PLACE)));

		return Number.isInteger(stop) && stop > 0 && stop < STOPS ? stop : 0;
	}

	function remember(stop: number) {
		quietly(() => sessionStorage.setItem(PLACE, String(stop)));

		const url = new URL(window.location.href);
		const id = slots[stop - 1]?.id;

		if (id) {
			url.searchParams.set("project", id);
			url.hash = "projects";
		} else url.searchParams.delete("project");
		if (url.href === window.location.href) return;
		quietly(() => replaceState(`${url.pathname}${url.search}${url.hash}`, {}));
	}

	const follow: Attachment<HTMLElement> = (element) => {
		let settle: ReturnType<typeof setTimeout> | undefined;
		const onScroll = () => {
			const stop = Math.round(element.scrollLeft / Math.max(element.clientWidth, 1));

			arrive(Math.min(Math.max(stop, 0), STOPS - 1));
			clearTimeout(settle);
			settle = setTimeout(() => remember(current), 250);
		};
		const start = remembered();

		if (start > 0)
			requestAnimationFrame(() => {
				element.scrollTo({ left: start * element.clientWidth, behavior: "instant" });
				arrive(start);
			});

		element.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			clearTimeout(settle);
			element.removeEventListener("scroll", onScroll);
		};
	};
</script>

<svelte:window onkeydown={onKey} />

<Slide id="projects" label={m["translation:deck.projects"]()}>
	<div
		class="journey"
		data-stop={current}
		data-nebula-pan
		{@attach watch}
		{@attach starChart(points, sizes, lands, departure, arrival)}
	>
		<div class="journey__sky">
			<Nebula scene="slide" />
		</div>

		<div class="chart" data-chart aria-hidden="true">
			<svg class="chart__route" data-route preserveAspectRatio="none" aria-hidden="true">
				{#snippet trail(data: Record<string, string | number>)}
					<path
						class="chart__trail"
						pathLength="1"
						stroke-dasharray="1 1"
						stroke-dashoffset="1"
						{...data}
					/>
				{/snippet}
				{#each slots.slice(1) as slot, leg (slot.id)}
					<path class="chart__road" data-road />
					{@render trail({ "data-trail": leg })}
				{/each}
				<path
					class="chart__road chart__road--home"
					pathLength="1"
					stroke-dasharray="0.012 0.014"
					data-home-road
				/>
				{@render trail({ "data-home-trail": "" })}
			</svg>

			{#each slots as slot, index (slot.id)}
				<div
					class="chart__place"
					data-place={index}
					data-lit={slot.lit || undefined}
					data-passed={farthest > index || undefined}
				>
					{#if slot.lit}
						<div class="constellation">
							<svg
								class="constellation__links"
								viewBox="0 0 100 100"
								preserveAspectRatio="none"
								aria-hidden="true"
							>
								{#each links as [from, to] (`${from}-${to}`)}
									{@const a = at(from)}
									{@const b = at(to)}
									<line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
								{/each}
								<g class="constellation__sparks">
									{#each links as [from, to] (`${from}-${to}`)}
										{@const a = at(from)}
										{@const b = at(to)}
										<line
											class="constellation-shape__spark"
											x1={a.x}
											y1={a.y}
											x2={b.x}
											y2={b.y}
											pathLength="1"
										/>
									{/each}
								</g>
							</svg>

							<p class="constellation__core">
								<span class="constellation__core-name">native fetch</span>
								<span class="constellation__core-note"
									>{m["translation:projects.core-note"]()}</span
								>
							</p>

							<!-- Placed in projects.css: the CSP blocks style attributes. -->
							<ul class="constellation__features">
								{#each features as { id, label, side } (id)}
									<li class="constellation__feature" data-feature={id} data-side={side}>
										{label()}
									</li>
								{/each}
							</ul>
						</div>
					{:else}
						<Constellation shape={slot.shape} />
					{/if}
					<p class="chart__label">
						{pad(index + 1)}
						{#if slot.lit}
							&nbsp;{project.name}
						{/if}
					</p>
				</div>
			{/each}
		</div>

		<div class="journey__track" data-chart-track bind:this={track} {@attach follow}>
			{#each stops as stop (stop)}
				{@const slot = slots[stop - 1]}
				<div class="stop" data-index={stop}>
					{#if stop === 0}
						<hgroup class="journey__intro">
							<p class="journey__eyebrow">
								{number}
								· {m["translation:projects.surface-eyebrow"]()}
							</p>
							<h2 class="journey__title">
								{m["translation:projects.surface-title"]()}
							</h2>
							<p class="journey__lede">{m["translation:projects.surface-lede"]()}</p>
						</hgroup>

						<div class="journey__area" data-area aria-hidden="true"></div>
					{:else if slot}
						<article class="project">
							<div class="project__text">
								<p class="project__crumbs">
									{m["translation:deck.projects"]()}
									<span aria-hidden="true">/</span>
									{m["translation:projects.step"]({ number: pad(stop), total })}
								</p>

								<h3 class="project__name">{name(stop)}</h3>

								{#if slot.lit}
									<p class="project__lede">{m["translation:projects.lede"]()}</p>

									<ul class="project__tools" aria-label={m["translation:projects.built-with"]()}>
										{#each project.tools as tool (tool)}
											<li class="project__tool">{tool}</li>
										{/each}
									</ul>

									<dl class="project__facts">
										<div class="project__fact">
											<dt>{m["translation:projects.role-label"]()}</dt>
											<dd>{m["translation:projects.role"]()}</dd>
										</div>
										<div class="project__fact">
											<dt>{m["translation:projects.since-label"]()}</dt>
											<dd>{project.since}</dd>
										</div>
										<div class="project__fact">
											<dt>{m["translation:projects.latest-label"]()}</dt>
											<dd>{m["translation:projects.latest"]({ version: project.version })}</dd>
										</div>
									</dl>

									<footer class="project__actions">
										<a
											class="project__action project__action--primary"
											href={project.href}
											target="_blank"
											rel="noopener noreferrer"
										>
											{m["translation:projects.open"]()}
											<svg
												class="project__icon project__icon--stroke"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<path d="M7 17 17 7M8 7h9v9" />
											</svg>
										</a>
										<a
											class="project__action project__action--ghost"
											href={project.source}
											target="_blank"
											rel="noopener noreferrer"
										>
											{m["translation:projects.source"]()}
											{#if github}
												<svg class="project__icon" viewBox="0 0 24 24" aria-hidden="true">
													<path d={github.icon} />
												</svg>
											{/if}
										</a>
									</footer>
								{:else}
									<p class="project__lede">{m["translation:projects.undiscovered-lede"]()}</p>
								{/if}
							</div>

							{#if slot.lit}
								<figure class="project__focus" data-focus aria-labelledby="constellation-title">
									<figcaption id="constellation-title" class="sr-only">
										{m["translation:projects.features"]()}
									</figcaption>
									<p class="sr-only">native fetch, {m["translation:projects.core-note"]()}</p>
									<ul class="sr-only">
										{#each features as { id, label } (id)}
											<li>{label()}</li>
										{/each}
									</ul>
								</figure>
							{:else}
								<div class="project__focus" data-focus aria-hidden="true"></div>
							{/if}
						</article>
					{/if}

					<svg class="strays" aria-hidden="true">
						{#each strays as [where, x, y], index (index)}
							{#if where === stop}
								<g class="strays__stray" data-found={found.has(index) || undefined}>
									<circle class="strays__speck" cx="{x}%" cy="{y}%" r="2.5" />
									<circle class="strays__hit" cx="{x}%" cy="{y}%" r="14" data-stray={index} />
								</g>
							{/if}
						{/each}
					</svg>
				</div>
			{/each}
		</div>

		<p class="journey__found sr-only" aria-live="polite">
			{found.size > 0 ? m["translation:projects.found"]({ count: pad(found.size) }) : ""}
		</p>

		<p class="journey__toast" data-hidden={!toast || undefined} aria-hidden="true">
			<span class="journey__toast-title">{m["translation:projects.found-one"]()}</span>
			{m["translation:projects.found-hint"]()}
		</p>

		<fieldset class="track">
			<legend class="sr-only">{m["translation:projects.constellations"]()}</legend>
			<button
				class="track__arrow"
				type="button"
				title="{m["translation:projects.previous"]()} (←)"
				aria-keyshortcuts="ArrowLeft"
				aria-disabled={current === 0 || undefined}
				onclick={() => go(current - 1)}
			>
				<svg class="journey__icon" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M19 12H5M11 6l-6 6 6 6" />
				</svg>
				<span class="sr-only">{m["translation:projects.previous"]()}</span>
			</button>

			<p class="track__plate" aria-hidden="true">
				{#key current}
					<span class="track__plate-text">
						<span class="track__num">{pad(current)}</span>
						<span class="track__name">{name(current)}</span>
					</span>
				{/key}
			</p>

			<div class="track__middle">
				<ol class="track__stops">
					{#each stops as stop (stop)}
						<li class="track__leg" data-passed={stop <= current || undefined}>
							<button
								class="track__stop"
								type="button"
								data-kind={stop === 0 ? "intro" : slots[stop - 1]?.lit ? "lit" : "undiscovered"}
								aria-current={current === stop ? "step" : undefined}
								onclick={() => go(stop)}
							>
								<span class="sr-only">{pad(stop)} {name(stop)}</span>
							</button>
						</li>
					{/each}
				</ol>
				<p class="track__swipe" aria-hidden="true">{m["translation:projects.swipe"]()} ← →</p>
			</div>

			<button
				class="track__arrow"
				type="button"
				title="{atEnd
					? m["translation:projects.back-to-start"]()
					: m["translation:projects.next"]()} (→)"
				aria-keyshortcuts="ArrowRight"
				data-home={atEnd || undefined}
				onclick={() => (atEnd ? loop() : go(current + 1))}
			>
				<svg class="journey__icon" viewBox="0 0 24 24" aria-hidden="true">
					{#if atEnd}
						<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" />
					{:else}
						<path d="M5 12h14M13 6l6 6-6 6" />
					{/if}
				</svg>
				<span class="sr-only">
					{atEnd ? m["translation:projects.back-to-start"]() : m["translation:projects.next"]()}
				</span>
			</button>

			{#snippet starIcon()}
				<svg class="track__star" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
				</svg>
			{/snippet}
			{#if found.size > 0}
				<span class="track__stars">
					{#if found.size === STRAYS}
						<button
							class="track__count"
							type="button"
							title={m["translation:projects.see-chart"]()}
							onclick={open}
						>
							{@render starIcon()}
							<span aria-hidden="true">{pad(found.size)}</span>
							<span class="sr-only">{m["translation:projects.see-chart"]()}</span>
						</button>
					{:else}
						<span class="track__count" aria-hidden="true">
							{@render starIcon()}
							{pad(found.size)}
						</span>
					{/if}
				</span>
			{/if}
		</fieldset>

		<dialog class="reveal" bind:this={reveal} aria-labelledby="reveal-title" {@attach dismiss}>
			<button class="reveal__close" type="button" onclick={close}>
				<svg class="journey__icon" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M6 6l12 12M18 6 6 18" />
				</svg>
				<span class="sr-only">{m["translation:projects.close"]()}</span>
			</button>

			<div class="emblem" aria-hidden="true">
				<div class="emblem__bloom"></div>
				<p class="emblem__name">
					{#each letters as { letter, heard }, index (index)}
						<span class="emblem__letter" data-heard={heard || undefined}>{letter}</span>
					{/each}
				</p>
				<p class="emblem__glow">
					{#each letters as { letter, heard }, index (index)}
						<span class="emblem__letter-glow" data-heard={heard || undefined}>{letter}</span>
					{/each}
				</p>
				<p class="emblem__said">{m["translation:projects.said-aloud"]()}</p>
			</div>

			<div class="reveal__words">
				<h2 id="reveal-title" class="reveal__title">
					{m["translation:projects.reveal-title"]()}
					<span class="reveal__punchline">{m["translation:projects.reveal-title-end"]()}</span>
				</h2>
				<p class="reveal__body">{m["translation:projects.reveal-body"]()}</p>
				<p class="reveal__found">{m["translation:projects.reveal-found"]()}</p>
			</div>

			<div class="birth" aria-hidden="true">
				{#each born as { kind, index }, order (order)}
					<span class="birth__star" data-kind={kind} data-index={index}></span>
				{/each}
			</div>
		</dialog>
	</div>
</Slide>
