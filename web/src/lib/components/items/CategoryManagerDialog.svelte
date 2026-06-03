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
	import { Input } from '$lib/components/ui/input';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { CategoryDTO } from '$lib/schemas/item';

	interface Props {
		open: boolean;
		categories: CategoryDTO[];
		busy: boolean;
		onOpenChange: (open: boolean) => void;
		onCreate: (name: string) => void;
		onRename: (id: number, name: string) => void;
		onDelete: (id: number) => void;
	}

	let { open, categories, busy, onOpenChange, onCreate, onRename, onDelete }: Props =
		$props();

	let newName = $state('');

	function submitNew() {
		if (!newName.trim()) return;
		onCreate(newName.trim());
		newName = '';
	}
</script>

<Dialog {open} onOpenChange={(v) => onOpenChange(v)}>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>Catégories</DialogTitle>
			<DialogDescription>
				Renommer et supprimer existe; la suppression d'une catégorie utilisée par des items est refusée par le backend.
			</DialogDescription>
		</DialogHeader>

		<div class="space-y-3 py-2">
			<div class="space-y-2 max-h-64 overflow-y-auto">
				{#each categories as c (c.id)}
					<div class="flex items-center gap-2">
						<Input
							value={c.name}
							onchange={(e) => onRename(c.id, (e.target as HTMLInputElement).value)}
							disabled={busy}
							maxlength={100}
						/>
						<Button
							variant="ghost"
							size="icon"
							onclick={() => onDelete(c.id)}
							disabled={busy}
							aria-label="Supprimer"
						>
							<Trash2 class="size-4" />
						</Button>
					</div>
				{/each}
			</div>

			<div class="flex items-center gap-2 pt-2 border-t border-border">
				<Input
					bind:value={newName}
					placeholder="Nouvelle catégorie"
					disabled={busy}
					maxlength={100}
					onkeydown={(e) => {
						if (e.key === 'Enter') submitNew();
					}}
				/>
				<Button onclick={submitNew} disabled={busy || !newName.trim()}>
					<Plus class="size-4" />
					Ajouter
				</Button>
			</div>
		</div>

		<DialogFooter>
			<Button onclick={() => onOpenChange(false)} disabled={busy}>Fermer</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
