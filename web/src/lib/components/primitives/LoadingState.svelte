<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';

	interface Props {
		variant?: 'skeleton-rows' | 'skeleton-cards' | 'spinner';
		rows?: number;
	}

	let { variant = 'skeleton-rows', rows = 5 }: Props = $props();
</script>

{#if variant === 'skeleton-rows'}
	<div class="space-y-3 py-6">
		{#each Array.from({ length: rows }) as _, i (i)}
			<Skeleton class="h-10 w-full" />
		{/each}
	</div>
{:else if variant === 'skeleton-cards'}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 py-6">
		{#each Array.from({ length: rows }) as _, i (i)}
			<Skeleton class="h-32 w-full" />
		{/each}
	</div>
{:else}
	<div class="flex items-center justify-center py-16">
		<div
			class="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent"
		></div>
	</div>
{/if}
