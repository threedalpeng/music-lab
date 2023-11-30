<script lang="ts">
	import { onBeforeCanvasRender, type CanvasRenderCallback } from '$lib/canvas/context';

	export let onBeforeRender: CanvasRenderCallback;

	onBeforeCanvasRender(onBeforeRender);
</script>
