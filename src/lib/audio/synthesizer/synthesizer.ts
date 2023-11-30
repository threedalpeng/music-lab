class SynthesizerNode {
	next: Map<string, string> = new Map();
	prev: Map<string, string> = new Map();
	node: AudioNode;
	name: string;

	constructor(name: string, node: AudioNode) {
		this.name = name;
		this.node = node;
	}
}

class SynthesizerSourceNode {
	node: AudioScheduledSourceNode;

	constructor(node: AudioScheduledSourceNode) {
		this.node = node;
		node.start();
	}

	start: () => void = () => {};
	stop: () => void = () => {};
}

interface Envelope {
	attack: number;
	decay: number;
	sustain: number;
	release: number;
}

export class Synthesizer {
	#ctx!: AudioContext;

	#sources: Map<string, SynthesizerSourceNode> = new Map();
	#nodeMap: Map<string, SynthesizerNode> = new Map();

	#gainNode: GainNode;
	#analyserNode: AnalyserNode;
	get analyser() {
		return this.#analyserNode;
	}

	#gain: number = 1;
	set gain(v: number) {
		this.#gain = v;
	}

	#envelope: Envelope = {
		attack: 0.01,
		decay: 0.1,
		sustain: 1,
		release: 0.5
	};
	envelope(envelope: Partial<Envelope>) {
		this.#envelope = {
			...this.#envelope,
			...envelope
		};
	}

	constructor(context: AudioContext) {
		this.#ctx = context;

		this.addNode('destination', this.#ctx.destination);

		this.#gainNode = new GainNode(this.#ctx, { gain: 0 });
		this.#analyserNode = new AnalyserNode(this.#ctx);
		this.addNode('gain', this.#gainNode);
		this.addNode('analyser', this.#analyserNode);

		this.connect('gain', 'analyser');
		this.connect('analyser', 'destination');
	}

	addNode<N extends AudioNode>(name: string, node: N) {
		if (this.#nodeMap.has(name)) {
			return;
		}
		if (node instanceof AudioScheduledSourceNode) {
			this.#sources.set(name, new SynthesizerSourceNode(node));
		}

		const sNode = new SynthesizerNode(name, node);
		this.#nodeMap.set(name, sNode);
	}

	removeNode(name: string) {
		const sNode = this.#nodeMap.get(name);
		if (sNode === undefined) {
			return;
		}

		sNode.next.forEach((destTarget, destName) => {
			this.disconnect(name, destName, destTarget);
		});
		sNode.prev.forEach((target, srcName) => {
			this.disconnect(name, srcName, target);
		});
		sNode.node.disconnect();

		this.#nodeMap.delete(name);
	}

	updateNode(name: string, callback: (node: AudioNode) => void) {
		const sNode = this.#nodeMap.get(name);
		if (sNode === undefined) {
			return;
		}
		callback(sNode.node);
	}

	connect(src: string, dest: string, target: string = 'node') {
		const srcNode = this.#nodeMap.get(src);
		if (srcNode === undefined) {
			return;
		}

		const destNode = this.#nodeMap.get(dest);
		if (destNode === undefined) {
			return;
		}

		if (target === 'node') {
			srcNode.next.set(dest, target);
			destNode.prev.set(src, target);
			srcNode.node.connect(destNode.node);
		} else {
			if (target in destNode.node) {
				srcNode.next.set(dest, target);
				destNode.prev.set(src, target);
				srcNode.node.connect((destNode.node as AudioNode & Record<string, AudioParam>)[target]);
			}
		}
	}

	disconnect(src: string, dest: string, target: string = 'node') {
		const srcNode = this.#nodeMap.get(src);
		if (srcNode === undefined) {
			return;
		}

		const destNode = this.#nodeMap.get(dest);
		if (destNode === undefined) {
			return;
		}

		if (target === 'node') {
			srcNode.next.delete(dest);
			destNode.prev.delete(src);
			srcNode.node.disconnect(destNode.node);
		} else {
			if (target in destNode.node) {
				srcNode.next.delete(dest);
				destNode.prev.delete(src);
				srcNode.node.disconnect((destNode.node as AudioNode & Record<string, AudioParam>)[target]);
			}
		}
	}

	#playing: boolean = false;
	get playing() {
		return this.#playing;
	}

	play(duration: number) {
		this.start();
		this.stop(duration);
	}

	start(offset: number = 0) {
		const when = this.#ctx.currentTime + offset;
		this.#sources.forEach((node) => {
			node.start();
		});
		this.#gainNode.gain.setValueAtTime(0, when);
		this.#gainNode.gain.linearRampToValueAtTime(this.gain, when + this.#envelope.attack);
		this.#gainNode.gain.exponentialRampToValueAtTime(
			this.#envelope.sustain * this.gain,
			when + this.#envelope.attack + this.#envelope.decay
		);
	}

	stop(offset: number = 0) {
		this.#sources.forEach((node) => {
			node.stop();
		});
		const when = this.#ctx.currentTime + offset;
		this.#gainNode.gain.setValueAtTime(0, when + this.#envelope.release);
	}
}
