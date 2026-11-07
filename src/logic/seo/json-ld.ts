// Escape "<" so values can't close the tag. Not in .svelte: this tag would end its script.
export function jsonLd(schema: Record<string, unknown>): string {
	const data = JSON.stringify({ "@context": "https://schema.org", ...schema }).replace(
		/</g,
		"\\u003c"
	);

	return `<script type="application/ld+json">${data}</script>`;
}
