<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { z } from 'zod';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import LogTimeline from '$lib/components/logs/LogTimeline.svelte';
	import Activity from '@lucide/svelte/icons/activity';
	import { accessLogSchema } from '$lib/api/logs';
	import { queryKeys } from '$lib/query/queryKeys';
	import { can } from '$lib/auth/permissions';
	import { page } from '$app/state';
	import type { UserContext } from '$lib/auth/types';

	interface Props {
		username: string;
	}
	let { username }: Props = $props();

	const logsListSchema = z.array(accessLogSchema);

	let user = $derived(page.data.user as UserContext | null);
	let canSee = $derived(can(user, { type: 'view_logs' }));

	const myLogsQuery = createQuery(() => ({
		queryKey: [...queryKeys.logs.all(), 'mine', username] as const,
		queryFn: async () => {
			const res = await fetch('/api/logs?limit=100');
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			const all = logsListSchema.parse(await res.json());
			return all.filter((l) => l.username === username).slice(0, 20);
		},
		enabled: canSee,
	}));
</script>

<section class="space-y-2">
	<h2 class="text-lg font-semibold">Mon activité</h2>
	{#if !canSee}
		<EmptyState
			icon={Activity}
			title="Accès restreint"
			description="L'historique d'accès requiert la capacité audit_log_full ou le tier T0."
		/>
	{:else if myLogsQuery.isLoading}
		<LoadingState variant="skeleton-rows" rows={4} />
	{:else if myLogsQuery.isError || (myLogsQuery.data ?? []).length === 0}
		<p class="text-sm text-muted-foreground">Aucune activité enregistrée.</p>
	{:else}
		<LogTimeline rows={myLogsQuery.data ?? []} onSelect={() => {}} />
	{/if}
</section>
