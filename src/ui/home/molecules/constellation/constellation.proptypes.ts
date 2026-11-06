import type { Shape } from "#utils/projects.ts";

export interface Props {
	shape: Shape;
	/** Lit: a project you can visit. Otherwise undiscovered: hollow stars, faint lines. */
	lit?: boolean;
	class?: string;
}
