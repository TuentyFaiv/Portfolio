import { defineConfig } from 'astro/config';

import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import vue from "@astrojs/vue";

import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  integrations: [react(), svelte(), vue()],
  output: "server",
  adapter: vercel({
    analytics: true
  })
});