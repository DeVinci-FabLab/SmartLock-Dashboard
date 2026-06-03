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
		itemReference: string;
		busy: boolean;
		onOpenChange: (open: boolean) => void;
		onConfirm: () => void;
	}

	let { open, itemReference, busy, onOpenChange, onConfirm }: Props = $props();

	let typed = $state('');
	let canDelete = $derived(typed === itemReference);
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
			<AlertDialogTitle>Supprimer l'item "{itemReference}" ?</AlertDialogTitle>
			<AlertDialogDescription>
				Toutes les entrées de stock associées seront aussi effacées (cascade côté backend).
			</AlertDialogDescription>
		</AlertDialogHeader>

		<div class="space-y-2 py-2">
			<Label for="confirm-item">
				Tape <span class="font-mono font-semibold">{itemReference}</span> pour confirmer
			</Label>
			<Input
				id="confirm-item"
				bind:value={typed}
				autocomplete="off"
				placeholder={itemReference}
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
