<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { z } from 'zod';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import LogTimeline from '$lib/components/logs/LogTimeline.svelte';
	import Activity from '@lucide/svelte/icons/activity';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { queryKeys } from '$lib/query/queryKeys';
	import { accessLogSchema } from '$lib/api/logs';

	const logsListSchema = z.array(accessLogSchema);

	const recentQuery = createQuery(() => ({
		queryKey: queryKeys.home.recentActivity(),
		queryFn: async () => {
			const res = await fetch('/api/logs?limit=10');
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return logsListSchema.parse(await res.json());
		},
	}));
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between">
			<CardTitle class="text-base flex items-center gap-2">
				<Activity class="size-4" />
				Activité récente
			</CardTitle>
			<Button variant="ghost" size="sm" onclick={() => goto('/logs')}>
				Tout voir
				<ArrowRight class="size-4" />
			</Button>
		</div>
	</CardHeader>
	<CardContent>
		{#if recentQuery.isLoading}
			<LoadingState variant="skeleton-rows" rows={4} />
		{:else if recentQuery.isError || (recentQuery.data ?? []).length === 0}
			<p class="text-sm text-muted-foreground">Aucune activité récente.</p>
		{:else}
			<LogTimeline rows={recentQuery.data ?? []} onSelect={() => goto('/logs')} />
		{/if}
	</CardContent>
</Card>
