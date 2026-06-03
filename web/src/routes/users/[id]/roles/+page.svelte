<script lang="ts">
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import Shield from '@lucide/svelte/icons/shield';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import AssignRoleDialog from '$lib/components/users/AssignRoleDialog.svelte';
	import RevokeUserDialog from '$lib/components/users/RevokeUserDialog.svelte';
	import { queryKeys } from '$lib/query/queryKeys';
	import { invalidate } from '$app/navigation';
	import type { LayoutData } from '../$types';

	let { data }: { data: LayoutData } = $props();

	const qc = useQueryClient();
	let assignOpen = $state(false);
	let revokeTarget = $state<string | null>(null);

	const userRolesQuery = createQuery(() => ({
		queryKey: ['users', data.targetUser.id, 'roles'] as const,
		queryFn: async (): Promise<string[]> => {
			const res = await fetch(`/api/users/${data.targetUser.id}/roles`);
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return res.json();
		},
	}));

	const assignMutation = createMutation(() => ({
		mutationFn: async (roleName: string) => {
			const res = await fetch(
				`/api/users/${data.targetUser.id}/roles/${encodeURIComponent(roleName)}`,
				{ method: 'POST' },
			);
			if (!res.ok && res.status !== 204) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
		},
		onSuccess: async (_data, roleName) => {
			toast.success(`Rôle "${roleName}" assigné.`);
			assignOpen = false;
			qc.invalidateQueries({ queryKey: ['users', data.targetUser.id, 'roles'] });
			qc.invalidateQueries({ queryKey: queryKeys.users.detail(data.targetUser.id) });
			await invalidate(`users:${data.targetUser.id}`);
		},
		onError: (err: Error) => toast.error(err.message),
	}));

	const revokeMutation = createMutation(() => ({
		mutationFn: async (roleName: string) => {
			const res = await fetch(
				`/api/users/${data.targetUser.id}/roles/${encodeURIComponent(roleName)}`,
				{ method: 'DELETE' },
			);
			if (!res.ok && res.status !== 204) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
		},
		onSuccess: async (_data, roleName) => {
			toast.success(`Rôle "${roleName}" révoqué.`);
			revokeTarget = null;
			qc.invalidateQueries({ queryKey: ['users', data.targetUser.id, 'roles'] });
			qc.invalidateQueries({ queryKey: queryKeys.users.detail(data.targetUser.id) });
			await invalidate(`users:${data.targetUser.id}`);
		},
		onError: (err: Error) => toast.error(err.message),
	}));

	let assignedRoles = $derived(userRolesQuery.data ?? []);
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-lg font-semibold">Rôles assignés</h2>
			<p class="text-sm text-muted-foreground">
				Les rôles donnent accès aux armoires selon la matrice de permissions.
			</p>
		</div>
		<Gated action={{ type: 'manage_users' }}>
			<Button onclick={() => (assignOpen = true)}>
				<Plus class="size-4" />
				Assigner un rôle
			</Button>
		</Gated>
	</div>

	{#if userRolesQuery.isLoading}
		<LoadingState variant="skeleton-rows" rows={3} />
	{:else if assignedRoles.length === 0}
		<EmptyState
			icon={Shield}
			title="Aucun rôle assigné"
			description="Cet utilisateur n'a accès à aucune armoire. Assigne-lui un rôle pour commencer."
		/>
	{:else}
		<ul class="space-y-2">
			{#each assignedRoles as role (role)}
				<li class="flex items-center justify-between rounded-md border border-border p-3">
					<Badge class="font-mono">{role}</Badge>
					<Gated action={{ type: 'manage_users' }}>
						<Button variant="ghost" size="sm" onclick={() => (revokeTarget = role)}>
							<X class="size-4" />
							Révoquer
						</Button>
					</Gated>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<AssignRoleDialog
	open={assignOpen}
	groups={data.groups}
	busy={assignMutation.isPending}
	onOpenChange={(v) => (assignOpen = v)}
	onSubmit={(roleName) => assignMutation.mutate(roleName)}
/>

<RevokeUserDialog
	open={revokeTarget !== null}
	roleName={revokeTarget ?? ''}
	busy={revokeMutation.isPending}
	onOpenChange={(v) => (revokeTarget = v ? revokeTarget : null)}
	onConfirm={() => revokeTarget && revokeMutation.mutate(revokeTarget)}
/>
