<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import PhotoDisplay from '$lib/components/items/PhotoDisplay.svelte';
	import ItemFormSheet from '$lib/components/items/ItemFormSheet.svelte';
	import DeleteItemDialog from '$lib/components/items/DeleteItemDialog.svelte';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';
	import { queryKeys } from '$lib/query/queryKeys';
	import type { ItemCreatePayload } from '$lib/schemas/item';
	import type { LayoutData } from '../$types';

	let { data }: { data: LayoutData } = $props();

	const qc = useQueryClient();
	let editOpen = $state(false);
	let deleteOpen = $state(false);

	let categoryName = $derived(
		data.categories.find((c) => c.id === data.item.category_id)?.name ?? '—',
	);

	const editMutation = createMutation(() => ({
		mutationFn: async (payload: ItemCreatePayload) => {
			const res = await fetch(`/api/items/${data.item.id}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
		},
		onSuccess: async () => {
			toast.success('Item mis à jour.');
			editOpen = false;
			qc.invalidateQueries({ queryKey: queryKeys.items.all() });
			await invalidate(`items:${data.item.id}`);
		},
		onError: (e: Error) => toast.error(e.message),
	}));

	const deleteMutation = createMutation(() => ({
		mutationFn: async () => {
			const res = await fetch(`/api/items/${data.item.id}`, { method: 'DELETE' });
			if (!res.ok && res.status !== 204) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
		},
		onSuccess: async () => {
			toast.success(`Item "${data.item.name}" supprimé.`);
			deleteOpen = false;
			qc.invalidateQueries({ queryKey: queryKeys.items.all() });
			goto('/items');
		},
		onError: (e: Error) => toast.error(e.message),
	}));
</script>

<div class="space-y-6">
	<div class="flex gap-6 items-start">
		<PhotoDisplay photo={data.item.photo} alt={data.item.name} class="size-32" />
		<div class="space-y-2 flex-1 max-w-2xl">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-1">
					<Label>Catégorie</Label>
					<Input value={categoryName} disabled />
				</div>
				<div class="space-y-1">
					<Label>Seuil low-stock</Label>
					<Input
						value={data.item.low_stock_threshold !== null && data.item.low_stock_threshold !== undefined
							? String(data.item.low_stock_threshold)
							: '—'}
						disabled
					/>
				</div>
			</div>
			<div class="space-y-1">
				<Label>Description</Label>
				<Textarea value={data.item.description ?? ''} rows={3} disabled />
			</div>
		</div>
	</div>

	<div class="space-y-2 max-w-2xl">
		<Label>Références d'achat</Label>
		{#if !data.item.purchase_refs || data.item.purchase_refs.length === 0}
			<p class="text-sm text-muted-foreground">Aucune référence d'achat enregistrée.</p>
		{:else}
			<ul class="space-y-1 text-sm">
				{#each data.item.purchase_refs as ref (ref.url)}
					<li class="flex items-center gap-2">
						<span class="font-medium">{ref.supplier}</span>
						<span class="text-muted-foreground">·</span>
						{#if /^https?:\/\//i.test(ref.url)}
							<a
								class="text-primary hover:underline truncate"
								href={ref.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								{ref.url}
							</a>
						{:else}
							<span class="text-muted-foreground truncate font-mono">{ref.url}</span>
						{/if}
						{#if ref.price_indicative !== null && ref.price_indicative !== undefined}
							<span class="text-muted-foreground">·</span>
							<span class="text-muted-foreground">{ref.price_indicative.toFixed(2)} €</span>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<Gated action={{ type: 'manage_items' }}>
		<div class="flex gap-2 max-w-2xl">
			<Button variant="outline" size="sm" onclick={() => (editOpen = true)}>
				<Pencil class="size-4" />
				Modifier
			</Button>
		</div>
	</Gated>

	<Gated action={{ type: 'manage_items' }}>
		<div class="border-t border-border pt-6 max-w-2xl">
			<div class="rounded-md border border-destructive/40 bg-destructive/5 p-4 space-y-2">
				<h3 class="font-semibold text-destructive">Zone dangereuse</h3>
				<p class="text-sm text-muted-foreground">
					La suppression efface aussi les entrées de stock liées (cascade côté backend).
				</p>
				<Button
					variant="destructive"
					size="sm"
					onclick={() => (deleteOpen = true)}
					class="mt-1"
				>
					<Trash2 class="size-4" />
					Supprimer cet item
				</Button>
			</div>
		</div>
	</Gated>
</div>

<ItemFormSheet
	open={editOpen}
	mode="edit"
	initial={data.item}
	categories={data.categories}
	busy={editMutation.isPending}
	onOpenChange={(v) => (editOpen = v)}
	onSubmit={(payload) => editMutation.mutate(payload)}
/>

<DeleteItemDialog
	open={deleteOpen}
	itemReference={data.item.reference}
	busy={deleteMutation.isPending}
	onOpenChange={(v) => (deleteOpen = v)}
	onConfirm={() => deleteMutation.mutate()}
/>
