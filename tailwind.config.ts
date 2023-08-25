import { join } from "path";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import { skeleton } from '@skeletonlabs/tw-plugin';

import type { Config } from "tailwindcss";

import { theme } from "./tf.theme";

const config = {
	darkMode: "class",
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		join(require.resolve("@skeletonlabs/skeleton"), "../**/*.{html,js,svelte,ts}"),
	],
	theme: {
		extend: {},
	},
	plugins: [forms, typography, skeleton({
		themes: {
			preset: ["skeleton"],
			custom: [theme]
		}
	})],
} satisfies Config;

export default config;
