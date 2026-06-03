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
	import { Switch } from '$lib/components/ui/switch';
	import type { ArmoireCreatePayload, ArmoireDTO } from '$lib/schemas/armoire';

	interface Props {
		open: boolean;
		mode: 'create' | 'edit';
		initial?: ArmoireDTO;
		busy: boolean;
		onOpenChange: (open: boolean) => void;
		onSubmit: (payload: ArmoireCreatePayload) => void;
	}

	let { open, mode, initial, busy, onOpenChange, onSubmit }: Props = $props();

	// svelte-ignore state_referenced_locally
	let locker_type = $state<string>(initial?.locker_type ?? '');
	// svelte-ignore state_referenced_locally
	let is_active = $state<boolean>(initial?.is_active ?? true);

	function reset() {
		locker_type = initial?.locker_type ?? '';
		is_active = initial?.is_active ?? true;
	}

	let canSubmit = $derived(locker_type.length > 0 && locker_type.length <= 50);
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
			<SheetTitle>
				{mode === 'create' ? 'Créer une armoire' : 'Modifier l’armoire'}
			</SheetTitle>
			<SheetDescription>
				{mode === 'create'
					? 'L’armoire sera ajoutée au catalogue. Les permissions par rôle se configurent ensuite.'
					: 'Mets à jour le libellé ou l’état actif de cette armoire.'}
			</SheetDescription>
		</SheetHeader>

		<div class="space-y-4 py-4">
			<div class="space-y-1">
				<Label for="armoire-type">Libellé</Label>
				<Input
					id="armoire-type"
					bind:value={locker_type}
					placeholder="ex: Armoire createch-3D"
					maxlength={50}
					disabled={busy}
				/>
			</div>

			<label class="flex items-center gap-2 text-sm">
				<Switch bind:checked={is_active} disabled={busy} />
				<span>Active</span>
			</label>
		</div>

		<SheetFooter>
			<Button variant="outline" onclick={() => onOpenChange(false)} disabled={busy}>
				Annuler
			</Button>
			<Button
				onclick={() => onSubmit({ locker_type, is_active })}
				disabled={!canSubmit || busy}
			>
				{busy ? 'Enregistrement…' : mode === 'create' ? 'Créer' : 'Enregistrer'}
			</Button>
		</SheetFooter>
	</SheetContent>
</Sheet>
