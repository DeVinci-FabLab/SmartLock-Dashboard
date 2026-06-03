<script lang="ts">
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import PermissionMatrix from '$lib/components/roles/PermissionMatrix.svelte';
	import type { MatrixRow } from '$lib/components/roles/PermissionMatrix.svelte';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import ErrorState from '$lib/components/primitives/ErrorState.svelte';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import Box from '@lucide/svelte/icons/box';
	import { queryKeys } from '$lib/query/queryKeys';
	import type { PermissionLevel, UserContext } from '$lib/auth/types';
	import { can } from '$lib/auth/permissions';
	import { page } from '$app/state';
	import type { LayoutData } from '../$types';

	let { data }: { data: LayoutData } = $props();

	const qc = useQueryClient();
	let busyIds = $state<Set<number>>(new Set());

	const matrixQuery = createQuery(() => ({
		queryKey: queryKeys.roles.permissions(data.role.name),
		queryFn: async (): Promise<MatrixRow[]> => {
			const res = await fetch(`/api/roles/${encodeURIComponent(data.role.name)}/permissions`);
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return res.json();
		},
	}));

	const upsertMutation = createMutation(() => ({
		mutationFn: async ({
			armoireId,
			level,
		}: {
			armoireId: number;
			level: PermissionLevel;
		}) => {
			const url = `/api/roles/${encodeURIComponent(data.role.name)}/permissions/${armoireId}`;
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
		onMutate: ({ armoireId }) => {
			busyIds = new Set([...busyIds, armoireId]);
		},
		onSettled: (_data, _err, vars) => {
			const next = new Set(busyIds);
			next.delete(vars.armoireId);
			busyIds = next;
			qc.invalidateQueries({ queryKey: queryKeys.roles.permissions(data.role.name) });
		},
		onError: (err: Error) => toast.error(err.message),
	}));

	function handleChange(armoireId: number, level: PermissionLevel) {
		upsertMutation.mutate({ armoireId, level });
	}

	let isDisabled = $derived(
		data.role.is_system || !can(page.data.user as UserContext | null, { type: 'manage_roles' }),
	);
</script>

{#snippet readOnlyMatrix()}
	<PermissionMatrix
		rows={matrixQuery.data ?? []}
		disabled
		busyIds={new Set()}
		onChange={() => {}}
	/>
{/snippet}

{#if data.role.is_system}
	<div
		class="rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-sm text-amber-900 dark:text-amber-200"
	>
		Rôle système — les permissions sont en lecture seule. Pour modifier, crée un rôle custom.
	</div>
{/if}

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
		icon={Box}
		title="Aucune armoire"
		description="Aucune armoire n'est configurée pour ce fablab. Crée-en une depuis la page Armoires (P2)."
	/>
{:else}
	<Gated action={{ type: 'manage_roles' }} fallback={readOnlyMatrix}>
		<PermissionMatrix
			rows={matrixQuery.data ?? []}
			disabled={isDisabled}
			{busyIds}
			onChange={handleChange}
		/>
	</Gated>
{/if}
