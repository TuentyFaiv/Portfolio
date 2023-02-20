import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import vue from "@astrojs/vue";
import vercel from "@astrojs/vercel/serverless";
import lit from "@astrojs/lit";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), svelte(), vue(), lit()],
  output: "server",
  adapter: vercel({
    analytics: true
  })
});