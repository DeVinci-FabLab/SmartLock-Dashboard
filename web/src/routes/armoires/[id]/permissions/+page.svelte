<script lang="ts">
	import { page } from '$app/state';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import LockerPermissionMatrix from '$lib/components/armoires/LockerPermissionMatrix.svelte';
	import type { LockerMatrixRow } from '$lib/components/armoires/LockerPermissionMatrix.svelte';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import ErrorState from '$lib/components/primitives/ErrorState.svelte';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import Shield from '@lucide/svelte/icons/shield';
	import { queryKeys } from '$lib/query/queryKeys';
	import { can } from '$lib/auth/permissions';
	import type { PermissionLevel, UserContext } from '$lib/auth/types';
	import type { LayoutData } from '../$types';

	let { data }: { data: LayoutData } = $props();

	const qc = useQueryClient();
	let busyRoles = $state<Set<string>>(new Set());

	let user = $derived(page.data.user as UserContext | null);
	let canManage = $derived(can(user, { type: 'manage_armoire_permissions' }));

	const matrixQuery = createQuery(() => ({
		queryKey: queryKeys.armoires.permissions(data.armoire.id),
		queryFn: async (): Promise<LockerMatrixRow[]> => {
			const res = await fetch(`/api/lockers/${data.armoire.id}/permissions`);
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return res.json();
		},
	}));

	const upsertMutation = createMutation(() => ({
		mutationFn: async ({
			roleName,
			level,
		}: {
			roleName: string;
			level: PermissionLevel;
		}) => {
			const url = `/api/lockers/${data.armoire.id}/permissions/${encodeURIComponent(roleName)}`;
			if (level === 'none') {
				const res = await fetch(url, { method: 'DELETE' });
				if (!res.ok && res.status !== 204) {
					const body = await res.json().catch(() => ({ message: res.statusText }));
					throw new Error(body.message ?? `Échec : ${res.status}`);
				}
				return;
			}
			const res = await fetch(url, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ level }),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
		},
		onMutate: ({ roleName }) => {
			busyRoles = new Set([...busyRoles, roleName]);
		},
		onSettled: (_d, _e, vars) => {
			const next = new Set(busyRoles);
			next.delete(vars.roleName);
			busyRoles = next;
			qc.invalidateQueries({ queryKey: queryKeys.armoires.permissions(data.armoire.id) });
		},
		onError: (e: Error) => toast.error(e.message),
	}));

	function handleChange(roleName: string, level: PermissionLevel) {
		upsertMutation.mutate({ roleName, level });
	}
</script>

{#snippet readOnlyMatrix()}
	<LockerPermissionMatrix
		rows={matrixQuery.data ?? []}
		disabled
		busyRoles={new Set()}
		onChange={() => {}}
	/>
{/snippet}

<div class="space-y-4">
	<div>
		<h2 class="text-lg font-semibold">Qui peut accéder à cette armoire ?</h2>
		<p class="text-sm text-muted-foreground">
			Vue inverse : un rôle par ligne. Bascule la permission pour autoriser, ouvrir ou éditer le stock.
		</p>
	</div>

	{#if matrixQuery.isLoading}
		<LoadingState variant="skeleton-rows" rows={6} />
	{:else if matrixQuery.isError}
		<ErrorState
			title="Impossible de charger les permissions"
			description={matrixQuery.error?.message ?? ''}
			onRetry={() => matrixQuery.refetch()}
		/>
	{:else if (matrixQuery.data ?? []).length === 0}
		<EmptyState
			icon={Shield}
			title="Aucun rôle"
			description="Aucun rôle n'est défini. Crée des rôles depuis la page Roles."
		/>
	{:else}
		<Gated action={{ type: 'manage_armoire_permissions' }} fallback={readOnlyMatrix}>
			<LockerPermissionMatrix
				rows={matrixQuery.data ?? []}
				disabled={!canManage}
				{busyRoles}
				onChange={handleChange}
			/>
		</Gated>
	{/if}
</div>
