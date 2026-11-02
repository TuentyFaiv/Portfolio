<script lang="ts">
	import type { Props } from "./socials.proptypes";

	import config from "#config";
	import { m } from "#lib/paraglide/messages.js";

	let { variant }: Props = $props();
</script>

<ul class="header__socials header__socials--{variant}" aria-label={m["translation:socials"]()}>
	{#each config.socials as { content, href, icon }, index}
		<li class="header__social" style:--index={index}>
			<a {href} class="header__social-link" target="_blank" rel="me noopener">
				<span class="sr-only">{content}</span>
				<svg class="header__social-icon" viewBox="0 0 24 24" aria-hidden="true">
					<path d={icon} />
				</svg>
			</a>
		</li>
	{/each}
</ul>
