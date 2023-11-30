import { browser } from '$app/environment';
import { onDestroy, onMount, setContext } from 'svelte';
import { get } from 'svelte/store';
import { audioCtx } from '../store/audio-context';
import { Synthesizer } from './synthesizer';

export const setSynthesizerContext = () => {
	const context = setContext('synthesizer', new Synthesizer());
	if (browser) {
		const ctx = get(audioCtx);
		onMount(() => {
			if (ctx !== null) {
				context.init(ctx);
			}
		});
		onDestroy(() => {
			if (ctx) {
				context.quit();
			}
		});
	}
	return context;
};
