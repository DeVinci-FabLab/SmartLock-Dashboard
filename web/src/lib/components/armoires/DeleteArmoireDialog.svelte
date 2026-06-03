<script lang="ts">
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
	} from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		open: boolean;
		armoireLabel: string;
		busy: boolean;
		onOpenChange: (open: boolean) => void;
		onConfirm: () => void;
	}

	let { open, armoireLabel, busy, onOpenChange, onConfirm }: Props = $props();

	let typed = $state('');
	let canDelete = $derived(typed === armoireLabel);
</script>

<AlertDialog
	{open}
	onOpenChange={(v) => {
		if (!v) typed = '';
		onOpenChange(v);
	}}
>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Supprimer l'armoire "{armoireLabel}" ?</AlertDialogTitle>
			<AlertDialogDescription>
				Toutes les permissions et entrées de stock associées seront définitivement effacées.
			</AlertDialogDescription>
		</AlertDialogHeader>

		<div class="space-y-2 py-2">
			<Label for="confirm-armoire">
				Tape <span class="font-mono font-semibold">{armoireLabel}</span> pour confirmer
			</Label>
			<Input
				id="confirm-armoire"
				bind:value={typed}
				autocomplete="off"
				placeholder={armoireLabel}
				disabled={busy}
			/>
		</div>

		<AlertDialogFooter>
			<AlertDialogCancel disabled={busy}>Annuler</AlertDialogCancel>
			<AlertDialogAction onclick={onConfirm} disabled={busy || !canDelete}>
				{busy ? 'Suppression…' : 'Supprimer définitivement'}
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
