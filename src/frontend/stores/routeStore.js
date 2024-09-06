import { writable } from 'svelte/store';

export const currentRoute = writable(window.location.pathname);

export function updateCurrentRoute() {
    currentRoute.set(window.location.pathname);
}
