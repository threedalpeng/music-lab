import { get } from 'svelte/store';
import { audioCtx } from '../store/audio-context';

const WaveformBuilder = {
	sine(pitch: number, volume: number, sec: number) {
		const ctx = get(audioCtx);
		if (ctx === null) {
			return null;
		}
		const sampleRate = ctx.sampleRate;
		const length = sampleRate * sec;
		return Float32Array.from(
			{ length },
			(_, i) => Math.sin((2 * Math.PI * i * pitch) / sampleRate) * volume
		);
	},
	square(pitch: number, volume: number, sec: number) {
		const ctx = get(audioCtx);
		if (ctx === null) {
			return null;
		}
		const sampleRate = ctx.sampleRate;
		const length = sampleRate * sec;
		const cycle = sampleRate / pitch;
		return Float32Array.from({ length }, (_, i) => {
			const div = Math.floor((2 * i) / cycle);
			return div % 2 == 0 ? volume : -volume;
		});
	},
	triangle(pitch: number, volume: number, sec: number) {
		const ctx = get(audioCtx);
		if (ctx === null) {
			return null;
		}
		const sampleRate = ctx.sampleRate;
		const length = sampleRate * sec;
		const cycle = sampleRate / pitch;
		const incl = 4 / cycle;
		return Float32Array.from({ length }, (_, i) => {
			const mod = i % cycle;
			if (mod < cycle * 0.25) {
				return incl * mod * volume;
			} else if (mod > cycle * 0.75) {
				return (incl * mod - 4) * volume;
			} else {
				return (-incl * mod + 2) * volume;
			}
		});
	},
	saw(pitch: number, volume: number, sec: number) {
		const ctx = get(audioCtx);
		if (ctx === null) {
			return null;
		}
		const sampleRate = ctx.sampleRate;
		const length = sampleRate * sec;
		const cycle = sampleRate / pitch;
		const incl = 2 / cycle;
		return Float32Array.from({ length }, (_, i) => {
			const mod = i % cycle;
			return (incl * mod - 1) * volume;
		});
	}
};

export default WaveformBuilder;
