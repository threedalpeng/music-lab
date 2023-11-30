import { browser } from '$app/environment';
import { readable } from 'svelte/store';

export const audioCtx = readable(browser ? new AudioContext() : null);
