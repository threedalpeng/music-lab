<script lang="ts">
	import { onCanvasRender } from '../context';
	import type { Point } from '../types';
	import Line from './Line.svelte';
	import Polygon from './Polygon.svelte';

	export let points: { x: number; y: number }[];
	export let strokeStyle: string | CanvasGradient | CanvasPattern = '#000';
	export let lineCap: CanvasLineCap = 'butt';
	export let lineWidth: number = 1;
	export let arrowCapAngleBetween: number = 90;
	export let arrowCapLength: number = 5;
	export let arrowCapType: 'triangle' | 'line' = 'line';

	onCanvasRender(({ context2d: ctx }) => {
		ctx.strokeStyle = strokeStyle;
		ctx.lineCap = lineCap;
		ctx.lineWidth = lineWidth;
		ctx.beginPath();
		const start = points[0];
		ctx.moveTo(start.x, start.y);
		points.slice(1).forEach((point) => {
			ctx.lineTo(point.x, point.y);
		});
		ctx.stroke();
	});

	function getArrowEdgePoints(from: Point, to: Point): [Point, Point] {
		// const from = points[points.length - 2];
		// const to = points[points.length - 1];

		const gapX = to.x - from.x;
		const gapY = to.y - from.y;
		const gapR = Math.sqrt(gapX * gapX + gapY * gapY);
		const nX = gapX / gapR;
		const nY = gapY / gapR;

		const h = (arrowCapAngleBetween * Math.PI) / 360;
		const cosh = Math.cos(h);
		const sinh = Math.sin(h);

		return [
			{
				x: to.x - arrowCapLength * (cosh * nX - sinh * nY),
				y: to.y - arrowCapLength * (sinh * nX + cosh * nY)
			},
			{
				x: to.x - arrowCapLength * (cosh * nX + sinh * nY),
				y: to.y - arrowCapLength * (-sinh * nX + cosh * nY)
			}
		];
	}
</script>

<Line {points} {strokeStyle} {lineCap} {lineWidth} />
{#if points.length >= 2}
	{@const end = points[points.length - 1]}
	{@const [edge1, edge2] = getArrowEdgePoints(points[points.length - 2], end)}
	{#if arrowCapType == 'line'}
		<Line points={[edge1, end]} {strokeStyle} {lineCap} {lineWidth} />
		<Line points={[edge2, end]} {strokeStyle} {lineCap} {lineWidth} />
	{:else}
		<Polygon
			points={[end, edge1, edge2]}
			{strokeStyle}
			{lineCap}
			fillStyle={strokeStyle}
			{lineWidth}
		/>
	{/if}
{/if}
