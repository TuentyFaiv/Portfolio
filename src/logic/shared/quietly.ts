export function quietly<Result>(run: () => Result): Result | undefined {
	try {
		return run();
	} catch {
		return undefined;
	}
}
