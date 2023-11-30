<script lang="ts">
	import { browser } from '$app/environment';
	import { drumkits } from '$lib/audio/drumkits/sounds';
	import { audioCtx } from '$lib/audio/store/audio-context';
	// import { Synthesizer } from '$lib/audio/synthesizer/synthesizer';
	import Visualizer from '$lib/audio/waveform/Visualizer.svelte';
	import { onMount } from 'svelte';
	import { Icon, Play } from 'svelte-hero-icons';

	let analyser: AnalyserNode;

	if (browser && $audioCtx !== null) {
		const ctx = $audioCtx;

		analyser = $drumkits?.hihat.analyser!;
	}
</script>

<article class="prose">
	<h1>Waveform Visualizer</h1>

</article>
