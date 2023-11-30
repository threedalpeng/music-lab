<script lang="ts">
	import { Canvas, Line, Rectangle } from '$lib/canvas';
	import BeforeRender from '$lib/canvas/elements/lifecycle/BeforeRender.svelte';
	import type { Point } from '$lib/canvas/types';

	export let analyser: AnalyserNode | null;
	export let fftSize: number = 2048

	const WIDTH = 1000;
	const HEIGHT = 300;

	let bufferLength = analyser?.frequencyBinCount;
	let dataArray: Uint8Array;
	let sliceWidth: number;

	$: if (analyser != null) init(analyser);

	function init(analyser: AnalyserNode) {
		analyser.fftSize = fftSize;
		bufferLength = analyser.frequencyBinCount;
		dataArray = new Uint8Array(bufferLength);
		sliceWidth = WIDTH / bufferLength;
	}

	let wave: Point[] = [];

	function generateWaveData() {
		if (analyser == null) return;
		analyser.getByteTimeDomainData(dataArray);
		wave = [];
		let x = 0;
		for (let i = 0; i < (bufferLength ?? 0); i++) {
			const v = dataArray[i] / 128.0;
			const y = v * (HEIGHT / 2);

			wave.push({ x, y });

			x += sliceWidth;
		}
		wave.push({ x: WIDTH, y: HEIGHT / 2 });
	}
</script>

<Canvas width={WIDTH} height={HEIGHT}>
	<BeforeRender onBeforeRender={generateWaveData} />
	<Rectangle top={0} left={0} width={WIDTH} height={HEIGHT} fillStyle="rgb(200, 200, 200)" />
	<Line points={wave} />
</Canvas>
