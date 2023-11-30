<script lang="ts">
	export let title: string;
</script>

<div class="rounded-sm bg-slate-300">
	<span class="text-lg font-bold">{title}</span>
    <span class="text-lg font-bold"></span>
	<slot />
</div>
