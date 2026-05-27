import { withThemeByClassName } from "@storybook/addon-themes";

import type { Preview } from "@storybook/sveltekit";

import "../src/ui/sharing/styles/app.css";

const preview: Preview = {
	parameters: {
		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: "todo",
		},
	},
	decorators: [
		withThemeByClassName({
			themes: {
				light: "",
				dark: "dark",
			},
			defaultTheme: "dark",
		}),
	],
};

export default preview;
