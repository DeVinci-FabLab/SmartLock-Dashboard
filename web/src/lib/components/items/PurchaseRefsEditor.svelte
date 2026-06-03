<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { PurchaseRefDTO } from '$lib/schemas/item';

	interface Props {
		value: PurchaseRefDTO[];
		disabled?: boolean;
		onChange: (next: PurchaseRefDTO[]) => void;
	}

	let { value, disabled = false, onChange }: Props = $props();

	function add() {
		onChange([...value, { supplier: '', url: '', price_indicative: null }]);
	}
	function remove(i: number) {
		onChange(value.filter((_, idx) => idx !== i));
	}
	function update(i: number, patch: Partial<PurchaseRefDTO>) {
		onChange(value.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
	}
</script>

<div class="space-y-2">
	{#each value as ref, i (i)}
		<div class="grid grid-cols-[2fr_3fr_1fr_auto] gap-2 items-center">
			<Input
				placeholder="Fournisseur"
				value={ref.supplier}
				oninput={(e) => update(i, { supplier: (e.target as HTMLInputElement).value })}
				{disabled}
				maxlength={255}
			/>
			<Input
				placeholder="URL ou réf"
				value={ref.url}
				oninput={(e) => update(i, { url: (e.target as HTMLInputElement).value })}
				{disabled}
				maxlength={500}
			/>
			<Input
				type="number"
				min="0"
				step="0.01"
				placeholder="Prix"
				value={ref.price_indicative ?? ''}
				oninput={(e) => {
					const raw = (e.target as HTMLInputElement).value;
					update(i, { price_indicative: raw === '' ? null : Number(raw) });
				}}
				{disabled}
			/>
			<Button
				variant="ghost"
				size="icon"
				onclick={() => remove(i)}
				{disabled}
				aria-label="Supprimer"
			>
				<Trash2 class="size-4" />
			</Button>
		</div>
	{/each}
	<Button variant="outline" size="sm" onclick={add} {disabled}>
		<Plus class="size-4" />
		Ajouter une référence
	</Button>
</div>
