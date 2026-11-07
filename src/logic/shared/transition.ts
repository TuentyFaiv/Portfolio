let current: Promise<unknown> = Promise.resolve();

export const routeTransition = {
	get finished() {
		return current;
	},
	set(finished: Promise<unknown>) {
		current = finished.catch(() => undefined);
	},
};
