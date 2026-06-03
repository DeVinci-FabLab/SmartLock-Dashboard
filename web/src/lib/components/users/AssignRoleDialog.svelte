<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import type { Group } from '$lib/api/roles';

	interface Props {
		open: boolean;
		groups: Group[];
		busy: boolean;
		onOpenChange: (open: boolean) => void;
		onSubmit: (roleName: string) => void;
	}

	let { open, groups, busy, onOpenChange, onSubmit }: Props = $props();

	let selected = $state<string>('');
</script>

<Dialog {open} {onOpenChange}>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>Assigner un rôle</DialogTitle>
			<DialogDescription>
				Choisis un groupe Keycloak à attribuer. L'utilisateur reçoit toutes les permissions
				associées à ce groupe.
			</DialogDescription>
		</DialogHeader>

		<div class="space-y-2 py-2">
			<Label for="role-select">Rôle</Label>
			<Select type="single" bind:value={selected}>
				<SelectTrigger id="role-select" class="w-full">
					{selected || 'Sélectionner un rôle…'}
				</SelectTrigger>
				<SelectContent>
					{#each groups as g (g.id)}
						<SelectItem value={g.name}>{g.name}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={() => onOpenChange(false)} disabled={busy}>
				Annuler
			</Button>
			<Button onclick={() => onSubmit(selected)} disabled={!selected || busy}>
				{busy ? 'Assignation…' : 'Assigner'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
