import { browser } from '$app/environment';
import { getContext, onDestroy, onMount, setContext } from 'svelte';

type CanvasGetter = () => HTMLCanvasElement;
export type CanvasRenderCallback = (canvasContext: CanvasContext) => unknown;
class CanvasContext {
	#canvasGetter: CanvasGetter;
	#timePassed = 0;
	#frameId = 0;
	constructor(canvasGetter: CanvasGetter) {
		this.#canvasGetter = canvasGetter;
	}

	get canvas() {
		return this.#canvasGetter();
	}
	get context2d() {
		return this.canvas.getContext('2d')!;
	}
	get delta() {
		return this.#timePassed;
	}

	get width() {
		return this.canvas.width;
	}
	set width(w) {
		this.canvas.width = w;
	}
	get height() {
		return this.canvas.height;
	}
	set height(h) {
		this.canvas.height = h;
	}

	#beforeRenderCallbacks: CanvasRenderCallback[] = [];
	onBeforeRender(callback: CanvasRenderCallback) {
		this.#renderCallbacks = this.#beforeRenderCallbacks.concat(callback);
	}
	removeBeforeRender(callback: CanvasRenderCallback) {
		this.#renderCallbacks = this.#beforeRenderCallbacks.filter((render) => render !== callback);
	}

	#renderCallbacks: CanvasRenderCallback[] = [];
	onRender(callback: CanvasRenderCallback) {
		this.#renderCallbacks = this.#renderCallbacks.concat(callback);
	}
	removeRender(callback: CanvasRenderCallback) {
		this.#renderCallbacks = this.#renderCallbacks.filter((render) => render !== callback);
	}

	#afterRenderCallbacks: CanvasRenderCallback[] = [];
	onAfterRender(callback: CanvasRenderCallback) {
		this.#afterRenderCallbacks = this.#afterRenderCallbacks.concat(callback);
	}
	removeAfterRender(callback: CanvasRenderCallback) {
		this.#afterRenderCallbacks = this.#afterRenderCallbacks.filter((render) => render !== callback);
	}

	render: FrameRequestCallback = async (t) => {
		this.#timePassed = t;
		const ctx = this.context2d;
		ctx.clearRect(0, 0, this.width, this.height);
		this.#renderCallbacks.forEach(async (renderCallback) => {
			ctx.save();
			renderCallback(this);
			ctx.restore();
		});
		this.#afterRenderCallbacks.forEach(async (afterRenderCallback) => {
			ctx.save();
			afterRenderCallback(this);
			ctx.restore();
		});
	};

	run() {
		const loop: FrameRequestCallback = async (t) => {
			this.render(t);
			this.#frameId = requestAnimationFrame(loop);
		};
		this.#frameId = requestAnimationFrame(loop);
	}

	quit() {
		cancelAnimationFrame(this.#frameId);
		this.#renderCallbacks = [];
		this.#afterRenderCallbacks = [];
	}
}

export const setCanvasContext = (canvasGetter: CanvasGetter) => {
	const context = setContext('canvas', new CanvasContext(canvasGetter));
	onMount(() => {
		context.run();
	});
	onDestroy(() => {
		if (browser) {
			context.quit();
		}
	});
	return context;
};
export const setSubroutineCanvasContext = (
	upperContext: CanvasContext,
	canvasGetter: CanvasGetter,
	options?: {
		beforeRender?: CanvasRenderCallback;
		afterRender?: CanvasRenderCallback;
	}
) => {
	const subCanvasContext = new CanvasContext(canvasGetter);
	upperContext.onRender(({ delta }) => {
		if (options?.beforeRender) {
			options.beforeRender(subCanvasContext);
		}
		subCanvasContext.render(delta);
		if (options?.afterRender) {
			options.afterRender(subCanvasContext);
		}
	});
	setContext('canvas', subCanvasContext);
	return subCanvasContext;
};

export const getCanvasContext: () => CanvasContext = () => {
	return getContext('canvas');
};

export const onBeforeCanvasRender = (renderFn: CanvasRenderCallback) => {
	const canvasContext = getCanvasContext();
	onMount(() => {
		canvasContext.onBeforeRender(renderFn);
	});

	onDestroy(() => {
		canvasContext.removeBeforeRender(renderFn);
	});
};
export const onCanvasRender = (renderFn: CanvasRenderCallback) => {
	const canvasContext = getCanvasContext();
	onMount(() => {
		canvasContext.onRender(renderFn);
	});

	onDestroy(() => {
		canvasContext.removeRender(renderFn);
	});
};
export const onAfterCanvasRender = (renderFn: CanvasRenderCallback) => {
	const canvasContext = getCanvasContext();
	onMount(() => {
		canvasContext.onAfterRender(renderFn);
	});

	onDestroy(() => {
		canvasContext.removeAfterRender(renderFn);
	});
};
