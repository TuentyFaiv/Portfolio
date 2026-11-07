/// <reference lib="webworker" />

import type { NebulaInput, NebulaSetup } from "./renderer.ts";

import { createNebula } from "./renderer.ts";

let nebula: ReturnType<typeof createNebula>;

self.onmessage = (
	event: MessageEvent<
		NebulaInput | { type: "start"; canvas: OffscreenCanvas; setup: NebulaSetup } | { type: "stop" }
	>
) => {
	const message = event.data;

	if (message.type === "start") {
		nebula = createNebula(message.canvas, message.setup, (output) => self.postMessage(output));
	} else if (message.type === "stop") {
		nebula?.stop();
		self.close();
	} else {
		nebula?.send(message);
	}
};
