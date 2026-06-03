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

	interface Props {
		open: boolean;
		roleName: string;
		busy: boolean;
		onOpenChange: (open: boolean) => void;
		onConfirm: () => void;
	}

	let { open, roleName, busy, onOpenChange, onConfirm }: Props = $props();
</script>

<AlertDialog {open} {onOpenChange}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Révoquer le rôle "{roleName}" ?</AlertDialogTitle>
			<AlertDialogDescription>
				L'utilisateur perd immédiatement les permissions associées à ce rôle. Cette action est
				réversible (tu peux réassigner le rôle).
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel disabled={busy}>Annuler</AlertDialogCancel>
			<AlertDialogAction onclick={onConfirm} disabled={busy}>
				{busy ? 'Révocation…' : 'Révoquer'}
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
