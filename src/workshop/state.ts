import { writable } from 'svelte/store';
export const presentationMode = writable(false);
export const presentationStep = writable(0);
export const requestModelLoad = writable(false);
export const modelLoadError = writable<string | null>(null);
