// content-length can be missing (streamed body), so the read itself enforces the limit.
export async function readUpTo(request: Request, max: number): Promise<string | null> {
	const reader = request.body?.getReader();

	if (!reader) return "";

	const bytes = new Uint8Array(max);
	let size = 0;

	for (;;) {
		const { done, value } = await reader.read();

		if (done) break;
		if (size + value.byteLength > max) {
			await reader.cancel();
			return null;
		}
		bytes.set(value, size);
		size += value.byteLength;
	}

	return new TextDecoder().decode(bytes.subarray(0, size));
}
