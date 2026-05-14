<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		actions?: Snippet;
	}

	let { title, description, actions }: Props = $props();
</script>

<header
	class="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"
>
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">{title}</h1>
		{#if description}
			<p class="text-sm text-muted-foreground mt-1">{description}</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex items-center gap-2">
			{@render actions()}
		</div>
	{/if}
</header>
