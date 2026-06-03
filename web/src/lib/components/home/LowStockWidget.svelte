<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import Package from '@lucide/svelte/icons/package';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { queryKeys } from '$lib/query/queryKeys';
	import { lowStockAlertListSchema } from '$lib/schemas/item';

	const lowStockQuery = createQuery(() => ({
		queryKey: queryKeys.items.lowStock(),
		queryFn: async () => {
			const res = await fetch('/api/items/low-stock');
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return lowStockAlertListSchema.parse(await res.json());
		},
	}));

	let top5 = $derived((lowStockQuery.data ?? []).slice(0, 5));
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between">
			<CardTitle class="text-base flex items-center gap-2">
				<Package class="size-4" />
				Items low-stock
			</CardTitle>
			<Button variant="ghost" size="sm" onclick={() => goto('/stocks')}>
				Tout voir
				<ArrowRight class="size-4" />
			</Button>
		</div>
	</CardHeader>
	<CardContent>
		{#if lowStockQuery.isLoading}
			<LoadingState variant="skeleton-rows" rows={3} />
		{:else if lowStockQuery.isError || top5.length === 0}
			<p class="text-sm text-muted-foreground">Aucun item en seuil critique.</p>
		{:else}
			<ul class="space-y-1.5">
				{#each top5 as alert (alert.item_id)}
					<li>
						<button
							type="button"
							class="w-full flex items-center justify-between text-sm rounded-md px-2 py-1.5 hover:bg-muted/50"
							onclick={() => goto(`/items/${alert.item_id}`)}
						>
							<span class="font-medium truncate">{alert.name}</span>
							<Badge variant="destructive" class="text-[10px]">
								{alert.total_quantity}/{alert.threshold}
							</Badge>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</CardContent>
</Card>
