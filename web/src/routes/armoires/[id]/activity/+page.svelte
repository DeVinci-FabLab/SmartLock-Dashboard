<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { z } from 'zod';
	import { accessLogSchema } from '$lib/api/logs';
	import ActivityList from '$lib/components/armoires/ActivityList.svelte';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import ErrorState from '$lib/components/primitives/ErrorState.svelte';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import Activity from '@lucide/svelte/icons/activity';
	import { queryKeys } from '$lib/query/queryKeys';
	import { can } from '$lib/auth/permissions';
	import { page } from '$app/state';
	import type { UserContext } from '$lib/auth/types';
	import type { LayoutData } from '../$types';

	let { data }: { data: LayoutData } = $props();

	let user = $derived(page.data.user as UserContext | null);
	let canSee = $derived(can(user, { type: 'view_logs' }));

	const logsSchema = z.array(accessLogSchema);

	const logsQuery = createQuery(() => ({
		queryKey: queryKeys.armoires.logs(data.armoire.id),
		queryFn: async () => {
			const res = await fetch(`/api/lockers/${data.armoire.id}/logs?limit=100`);
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return logsSchema.parse(await res.json());
		},
		enabled: canSee,
	}));
</script>

{#if !canSee}
	<EmptyState
		icon={Activity}
		title="Accès restreint"
		description="L'historique d'accès requiert la capacité audit_log_full ou le tier T0."
	/>
{:else if logsQuery.isLoading}
	<LoadingState variant="skeleton-rows" rows={6} />
{:else if logsQuery.isError}
	<ErrorState
		title="Impossible de charger l'activité"
		description={logsQuery.error?.message ?? ''}
		onRetry={() => logsQuery.refetch()}
	/>
{:else if (logsQuery.data ?? []).length === 0}
	<EmptyState
		icon={Activity}
		title="Aucune activité"
		description="Aucun accès n'a été enregistré sur cette armoire."
	/>
{:else}
	<ActivityList rows={logsQuery.data ?? []} />
{/if}
