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
		roleName: string;
		busy: boolean;
		onOpenChange: (open: boolean) => void;
		onConfirm: () => void;
	}

	let { open, roleName, busy, onOpenChange, onConfirm }: Props = $props();

	let typed = $state('');
	let canDelete = $derived(typed === roleName);
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
			<AlertDialogTitle>Supprimer le rôle "{roleName}" ?</AlertDialogTitle>
			<AlertDialogDescription>
				Cette action retire le rôle de tous les utilisateurs et efface ses permissions. Elle est
				irréversible.
			</AlertDialogDescription>
		</AlertDialogHeader>

		<div class="space-y-2 py-2">
			<Label for="confirm-name">
				Tape <span class="font-mono font-semibold">{roleName}</span> pour confirmer
			</Label>
			<Input
				id="confirm-name"
				bind:value={typed}
				autocomplete="off"
				placeholder={roleName}
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
