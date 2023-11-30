<script lang="ts">
	import { browser } from '$app/environment';
	import { drumkits } from '$lib/audio/drumkits/sounds';
	import { audioCtx } from '$lib/audio/store/audio-context';
	// import { Synthesizer } from '$lib/audio/synthesizer/synthesizer';
	import Visualizer from '$lib/audio/waveform/Visualizer.svelte';
	import { onMount } from 'svelte';
	import { Icon, Play } from 'svelte-hero-icons';

	let audioRef: HTMLAudioElement;
	let canvasRef: HTMLCanvasElement;

	let analyser: AnalyserNode;

	const WIDTH = 800;
	const HEIGHT = 200;

	function playWaveform(waveform: Float32Array) {
		const ctx = $audioCtx;
		if (ctx === null) {
			return;
		}

		const buffer = ctx.createBuffer(1, waveform.length, ctx.sampleRate);
		buffer.copyToChannel(waveform, 0);
		const source = ctx.createBufferSource();
		source.buffer = buffer;

		const canvasCtx = canvasRef.getContext('2d')!;

		// const meSrc = ctx.createMediaElementSource(audioRef);
		const analyser = ctx.createAnalyser();
		source.connect(analyser);
		analyser.connect(ctx.destination);

		analyser.fftSize = 2048;
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);

		canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
		function draw() {
			const drawVisual = requestAnimationFrame(draw);
			analyser.getByteTimeDomainData(dataArray);
			canvasCtx.fillStyle = 'rgb(200, 200, 200)';
			canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
			canvasCtx.lineWidth = 2;
			canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
			canvasCtx.beginPath();
			const sliceWidth = WIDTH / bufferLength;
			let x = 0;
			for (let i = 0; i < bufferLength; i++) {
				const v = dataArray[i] / 128.0;
				const y = v * (HEIGHT / 2);

				if (i === 0) {
					canvasCtx.moveTo(x, y);
				} else {
					canvasCtx.lineTo(x, y);
				}

				x += sliceWidth;
			}
			canvasCtx.lineTo(WIDTH, HEIGHT / 2);
			canvasCtx.stroke();
		}
		draw();

		source.start(0);
	}

	onMount(() => {});

	if (browser && $audioCtx !== null) {
		const ctx = $audioCtx;

		analyser = $drumkits?.hihat.analyser!;
	}
</script>

<article class="prose">
	<h1>Waveform Visualizer</h1>
	<audio controls bind:this={audioRef} src="/audio/To Elsewhere.mp3" />

	<Visualizer {analyser}></Visualizer>
	<button
		class="btn btn-circle p-2"
		on:click={() => {
			$drumkits?.hihat.play(0.03);
		}}
	>
		<Icon src={Play}></Icon>
	</button>
	<canvas bind:this={canvasRef} />
</article>
