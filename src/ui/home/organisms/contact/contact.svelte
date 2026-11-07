<script lang="ts">
	import config from "#config";
	import { m } from "#lib/paraglide/messages.js";
	import { copyable } from "#lib/shared/copyable.attach.ts";
	import { Nebula } from "#sharing/atoms/nebula/index.ts";
	import { Slide } from "#sharing/molecules/slide/index.ts";

	import "./contact.css";

	let status = $state<"copied" | "failed">();
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(config.email);
			status = "copied";
		} catch {
			status = "failed";
		}

		clearTimeout(timer);
		timer = setTimeout(() => (status = undefined), 2400);
	}
</script>

<Slide id="contact" label={m["translation:deck.contact"]()}>
	<div class="contact">
		<div class="contact__band">
			<Nebula scene="band" />
		</div>

		<h2 class="contact__title">
			{m["translation:contact.title"]()}
			<span class="contact__punchline">{m["translation:contact.title-end"]()}</span>
		</h2>

		<p class="contact__lede">{m["translation:contact.lede"]()}</p>
		<p class="contact__availability">{m["translation:contact.availability"]()}</p>

		<address class="contact__email">
			<a class="contact__mail" href="mailto:{config.email}">{config.email}</a>
			<button
				class="contact__copy"
				type="button"
				hidden
				data-status={status}
				onclick={copy}
				{@attach copyable}
			>
				<span class="sr-only">{m["translation:contact.copy"]()}</span>
				<svg class="contact__icon contact__icon--copy" viewBox="0 0 24 24" aria-hidden="true">
					<rect x="8" y="8" width="13" height="13" rx="2" />
					<path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
				</svg>
				<svg class="contact__icon contact__icon--done" viewBox="0 0 24 24" aria-hidden="true">
					<path d="m5 12 5 5L20 7" />
				</svg>
			</button>
			<output class="contact__status" aria-live="polite" data-status={status}>
				{#if status === "copied"}
					{m["translation:contact.copied"]()}
				{:else if status === "failed"}
					{m["translation:contact.copy-failed"]()}
				{/if}
			</output>
		</address>

		<section class="elsewhere" aria-labelledby="elsewhere-title">
			<h3 id="elsewhere-title" class="elsewhere__title">{m["translation:contact.elsewhere"]()}</h3>
			<ul class="elsewhere__links">
				{#each config.socials as { content, handle, href, icon } (href)}
					<li>
						<a class="elsewhere__link" {href} target="_blank" rel="me noopener noreferrer">
							<svg class="elsewhere__icon" viewBox="0 0 24 24" aria-hidden="true">
								<path d={icon} />
							</svg>
							<span class="elsewhere__name">{content}</span>
							<span class="elsewhere__handle">{handle}</span>
							<svg class="elsewhere__arrow" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M7 17 17 7M8 7h9v9" />
							</svg>
						</a>
					</li>
				{/each}
			</ul>
			<p class="elsewhere__sign-off">{m["translation:contact.sign-off"]()}</p>
		</section>
	</div>
</Slide>
