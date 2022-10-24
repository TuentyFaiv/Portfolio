import { defineConfig } from 'astro/config';

import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import lit from "@astrojs/lit";
import vue from "@astrojs/vue";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  integrations: [react(), svelte(), lit(), vue()],
  // output: "server",
  // adapter: vercel()
});