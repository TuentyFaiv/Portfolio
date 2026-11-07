import { m } from "#lib/paraglide/messages.js";

const tools = {
	interface: ["Svelte", "SvelteKit", "Astro", "Tailwind CSS"],
	languages: ["TypeScript", "JavaScript", "Rust", "HTML & CSS"],
	backend: ["Actix Web", "Supabase"],
	"also-shipped": ["React", "React Router", "Next.js", "React Native"],
	quality: ["Vitest", "Playwright", "Storybook"],
	ship: ["Cloudflare", "AWS", "Vercel", "GitHub Actions"],
} as const;

export const layers = (Object.keys(tools) as (keyof typeof tools)[]).map((id) => ({
	id,
	label: m[`translation:stack.${id}`],
	tools: tools[id],
	used: m[`translation:stack.${id}-used`],
}));
