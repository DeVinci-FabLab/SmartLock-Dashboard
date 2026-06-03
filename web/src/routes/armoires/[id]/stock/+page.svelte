<script lang="ts">
	import { page } from '$app/state';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import {
		Table,
		TableBody,
		TableHead,
		TableHeader,
		TableRow,
	} from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import ErrorState from '$lib/components/primitives/ErrorState.svelte';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import StockRow from '$lib/components/armoires/StockRow.svelte';
	import AddStockSheet from '$lib/components/armoires/AddStockSheet.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Package from '@lucide/svelte/icons/package';
	import { queryKeys } from '$lib/query/queryKeys';
	import { enrichedStockListSchema } from '$lib/schemas/stock';
	import { itemListResponseSchema, type ItemDTO } from '$lib/schemas/item';
	import { can } from '$lib/auth/permissions';
	import type { UserContext } from '$lib/auth/types';
	import type { LayoutData } from '../$types';

	let { data }: { data: LayoutData } = $props();

	const qc = useQueryClient();
	let busyIds = $state<Set<number>>(new Set());
	let addOpen = $state(false);

	let user = $derived(page.data.user as UserContext | null);
	let canEdit = $derived(can(user, { type: 'edit_armoire', armoireId: data.armoire.id }));

	const stockQuery = createQuery(() => ({
		queryKey: queryKeys.armoires.stock(data.armoire.id),
		queryFn: async () => {
			const res = await fetch(`/api/lockers/${data.armoire.id}/stock`);
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return enrichedStockListSchema.parse(await res.json());
		},
	}));

	const itemsQuery = createQuery(() => ({
		queryKey: ['items', 'all'] as const,
		queryFn: async (): Promise<ItemDTO[]> => {
			const res = await fetch('/api/items?limit=1000');
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return itemListResponseSchema.parse(await res.json());
		},
		enabled: false,
	}));

	const updateMutation = createMutation(() => ({
		mutationFn: async ({ stockId, qty }: { stockId: number; qty: number }) => {
			const res = await fetch(`/api/lockers/${data.armoire.id}/stock/${stockId}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ quantity: qty }),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
		},
		onMutate: ({ stockId }) => {
			busyIds = new Set([...busyIds, stockId]);
		},
		onSettled: (_d, _e, vars) => {
			const next = new Set(busyIds);
			next.delete(vars.stockId);
			busyIds = next;
			qc.invalidateQueries({ queryKey: queryKeys.armoires.stock(data.armoire.id) });
		},
		onError: (e: Error) => toast.error(e.message),
	}));

	const deleteMutation = createMutation(() => ({
		mutationFn: async (stockId: number) => {
			const res = await fetch(`/api/lockers/${data.armoire.id}/stock/${stockId}`, {
				method: 'DELETE',
			});
			if (!res.ok && res.status !== 204) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
		},
		onMutate: (stockId) => {
			busyIds = new Set([...busyIds, stockId]);
		},
		onSettled: (_d, _e, stockId) => {
			const next = new Set(busyIds);
			next.delete(stockId);
			busyIds = next;
			qc.invalidateQueries({ queryKey: queryKeys.armoires.stock(data.armoire.id) });
		},
		onError: (e: Error) => toast.error(e.message),
	}));

	const addMutation = createMutation(() => ({
		mutationFn: async (payload: { item_id: number; quantity: number; unit_measure: string }) => {
			const res = await fetch(`/api/lockers/${data.armoire.id}/stock`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
		},
		onSuccess: () => {
			toast.success('Item ajouté au stock.');
			addOpen = false;
			qc.invalidateQueries({ queryKey: queryKeys.armoires.stock(data.armoire.id) });
		},
		onError: (e: Error) => toast.error(e.message),
	}));

	function openAdd() {
		addOpen = true;
		itemsQuery.refetch();
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-lg font-semibold">Stock</h2>
			<p class="text-sm text-muted-foreground">
				Items disponibles dans cette armoire. Ajuste les quantités si tu as la permission can_edit.
			</p>
		</div>
		<Gated action={{ type: 'edit_armoire', armoireId: data.armoire.id }}>
			<Button onclick={openAdd}>
				<Plus class="size-4" />
				Ajouter un item
			</Button>
		</Gated>
	</div>

	{#if stockQuery.isLoading}
		<LoadingState variant="skeleton-rows" rows={5} />
	{:else if stockQuery.isError}
		<ErrorState
			title="Impossible de charger le stock"
			description={stockQuery.error?.message ?? ''}
			onRetry={() => stockQuery.refetch()}
		/>
	{:else if (stockQuery.data ?? []).length === 0}
		<EmptyState
			icon={Package}
			title="Aucun item"
			description="Cette armoire ne contient aucun item pour le moment."
		/>
	{:else}
		<div class="rounded-md border border-border overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Item</TableHead>
						<TableHead>Référence</TableHead>
						<TableHead class="w-40">Quantité</TableHead>
						<TableHead class="w-16"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each stockQuery.data ?? [] as row (row.id)}
						<StockRow
							{row}
							{canEdit}
							busy={busyIds.has(row.id)}
							onChangeQty={(qty) => updateMutation.mutate({ stockId: row.id, qty })}
							onDelete={() => deleteMutation.mutate(row.id)}
						/>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}
</div>

<AddStockSheet
	open={addOpen}
	items={itemsQuery.data ?? []}
	busy={addMutation.isPending}
	onOpenChange={(v) => (addOpen = v)}
	onSubmit={(payload) => addMutation.mutate(payload)}
/>
