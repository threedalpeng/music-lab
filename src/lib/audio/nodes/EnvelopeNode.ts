interface EnvelopeOptions {}

export default class EnvelopeAudioProcessor extends AudioWorkletProcessor {
	constructor() {
		super();
	}

	process(
		inputList: Float32Array[][],
		outputList: Float32Array[][],
		parameters: Record<string, Float32Array>
	): boolean {

		for (let outputNum = 0; outputNum < outputList.length; outputNum++) {
			const output = outputList[outputNum];
			const channelCount = output.length;

			for (let channelNum = 0; channelNum < channelCount; channelNum++) {
				output[channelNum].forEach((_, i) => {
					output[channelNum][i] = ;
				});
			}
		}

		return true;
	}

	static get parameterDescriptors() {
		return [
			{
				name: 'attack',
				defaultValue: 0.01,
				minValue: 0,
				maxValue: 2
			},
			{
				name: 'decay',
				defaultValue: 0.1,
				minValue: 0,
				maxValue: 2
			},
			{
				name: 'sustain',
				defaultValue: 1,
				minValue: 0,
				maxValue: 1
			},
			{
				name: 'release',
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 5
			}
		];
	}
}
