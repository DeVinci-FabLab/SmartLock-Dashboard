<script lang="ts">
	import { page } from '$app/state';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import ErrorState from '$lib/components/primitives/ErrorState.svelte';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import DataTableToolbar from '$lib/components/tables/DataTableToolbar.svelte';
	import StockFlatRow from '$lib/components/stocks/StockFlatRow.svelte';
	import {
		Table,
		TableBody,
		TableHead,
		TableHeader,
		TableRow,
	} from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import Package from '@lucide/svelte/icons/package';
	import Download from '@lucide/svelte/icons/download';
	import { queryKeys } from '$lib/query/queryKeys';
	import { enrichedFlatStockListSchema } from '$lib/schemas/item';
	import { can } from '$lib/auth/permissions';
	import type { UserContext } from '$lib/auth/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const qc = useQueryClient();
	let busyIds = $state<Set<number>>(new Set());
	let searchInput = $state('');
	let categoryFilter = $state<string>('all');
	let lockerFilter = $state<string>('all');

	let user = $derived(page.data.user as UserContext | null);

	const stocksQuery = createQuery(() => ({
		queryKey: queryKeys.stocks.list({}),
		queryFn: async () => {
			const res = await fetch('/api/stocks');
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return enrichedFlatStockListSchema.parse(await res.json());
		},
	}));

	let filtered = $derived(
		(stocksQuery.data ?? []).filter((r) => {
			if (searchInput) {
				const q = searchInput.toLowerCase();
				if (!r.item_name.toLowerCase().includes(q) && !r.item_reference.toLowerCase().includes(q))
					return false;
			}
			if (categoryFilter !== 'all' && r.category_id !== Number(categoryFilter)) return false;
			if (lockerFilter !== 'all' && r.locker_id !== Number(lockerFilter)) return false;
			return true;
		}),
	);

	function canEditRow(lockerId: number): boolean {
		return can(user, { type: 'edit_armoire', armoireId: lockerId });
	}

	const updateMutation = createMutation(() => ({
		mutationFn: async ({ stockId, qty }: { stockId: number; qty: number }) => {
			const res = await fetch(`/api/stocks/${stockId}`, {
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
			qc.invalidateQueries({ queryKey: queryKeys.stocks.all() });
		},
		onError: (e: Error) => toast.error(e.message),
	}));

	const deleteMutation = createMutation(() => ({
		mutationFn: async (stockId: number) => {
			const res = await fetch(`/api/stocks/${stockId}`, { method: 'DELETE' });
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
			qc.invalidateQueries({ queryKey: queryKeys.stocks.all() });
		},
		onError: (e: Error) => toast.error(e.message),
	}));
</script>

<PageHeader title="Stocks" description="Tous les items, dans toutes les armoires.">
	{#snippet actions()}
		<Gated action={{ type: 'export_stocks' }}>
			<Button variant="outline" onclick={() => (window.location.href = '/api/stocks.csv')}>
				<Download class="size-4" />
				Exporter CSV
			</Button>
		</Gated>
	{/snippet}
</PageHeader>

<div class="mt-6 space-y-4">
	<div class="flex items-center gap-3">
		<div class="flex-1">
			<DataTableToolbar
				search={searchInput}
				searchPlaceholder="Rechercher par item…"
				onSearchChange={(v) => (searchInput = v)}
			/>
		</div>
		<Select type="single" value={categoryFilter} onValueChange={(v) => v && (categoryFilter = v)}>
			<SelectTrigger class="w-48">
				{categoryFilter === 'all'
					? 'Toutes catégories'
					: (data.categories.find((c) => String(c.id) === categoryFilter)?.name ?? 'Catégorie')}
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">Toutes catégories</SelectItem>
				{#each data.categories as c (c.id)}
					<SelectItem value={String(c.id)}>{c.name}</SelectItem>
				{/each}
			</SelectContent>
		</Select>
		<Select type="single" value={lockerFilter} onValueChange={(v) => v && (lockerFilter = v)}>
			<SelectTrigger class="w-48">
				{lockerFilter === 'all'
					? 'Toutes armoires'
					: (data.lockers.find((l) => String(l.id) === lockerFilter)?.locker_type ?? 'Armoire')}
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">Toutes armoires</SelectItem>
				{#each data.lockers as l (l.id)}
					<SelectItem value={String(l.id)}>{l.locker_type}</SelectItem>
				{/each}
			</SelectContent>
		</Select>
	</div>

	{#if stocksQuery.isLoading}
		<LoadingState variant="skeleton-rows" rows={6} />
	{:else if stocksQuery.isError}
		<ErrorState
			title="Impossible de charger les stocks"
			description={stocksQuery.error?.message ?? ''}
			onRetry={() => stocksQuery.refetch()}
		/>
	{:else if filtered.length === 0}
		<EmptyState
			icon={Package}
			title="Aucune entrée de stock"
			description="Aucune entrée ne correspond à ta recherche."
		/>
	{:else}
		<div class="rounded-md border border-border overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Item</TableHead>
						<TableHead>Référence</TableHead>
						<TableHead>Armoire</TableHead>
						<TableHead class="w-40">Quantité</TableHead>
						<TableHead class="w-16"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each filtered as row (row.id)}
						<StockFlatRow
							{row}
							canEdit={canEditRow(row.locker_id)}
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
