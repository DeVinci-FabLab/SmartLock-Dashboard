<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import DataTable from '$lib/components/tables/DataTable.svelte';
	import DataTableToolbar from '$lib/components/tables/DataTableToolbar.svelte';
	import DataTablePagination from '$lib/components/tables/DataTablePagination.svelte';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import ItemFormSheet from '$lib/components/items/ItemFormSheet.svelte';
	import CategoryManagerDialog from '$lib/components/items/CategoryManagerDialog.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import Plus from '@lucide/svelte/icons/plus';
	import Tag from '@lucide/svelte/icons/tag';
	import Package from '@lucide/svelte/icons/package';
	import { queryKeys } from '$lib/query/queryKeys';
	import type { DataTableColumn } from '$lib/components/tables/types';
	import type { CategoryDTO, ItemCreatePayload, ItemDTO } from '$lib/schemas/item';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	let searchInput = $state<string>(data.params.search ?? '');
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let createOpen = $state(false);
	let categoriesOpen = $state(false);

	const qc = useQueryClient();

	let categoryById = $derived(new Map(data.categories.map((c) => [c.id, c.name])));

	function commitSearch(value: string) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const url = new URL(page.url);
			if (value) url.searchParams.set('q', value);
			else url.searchParams.delete('q');
			url.searchParams.delete('page');
			goto(url, { keepFocus: true, noScroll: true, replaceState: true });
		}, 300);
	}

	function changeCategory(v: string) {
		const url = new URL(page.url);
		if (v && v !== 'all') url.searchParams.set('category', v);
		else url.searchParams.delete('category');
		url.searchParams.delete('page');
		goto(url, { noScroll: true });
	}

	function changePage(next: number) {
		const url = new URL(page.url);
		if (next > 0) url.searchParams.set('page', String(next));
		else url.searchParams.delete('page');
		goto(url, { noScroll: false });
	}

	let filtered = $derived(
		data.items.filter((it) => {
			if (data.params.search) {
				const q = data.params.search.toLowerCase();
				if (!it.name.toLowerCase().includes(q) && !it.reference.toLowerCase().includes(q))
					return false;
			}
			if (data.params.category_id && it.category_id !== data.params.category_id) return false;
			return true;
		}),
	);

	const createItemMutation = createMutation(() => ({
		mutationFn: async (payload: ItemCreatePayload) => {
			const res = await fetch('/api/items', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
			return res.json() as Promise<ItemDTO>;
		},
		onSuccess: async (created) => {
			toast.success(`Item "${created.name}" créé.`);
			createOpen = false;
			qc.invalidateQueries({ queryKey: queryKeys.items.all() });
			await invalidate('items:list');
			goto(`/items/${created.id}`);
		},
		onError: (e: Error) => toast.error(e.message),
	}));

	async function createCategory(name: string) {
		const res = await fetch('/api/categories', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ name }),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			toast.error(body.message ?? `Échec : ${res.status}`);
			return;
		}
		toast.success('Catégorie créée.');
		await invalidate('items:list');
	}
	async function renameCategory(id: number, name: string) {
		const res = await fetch(`/api/categories/${id}`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ name }),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			toast.error(body.message ?? `Échec : ${res.status}`);
			return;
		}
		toast.success('Catégorie renommée.');
		await invalidate('items:list');
	}
	async function deleteCategory(id: number) {
		const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
		if (!res.ok && res.status !== 204) {
			const body = await res.json().catch(() => ({ message: res.statusText }));
			toast.error(body.message ?? `Échec : ${res.status}`);
			return;
		}
		toast.success('Catégorie supprimée.');
		await invalidate('items:list');
	}

	const columns: DataTableColumn<ItemDTO>[] = [
		{ key: 'name', header: 'Nom', cellClass: 'font-medium' },
		{
			key: 'reference',
			header: 'Référence',
			cellClass: 'font-mono text-xs text-muted-foreground',
		},
		{ key: 'category', header: 'Catégorie', cell: categoryCell },
	];
</script>

{#snippet categoryCell(it: ItemDTO)}
	<span class="text-muted-foreground">{categoryById.get(it.category_id) ?? '—'}</span>
{/snippet}

<PageHeader title="Items" description="Catalogue d'items et de leurs références d'achat.">
	{#snippet actions()}
		<Gated action={{ type: 'manage_categories' }}>
			<Button variant="outline" onclick={() => (categoriesOpen = true)}>
				<Tag class="size-4" />
				Catégories
			</Button>
		</Gated>
		<Gated action={{ type: 'manage_items' }}>
			<Button onclick={() => (createOpen = true)}>
				<Plus class="size-4" />
				Créer un item
			</Button>
		</Gated>
	{/snippet}
</PageHeader>

<div class="mt-6 space-y-4">
	<div class="flex items-center gap-3">
		<div class="flex-1">
			<DataTableToolbar
				search={searchInput}
				searchPlaceholder="Rechercher par nom ou référence…"
				onSearchChange={(v) => {
					searchInput = v;
					commitSearch(v);
				}}
			/>
		</div>
		<Select
			type="single"
			value={data.params.category_id ? String(data.params.category_id) : 'all'}
			onValueChange={(v) => v && changeCategory(v)}
		>
			<SelectTrigger class="w-48">
				{data.params.category_id
					? (categoryById.get(data.params.category_id) ?? 'Catégorie')
					: 'Toutes catégories'}
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">Toutes catégories</SelectItem>
				{#each data.categories as c (c.id)}
					<SelectItem value={String(c.id)}>{c.name}</SelectItem>
				{/each}
			</SelectContent>
		</Select>
	</div>

	<DataTable
		rows={filtered}
		{columns}
		rowKey={(it) => it.id}
		onRowClick={(it) => goto(`/items/${it.id}`)}
		emptyIcon={Package}
		emptyTitle="Aucun item"
		emptyDescription="Le catalogue est vide ou ta recherche ne renvoie aucun résultat."
	/>

	<DataTablePagination
		page={data.page}
		pageSize={data.pageSize}
		totalShown={filtered.length}
		hasMore={data.items.length === data.pageSize}
		onPageChange={changePage}
	/>
</div>

<ItemFormSheet
	open={createOpen}
	mode="create"
	categories={data.categories}
	busy={createItemMutation.isPending}
	onOpenChange={(v) => (createOpen = v)}
	onSubmit={(payload) => createItemMutation.mutate(payload)}
/>

<CategoryManagerDialog
	open={categoriesOpen}
	categories={data.categories as CategoryDTO[]}
	busy={false}
	onOpenChange={(v) => (categoriesOpen = v)}
	onCreate={createCategory}
	onRename={renameCategory}
	onDelete={deleteCategory}
/>
