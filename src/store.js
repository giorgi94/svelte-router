import {
    writable
} from "svelte/store";



export const location = writable(undefined);
export const activeRoute = writable(null);