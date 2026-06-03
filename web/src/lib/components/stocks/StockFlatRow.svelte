<script lang="ts">
	import { TableCell, TableRow } from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { EnrichedFlatStockRowDTO } from '$lib/schemas/item';

	interface Props {
		row: EnrichedFlatStockRowDTO;
		canEdit: boolean;
		busy: boolean;
		onChangeQty: (next: number) => void;
		onDelete: () => void;
	}

	let { row, canEdit, busy, onChangeQty, onDelete }: Props = $props();

	// svelte-ignore state_referenced_locally
	let pending = $state<number>(row.quantity);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function schedule(next: number) {
		pending = next;
		clearTimeout(timer);
		timer = setTimeout(() => {
			if (next !== row.quantity) onChangeQty(next);
		}, 800);
	}
</script>

<TableRow>
	<TableCell class="font-medium">{row.item_name}</TableCell>
	<TableCell class="font-mono text-xs text-muted-foreground">{row.item_reference}</TableCell>
	<TableCell>{row.locker_type}</TableCell>
	<TableCell class="w-40">
		<div class="flex items-center gap-2">
			<Input
				type="number"
				min="0"
				value={pending}
				disabled={!canEdit || busy}
				onchange={(e) => schedule(Number((e.target as HTMLInputElement).value))}
				class="w-24"
			/>
			<span class="text-xs text-muted-foreground">{row.unit_measure}</span>
			{#if busy}
				<span
					class="size-3 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin"
					aria-label="Sauvegarde"
				></span>
			{/if}
		</div>
	</TableCell>
	<TableCell class="w-16 text-right">
		{#if canEdit}
			<Button variant="ghost" size="icon" onclick={onDelete} disabled={busy} aria-label="Supprimer">
				<Trash2 class="size-4" />
			</Button>
		{/if}
	</TableCell>
</TableRow>
