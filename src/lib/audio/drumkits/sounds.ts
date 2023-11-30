import { derived } from 'svelte/store';
import { audioCtx } from '../store/audio-context';
import { Synthesizer } from '../synthesizer/synthesizer';

const DrumKitsBuilder: Record<
	'kick' | 'snare' | 'hihat' | 'crash',
	(ctx: AudioContext) => Synthesizer
> = {
	kick: (ctx: AudioContext) => {
		const synthesizer = new Synthesizer(ctx);

		const attack = 0.1;
		const decay = 0.2;
		const sustain = 1 / 3;
		const release = 0.5;

		synthesizer.addNode('osc', new OscillatorNode(ctx));
		const cnode = new ConstantSourceNode(ctx);
		const when = ctx.currentTime;
		cnode.offset.setValueAtTime(0, when);
		cnode.offset.linearRampToValueAtTime(1, when + attack);
		cnode.offset.exponentialRampToValueAtTime(sustain, when + attack + decay);
		const when2 = ctx.currentTime;
		cnode.offset.exponentialRampToValueAtTime(0, when2 + release);
		synthesizer.addNode('envelope', new ConstantSourceNode(ctx));

		return synthesizer;
	},
	snare: (ctx: AudioContext) => {
		const synthesizer = new Synthesizer(ctx);
		return synthesizer;
	},
	hihat: (ctx: AudioContext) => {
		const synthesizer = new Synthesizer(ctx);

		const fundamental = 40;
		synthesizer.addNode(
			'osc1',
			new OscillatorNode(ctx, { type: 'square', frequency: fundamental * 2 })
		);
		synthesizer.addNode(
			'osc2',
			new OscillatorNode(ctx, { type: 'square', frequency: fundamental * 3 })
		);
		synthesizer.addNode(
			'osc3',
			new OscillatorNode(ctx, { type: 'square', frequency: fundamental * 4.16 })
		);
		synthesizer.addNode(
			'osc4',
			new OscillatorNode(ctx, { type: 'square', frequency: fundamental * 5.43 })
		);
		synthesizer.addNode(
			'osc5',
			new OscillatorNode(ctx, { type: 'square', frequency: fundamental * 6.79 })
		);
		synthesizer.addNode(
			'osc6',
			new OscillatorNode(ctx, { type: 'square', frequency: fundamental * 8.21 })
		);

		synthesizer.addNode('gain', new GainNode(ctx));
		synthesizer.addNode(
			'bandpass',
			new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 10000 })
		);
		synthesizer.addNode(
			'highpass',
			new BiquadFilterNode(ctx, { type: 'highpass', frequency: 7000 })
		);

		synthesizer.connect('osc1', 'bandpass');
		synthesizer.connect('osc2', 'bandpass');
		synthesizer.connect('osc3', 'bandpass');
		synthesizer.connect('osc4', 'bandpass');
		synthesizer.connect('osc5', 'bandpass');
		synthesizer.connect('osc6', 'bandpass');
		synthesizer.connect('bandpass', 'highpass');
		synthesizer.connect('highpass', 'gain');

		synthesizer.envelope({ attack: 0.02, decay: 0.01, sustain: 0.3, release: 0.01 });
		return synthesizer;
	},
	crash: (ctx: AudioContext) => {
		const synthesizer = new Synthesizer(ctx);
		return synthesizer;
	}
};

export const drumkits = derived(audioCtx, ($ctx) => {
	if ($ctx !== null) {
		return {
			kick: {},
			snare: {},
			hihat: DrumKitsBuilder.hihat($ctx),
			crash: {}
		};
	} else {
		return null;
	}
});
