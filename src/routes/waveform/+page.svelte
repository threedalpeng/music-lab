<script lang="ts">
	import { audioCtx } from '$lib/audio/store/audio-context';
	import { Icon, Play } from 'svelte-hero-icons';
	import Visualizer from '$lib/audio/waveform/Visualizer.svelte';
	import { onMount } from 'svelte';
	import WaveformBuilder from '$lib/audio/waveform/waveform-builder';
	import { PITCH } from '$lib/audio/models/pitches';
	
	let audioRef: HTMLAudioElement;
	let analyser: AnalyserNode;

	const sine = WaveformBuilder.sine(PITCH.A4, 0.5, 2);
	let sineAnalyser: AnalyserNode;

	const triangle = WaveformBuilder.triangle(PITCH.A4, 0.5, 2);
	let triangleAnalyser: AnalyserNode;

	const saw = WaveformBuilder.saw(PITCH.A4, 0.5, 2);
	let sawAnalyser: AnalyserNode;

	const square = WaveformBuilder.square(PITCH.A4, 0.5, 2);
	let squareAnalyser: AnalyserNode;

	const waveformRecord: Record<
		string,
		{
			waveform: Float32Array | null;
			source: AudioBufferSourceNode | null;
			analyser: AnalyserNode | null;
			play: () => void;
		}
	> = {};

	function createAnalysingWaveformSource(ctx: AudioContext, name: string, waveform: Float32Array) {
		if (waveform == null) return;
		const buffer = ctx.createBuffer(1, waveform.length, ctx.sampleRate);
		buffer.copyToChannel(waveform, 0);
		const source = ctx.createBufferSource();
		const gain = ctx.createGain();
		const analyser = ctx.createAnalyser();
		source.buffer = buffer;
		source.connect(gain);
		gain.connect(analyser);
		analyser.connect(ctx.destination);
		source.loop = true;

		let playing = false;

		const data = {
			waveform,
			source,
			analyser,
			play: () => {
				if (!playing) {
					source.start();
					playing = true;
				}
				const now = gain.context.currentTime;
				gain.gain.setTargetAtTime(1, now, 0.02);
				gain.gain.setTargetAtTime(0, now + 2, 0.02);
			}
		};

		waveformRecord[name] = data;
	}

	onMount(async () => {
		const ctx = $audioCtx;
		if (ctx === null) {
			return;
		}
		ctx.resume();

		createAnalysingWaveformSource(ctx, 'sine', sine!);
		sineAnalyser = waveformRecord['sine'].analyser!;
		createAnalysingWaveformSource(ctx, 'triangle', triangle!);
		triangleAnalyser = waveformRecord['triangle'].analyser!;
		createAnalysingWaveformSource(ctx, 'saw', saw!);
		sawAnalyser = waveformRecord['saw'].analyser!;
		createAnalysingWaveformSource(ctx, 'square', square!);
		squareAnalyser = waveformRecord['square'].analyser!;

		
		const meSrc = ctx.createMediaElementSource(audioRef);
		analyser = ctx.createAnalyser();
		meSrc.connect(analyser);
		analyser.connect(ctx.destination);
	});

	let currentBuffer: AudioBuffer | null = null;
</script>

<article class="prose">
	<h1>Waveform</h1>

	<audio controls bind:this={audioRef} src="/audio/To Elsewhere.mp3" />
	<Visualizer analyser={analyser}></Visualizer>

	<h2 class="">Fundamental Waveform</h2>

	<h3>Sine Wave</h3>

	<Visualizer analyser={sineAnalyser}></Visualizer>
	<button
		class="btn btn-circle p-2"
		on:click={() => {
			waveformRecord['sine']?.play();
		}}
	>
		<Icon src={Play}></Icon>
	</button>

	<h3>Square Wave</h3>

	<p></p>

	<Visualizer analyser={squareAnalyser}></Visualizer>
	<button
		class="btn btn-circle p-2"
		on:click={() => {
			waveformRecord['square']?.play();
		}}
	>
		<Icon src={Play}></Icon>
	</button>

	<h3 class="">Triangle Wave</h3>

	<Visualizer analyser={triangleAnalyser}></Visualizer>
	<button
		class="btn btn-circle p-2"
		on:click={() => {
			waveformRecord['triangle']?.play();
		}}
	>
		<Icon src={Play}></Icon>
	</button>

	<h3 class="">Saw Wave</h3>

	<Visualizer analyser={sawAnalyser}></Visualizer>
	<button
		class="btn btn-circle p-2"
		on:click={() => {
			waveformRecord['saw']?.play();
		}}
	>
		<Icon src={Play}></Icon>
	</button>
</article>
