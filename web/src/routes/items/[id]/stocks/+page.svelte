<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
	} from '$lib/components/ui/table';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import ErrorState from '$lib/components/primitives/ErrorState.svelte';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import Package from '@lucide/svelte/icons/package';
	import { queryKeys } from '$lib/query/queryKeys';
	import { stockSpreadListSchema } from '$lib/schemas/item';
	import type { LayoutData } from '../$types';

	let { data }: { data: LayoutData } = $props();

	const spreadQuery = createQuery(() => ({
		queryKey: queryKeys.items.stockSpread(data.item.id),
		queryFn: async () => {
			const res = await fetch(`/api/items/${data.item.id}/stocks`);
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return stockSpreadListSchema.parse(await res.json());
		},
	}));
</script>

<div class="space-y-4">
	<div>
		<h2 class="text-lg font-semibold">Répartition dans les armoires</h2>
		<p class="text-sm text-muted-foreground">
			Vue inverse — une ligne par armoire qui contient cet item.
		</p>
	</div>

	{#if spreadQuery.isLoading}
		<LoadingState variant="skeleton-rows" rows={4} />
	{:else if spreadQuery.isError}
		<ErrorState
			title="Impossible de charger la répartition"
			description={spreadQuery.error?.message ?? ''}
			onRetry={() => spreadQuery.refetch()}
		/>
	{:else if (spreadQuery.data ?? []).length === 0}
		<EmptyState
			icon={Package}
			title="Aucun stock"
			description="Cet item n'est présent dans aucune armoire."
		/>
	{:else}
		<div class="rounded-md border border-border overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Armoire</TableHead>
						<TableHead class="w-40">Quantité</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each spreadQuery.data ?? [] as row (row.id)}
						<TableRow>
							<TableCell class="font-medium">{row.locker_type}</TableCell>
							<TableCell class="w-40">
								{row.quantity}
								<span class="text-xs text-muted-foreground ml-1">{row.unit_measure}</span>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}
</div>
