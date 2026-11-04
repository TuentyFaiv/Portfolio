import { m } from "#lib/paraglide/messages.js";

/*
 * Top to bottom: from what people see to how it ships. Tool names are proper nouns and
 * stay as they are in every language. "Used in" names public projects only; private and
 * client work is described by its kind, never by name.
 */
export const layers = [
	{
		id: "interface",
		label: m["translation:stack.interface"],
		tools: ["Svelte", "SvelteKit", "Astro", "Tailwind CSS"],
		used: m["translation:stack.interface-used"],
	},
	{
		id: "languages",
		label: m["translation:stack.languages"],
		tools: ["TypeScript", "JavaScript", "Rust", "HTML & CSS"],
		used: m["translation:stack.languages-used"],
	},
	{
		id: "backend",
		label: m["translation:stack.backend"],
		tools: ["Actix Web", "Supabase"],
		used: m["translation:stack.backend-used"],
	},
	{
		id: "also-shipped",
		label: m["translation:stack.also-shipped"],
		tools: ["React", "React Router", "Next.js", "React Native"],
		used: m["translation:stack.also-shipped-used"],
	},
	{
		id: "quality",
		label: m["translation:stack.quality"],
		tools: ["Vitest", "Playwright", "Storybook"],
		used: m["translation:stack.quality-used"],
	},
	{
		id: "ship",
		label: m["translation:stack.ship"],
		tools: ["Cloudflare", "AWS", "Vercel", "GitHub Actions"],
		used: m["translation:stack.ship-used"],
	},
] as const;
