import { get, writable } from "svelte/store";

export const messagesStore = writable([]);
export const uiErrorsStore = writable([]);

export function dumpStore() {
  return get(messagesStore);
}
