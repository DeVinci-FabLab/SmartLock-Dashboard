<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	interface Props {
		page: number;
		pageSize: number;
		totalShown: number;
		hasMore: boolean;
		onPageChange: (next: number) => void;
	}

	let { page, pageSize, totalShown, hasMore, onPageChange }: Props = $props();

	let start = $derived(page * pageSize + 1);
	let end = $derived(page * pageSize + totalShown);
</script>

<div class="flex items-center justify-between text-sm text-muted-foreground mt-4">
	<span class="tabular-nums">
		{#if totalShown === 0}
			Aucun résultat
		{:else}
			{start}–{end}
		{/if}
	</span>
	<div class="flex items-center gap-2">
		<Button
			variant="outline"
			size="sm"
			disabled={page === 0}
			onclick={() => onPageChange(page - 1)}
		>
			<ChevronLeft class="size-4" />
			<span class="sr-only">Précédent</span>
		</Button>
		<Button
			variant="outline"
			size="sm"
			disabled={!hasMore}
			onclick={() => onPageChange(page + 1)}
		>
			<ChevronRight class="size-4" />
			<span class="sr-only">Suivant</span>
		</Button>
	</div>
</div>
