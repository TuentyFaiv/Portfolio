/**
 * The route change crossfade in progress, if any. Heavy work that would land inside its
 * snapshot (like handing a canvas to a worker) waits for it to finish first.
 */
let current: Promise<unknown> = Promise.resolve();

export const routeTransition = {
	get finished() {
		return current;
	},
	set(finished: Promise<unknown>) {
		current = finished.catch(() => undefined);
	},
};
