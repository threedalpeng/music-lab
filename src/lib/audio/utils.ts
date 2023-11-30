function gainEnvelope(
	node: GainNode,
	options: {
		attack: number;
		decay: number;
		sustain: number;
		release: number;
	}
) {
	return null;
	// options =
	// const envelope = () => {
	// 	const when = node.context.currentTime;
	// 	node.gain.setValueAtTime(0.00001, when);
	// 	node.gain.exponentialRampToValueAtTime(1, when + decay);
	// };
}
