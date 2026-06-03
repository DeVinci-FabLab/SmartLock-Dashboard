<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import CreateArmoireSheet from '$lib/components/armoires/CreateArmoireSheet.svelte';
	import DeleteArmoireDialog from '$lib/components/armoires/DeleteArmoireDialog.svelte';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';
	import { queryKeys } from '$lib/query/queryKeys';
	import type { ArmoireCreatePayload } from '$lib/schemas/armoire';
	import type { LayoutData } from '../$types';

	let { data }: { data: LayoutData } = $props();

	const qc = useQueryClient();
	let editOpen = $state(false);
	let deleteOpen = $state(false);

	const editMutation = createMutation(() => ({
		mutationFn: async (payload: ArmoireCreatePayload) => {
			const res = await fetch(`/api/lockers/${data.armoire.id}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
		},
		onSuccess: async () => {
			toast.success('Armoire mise à jour.');
			editOpen = false;
			qc.invalidateQueries({ queryKey: queryKeys.armoires.all() });
			await invalidate(`armoires:${data.armoire.id}`);
		},
		onError: (e: Error) => toast.error(e.message),
	}));

	const deleteMutation = createMutation(() => ({
		mutationFn: async () => {
			const res = await fetch(`/api/lockers/${data.armoire.id}`, { method: 'DELETE' });
			if (!res.ok && res.status !== 204) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
		},
		onSuccess: async () => {
			toast.success(`Armoire "${data.armoire.locker_type}" supprimée.`);
			deleteOpen = false;
			qc.invalidateQueries({ queryKey: queryKeys.armoires.all() });
			goto('/armoires');
		},
		onError: (e: Error) => toast.error(e.message),
	}));
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-lg font-semibold">Paramètres</h2>
		<p class="text-sm text-muted-foreground">Métadonnées de l'armoire.</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 max-w-2xl">
		<div class="space-y-2">
			<Label for="armoire-id-disp">Identifiant</Label>
			<Input id="armoire-id-disp" value={String(data.armoire.id)} disabled class="font-mono" />
		</div>
		<div class="space-y-2">
			<Label for="armoire-state">État</Label>
			<Input
				id="armoire-state"
				value={data.armoire.is_active ? 'Active' : 'Inactive'}
				disabled
			/>
		</div>
		<div class="space-y-2 sm:col-span-2">
			<Label for="armoire-label-disp">Libellé</Label>
			<Input id="armoire-label-disp" value={data.armoire.locker_type} disabled />
		</div>
	</div>

	<Gated action={{ type: 'create_armoire' }}>
		<div class="max-w-2xl">
			<Button variant="outline" size="sm" onclick={() => (editOpen = true)}>
				<Pencil class="size-4" />
				Modifier
			</Button>
		</div>
	</Gated>

	<Gated action={{ type: 'delete_armoire' }}>
		<div class="border-t border-border pt-6 max-w-2xl">
			<div class="rounded-md border border-destructive/40 bg-destructive/5 p-4 space-y-2">
				<h3 class="font-semibold text-destructive">Zone dangereuse</h3>
				<p class="text-sm text-muted-foreground">
					Supprimer cette armoire efface ses entrées de stock et toutes ses permissions associées.
				</p>
				<Button
					variant="destructive"
					size="sm"
					onclick={() => (deleteOpen = true)}
					class="mt-1"
				>
					<Trash2 class="size-4" />
					Supprimer cette armoire
				</Button>
			</div>
		</div>
	</Gated>
</div>

<CreateArmoireSheet
	open={editOpen}
	mode="edit"
	initial={data.armoire}
	busy={editMutation.isPending}
	onOpenChange={(v) => (editOpen = v)}
	onSubmit={(payload) => editMutation.mutate(payload)}
/>

<DeleteArmoireDialog
	open={deleteOpen}
	armoireLabel={data.armoire.locker_type}
	busy={deleteMutation.isPending}
	onOpenChange={(v) => (deleteOpen = v)}
	onConfirm={() => deleteMutation.mutate()}
/>
