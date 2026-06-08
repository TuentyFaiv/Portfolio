<script lang="ts">
	import { getLocale, setLocale } from "$lib/paraglide/runtime";
	import "./lang.css";

	import EnIcon from "./en.svelte";
	import EsIcon from "./es.svelte";
</script>

<select
	id="language"
	class="select language "
	bind:value={() => getLocale(), (value) => setLocale(value)}
>
	<!-- biome-ignore lint/a11y/useButtonType: Custom select -->
	<button>
		<selectedcontent></selectedcontent>
	</button>
	<option value="en">
		<span>
			<EnIcon />
		</span>
	</option>
	<option value="es">
		<span>
			<EsIcon />
		</span>
	</option>
</select>
