// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	// biome-ignore lint/style/noNamespace: App namespace is used by SvelteKit
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
