<script lang="ts">
	import { m } from "#lib/paraglide/messages.js";
	import { SEO } from "#sharing/atoms/seo/index.ts";
	import { WorkInProgress } from "#sharing/atoms/work-in-progress/index.ts";

	import "./story.css";
</script>

<SEO title={m["translation:story"]()} description={m["translation:story-page.description"]()} />

<!-- The finished page is <Timeline /> from #story/organisms/timeline/index.ts. -->
<section class="story">
	<WorkInProgress title={m["translation:story"]()} level={1} />
</section>
