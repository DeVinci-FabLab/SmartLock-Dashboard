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
	import {
		Command,
		CommandEmpty,
		CommandGroup,
		CommandInput,
		CommandItem,
		CommandList,
	} from '$lib/components/ui/command';
	import type { ItemDTO } from '$lib/schemas/item';

	interface Props {
		open: boolean;
		items: ItemDTO[];
		busy: boolean;
		onOpenChange: (v: boolean) => void;
		onSubmit: (payload: { item_id: number; quantity: number; unit_measure: string }) => void;
	}

	let { open, items, busy, onOpenChange, onSubmit }: Props = $props();

	let selected = $state<ItemDTO | null>(null);
	let quantity = $state<number>(0);
	let unit_measure = $state<string>('units');

	function reset() {
		selected = null;
		quantity = 0;
		unit_measure = 'units';
	}

	let canSubmit = $derived(selected !== null && quantity >= 0);
</script>

<Sheet
	{open}
	onOpenChange={(v) => {
		if (!v) reset();
		onOpenChange(v);
	}}
>
	<SheetContent class="sm:max-w-md">
		<SheetHeader>
			<SheetTitle>Ajouter un item au stock</SheetTitle>
			<SheetDescription>
				Sélectionne un item du catalogue et indique la quantité initiale.
			</SheetDescription>
		</SheetHeader>

		<div class="space-y-4 py-4">
			<div class="space-y-1">
				<Label>Item</Label>
				<Command class="border border-border rounded-md">
					<CommandInput placeholder="Rechercher un item…" />
					<CommandList class="max-h-48">
						<CommandEmpty>Aucun item.</CommandEmpty>
						<CommandGroup>
							{#each items as it (it.id)}
								<CommandItem
									value={`${it.name} ${it.reference}`}
									onSelect={() => (selected = it)}
								>
									<span class="font-medium">{it.name}</span>
									<span class="ml-2 text-xs text-muted-foreground">{it.reference}</span>
								</CommandItem>
							{/each}
						</CommandGroup>
					</CommandList>
				</Command>
				{#if selected}
					<p class="text-xs text-muted-foreground">
						Sélectionné : <span class="font-medium">{selected.name}</span>
					</p>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1">
					<Label for="qty">Quantité initiale</Label>
					<Input id="qty" type="number" min="0" bind:value={quantity} disabled={busy} />
				</div>
				<div class="space-y-1">
					<Label for="unit">Unité</Label>
					<Input id="unit" bind:value={unit_measure} maxlength={50} disabled={busy} />
				</div>
			</div>
		</div>

		<SheetFooter>
			<Button variant="outline" onclick={() => onOpenChange(false)} disabled={busy}>
				Annuler
			</Button>
			<Button
				disabled={!canSubmit || busy}
				onclick={() =>
					selected && onSubmit({ item_id: selected.id, quantity, unit_measure })}
			>
				{busy ? 'Ajout…' : 'Ajouter'}
			</Button>
		</SheetFooter>
	</SheetContent>
</Sheet>
