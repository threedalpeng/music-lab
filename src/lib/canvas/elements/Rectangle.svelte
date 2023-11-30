<script lang="ts">
	import { onCanvasRender } from '../context';

	export let top: number;
	export let left: number;
	export let width: number;
	export let height: number;
	export let fillStyle: string | CanvasGradient | CanvasPattern = '#000';
	export let strokeStyle: string | CanvasGradient | CanvasPattern = '#000';
	export let lineWidth: number = 1;

	onCanvasRender(({ context2d: ctx }) => {
		ctx.fillStyle = fillStyle;
		ctx.strokeStyle = strokeStyle;
		ctx.lineWidth = lineWidth;
		ctx.fillRect(top, left, width, height);
		ctx.strokeRect(top, left, width, height);
	});
</script>
