<script lang="ts">
	import {
		Sheet,
		SheetContent,
		SheetDescription,
		SheetFooter,
		SheetHeader,
		SheetTitle,
	} from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import PurchaseRefsEditor from './PurchaseRefsEditor.svelte';
	import type {
		CategoryDTO,
		ItemCreatePayload,
		ItemDTO,
		PurchaseRefDTO,
	} from '$lib/schemas/item';

	interface Props {
		open: boolean;
		mode: 'create' | 'edit';
		initial?: ItemDTO;
		categories: CategoryDTO[];
		busy: boolean;
		onOpenChange: (open: boolean) => void;
		onSubmit: (payload: ItemCreatePayload) => void;
	}

	let { open, mode, initial, categories, busy, onOpenChange, onSubmit }: Props = $props();

	// svelte-ignore state_referenced_locally
	let name = $state<string>(initial?.name ?? '');
	// svelte-ignore state_referenced_locally
	let reference = $state<string>(initial?.reference ?? '');
	// svelte-ignore state_referenced_locally
	let description = $state<string>(initial?.description ?? '');
	// svelte-ignore state_referenced_locally
	let category_id = $state<number>(initial?.category_id ?? 0);
	// svelte-ignore state_referenced_locally
	let low_stock_threshold = $state<number | null>(initial?.low_stock_threshold ?? null);
	// svelte-ignore state_referenced_locally
	let photo = $state<string>(initial?.photo ?? '');
	// svelte-ignore state_referenced_locally
	let purchase_refs = $state<PurchaseRefDTO[]>(initial?.purchase_refs ?? []);

	function reset() {
		name = initial?.name ?? '';
		reference = initial?.reference ?? '';
		description = initial?.description ?? '';
		category_id = initial?.category_id ?? 0;
		low_stock_threshold = initial?.low_stock_threshold ?? null;
		photo = initial?.photo ?? '';
		purchase_refs = initial?.purchase_refs ?? [];
	}

	let canSubmit = $derived(
		name.length > 0 && reference.length > 0 && category_id > 0,
	);
</script>

<Sheet
	{open}
	onOpenChange={(v) => {
		if (!v) reset();
		onOpenChange(v);
	}}
>
	<SheetContent class="sm:max-w-lg overflow-y-auto">
		<SheetHeader>
			<SheetTitle>
				{mode === 'create' ? 'Créer un item' : 'Modifier l’item'}
			</SheetTitle>
			<SheetDescription>
				Métadonnées catalogue. Le champ photo accepte un object key rustfs ou une URL absolue.
			</SheetDescription>
		</SheetHeader>

		<div class="space-y-4 py-4">
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1">
					<Label for="item-name">Nom</Label>
					<Input id="item-name" bind:value={name} maxlength={255} disabled={busy} />
				</div>
				<div class="space-y-1">
					<Label for="item-ref">Référence</Label>
					<Input
						id="item-ref"
						bind:value={reference}
						maxlength={50}
						disabled={busy}
						class="font-mono"
					/>
				</div>
			</div>

			<div class="space-y-1">
				<Label for="item-desc">Description</Label>
				<Textarea id="item-desc" bind:value={description} rows={3} disabled={busy} />
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1">
					<Label for="item-cat">Catégorie</Label>
					<Select
						type="single"
						value={category_id > 0 ? String(category_id) : ''}
						onValueChange={(v) => v && (category_id = Number(v))}
					>
						<SelectTrigger id="item-cat">
							{categories.find((c) => c.id === category_id)?.name ?? 'Sélectionner…'}
						</SelectTrigger>
						<SelectContent>
							{#each categories as c (c.id)}
								<SelectItem value={String(c.id)}>{c.name}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>
				<div class="space-y-1">
					<Label for="item-low">Seuil low-stock</Label>
					<Input
						id="item-low"
						type="number"
						min="0"
						value={low_stock_threshold ?? ''}
						oninput={(e) => {
							const raw = (e.target as HTMLInputElement).value;
							low_stock_threshold = raw === '' ? null : Number(raw);
						}}
						disabled={busy}
					/>
				</div>
			</div>

			<div class="space-y-1">
				<Label for="item-photo">Photo (object key ou URL)</Label>
				<Input
					id="item-photo"
					bind:value={photo}
					maxlength={500}
					disabled={busy}
					placeholder="https://… ou rustfs/items/foo.jpg"
				/>
			</div>

			<div class="space-y-1">
				<Label>Références d'achat</Label>
				<PurchaseRefsEditor
					value={purchase_refs}
					disabled={busy}
					onChange={(next) => (purchase_refs = next)}
				/>
			</div>
		</div>

		<SheetFooter>
			<Button variant="outline" onclick={() => onOpenChange(false)} disabled={busy}>
				Annuler
			</Button>
			<Button
				disabled={!canSubmit || busy}
				onclick={() =>
					onSubmit({
						name,
						reference,
						description: description || null,
						category_id,
						low_stock_threshold,
						photo: photo || null,
						purchase_refs: purchase_refs.length > 0 ? purchase_refs : null,
					})}
			>
				{busy ? 'Enregistrement…' : mode === 'create' ? 'Créer' : 'Enregistrer'}
			</Button>
		</SheetFooter>
	</SheetContent>
</Sheet>
