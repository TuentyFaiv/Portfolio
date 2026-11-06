/*
 * Who found every star: when a visitor finds the last stray, the page sends a random id
 * for this browser (kept in its storage, never a cookie) to /api/stars, once. The id says
 * nothing about the visitor; it only lets the count hold each browser once.
 */

/** Where this browser keeps its finder id. */
export const FINDER = "tuentyfaiv:finder";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** A finder id is a random (version 4) UUID, as crypto.randomUUID() makes, in lower case. */
export const isFinderId = (value: unknown): value is string =>
	typeof value === "string" && UUID.test(value);
