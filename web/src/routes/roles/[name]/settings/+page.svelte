<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import DeleteRoleDialog from '$lib/components/roles/DeleteRoleDialog.svelte';
	import RoleFlagBadges from '$lib/components/roles/RoleFlagBadges.svelte';
	import { tierLabel } from '$lib/auth/tiers';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import type { LayoutData } from '../$types';

	let { data }: { data: LayoutData } = $props();

	let deleteOpen = $state(false);
	let deleting = $state(false);

	async function handleDelete() {
		deleting = true;
		try {
			const res = await fetch(`/api/roles/${encodeURIComponent(data.role.name)}`, {
				method: 'DELETE',
			});
			if (!res.ok) {
				if (res.status === 409) {
					toast.error(
						"Ce rôle est encore assigné à au moins un utilisateur. Révoque-le d'abord ou demande à la Présidence un cascade delete.",
					);
				} else {
					const body = await res.json().catch(() => ({ message: res.statusText }));
					toast.error(body.message ?? `Échec : ${res.status}`);
				}
				return;
			}
			toast.success(`Rôle "${data.role.name}" supprimé.`);
			deleteOpen = false;
			goto('/roles');
		} catch (e) {
			toast.error((e as Error).message);
		} finally {
			deleting = false;
		}
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-lg font-semibold">Paramètres</h2>
		<p class="text-sm text-muted-foreground">
			{data.role.is_system
				? 'Rôle système — métadonnées en lecture seule.'
				: 'Configuration du rôle custom.'}
		</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 max-w-2xl">
		<div class="space-y-2">
			<Label for="role-name">Nom technique</Label>
			<Input id="role-name" value={data.role.name} disabled class="font-mono" />
		</div>
		<div class="space-y-2">
			<Label for="role-tier">Tier</Label>
			<Input id="role-tier" value={tierLabel(data.role.tier)} disabled />
		</div>
		<div class="space-y-2 sm:col-span-2">
			<Label for="role-label">Libellé</Label>
			<Input id="role-label" value={data.role.label} disabled />
		</div>
	</div>

	<div class="space-y-2 max-w-2xl">
		<Label>Flags + capacités</Label>
		<RoleFlagBadges role={data.role} showCapacities />
	</div>

	{#if !data.role.is_system}
		<Gated action={{ type: 'manage_roles' }}>
			<div class="border-t border-border pt-6 max-w-2xl">
				<div class="rounded-md border border-destructive/40 bg-destructive/5 p-4 space-y-2">
					<h3 class="font-semibold text-destructive">Zone dangereuse</h3>
					<p class="text-sm text-muted-foreground">
						Supprimer ce rôle retire son accès à tous les utilisateurs et armoires concernées.
					</p>
					<Button
						variant="destructive"
						size="sm"
						onclick={() => (deleteOpen = true)}
						class="mt-1"
					>
						<Trash2 class="size-4" />
						Supprimer ce rôle
					</Button>
				</div>
			</div>
		</Gated>
	{/if}
</div>

<DeleteRoleDialog
	open={deleteOpen}
	roleName={data.role.name}
	busy={deleting}
	onOpenChange={(v) => (deleteOpen = v)}
	onConfirm={handleDelete}
/>
