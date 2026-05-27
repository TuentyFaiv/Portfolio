<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";

	import { ThemeSwitch } from "~sharing/atoms/theme-switch";

	const { Story } = defineMeta({
		title: "Components/ThemeSwitch",
		component: ThemeSwitch,
		tags: ["autodocs"],
		argTypes: {},
		args: {},
	});
</script>

<Story name="Dark" />
