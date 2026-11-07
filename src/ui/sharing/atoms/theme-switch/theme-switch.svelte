<script lang="ts">
	import { prefersReducedMotion } from "svelte/motion";
	import { mode, toggleMode } from "mode-watcher";

	import { m } from "#lib/paraglide/messages.js";

	import "./theme-switch.css";

	function themeApplied(root: HTMLElement, dark: boolean) {
		return new Promise<void>((resolve) => {
			if (root.classList.contains("dark") === dark) return resolve();

			const observer = new MutationObserver(() => {
				if (root.classList.contains("dark") !== dark) return;

				observer.disconnect();
				if (!document.querySelector(".nebula[data-ready]")) return resolve();
				document.addEventListener("nebula:drawn", () => resolve(), { once: true });
				window.setTimeout(resolve, 150);
			});

			observer.observe(root, { attributeFilter: ["class"] });
			window.setTimeout(() => {
				observer.disconnect();
				resolve();
			}, 300);
		});
	}

	function switchTheme(event: MouseEvent) {
		const root = document.documentElement;

		if (!document.startViewTransition || prefersReducedMotion.current) return toggleMode();

		const button = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const x = button.left + button.width / 2;
		const y = button.top + button.height / 2;
		const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
		const dark = !root.classList.contains("dark");

		root.classList.add("theme-transition");

		const transition = document.startViewTransition(() => {
			toggleMode();

			return themeApplied(root, dark);
		});

		transition.ready.then(() => {
			root.animate(
				{ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
				{
					duration: 650,
					easing: "cubic-bezier(0.22, 1, 0.36, 1)",
					pseudoElement: "::view-transition-new(root)",
				}
			);
		});
		transition.finished.finally(() => root.classList.remove("theme-transition"));
	}
</script>

<button
	type="button"
	class="themeswitch"
	onclick={switchTheme}
	role="switch"
	aria-label={m["translation:theme.change"]()}
	aria-checked={mode.current === "dark"}
>
	<svg class="themeswitch__icon themeswitch__icon--moon" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
	</svg>
	<svg class="themeswitch__icon themeswitch__icon--sun" viewBox="0 0 24 24" aria-hidden="true">
		<circle cx="12" cy="12" r="4" />
		<path
			d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
		/>
	</svg>
</button>
