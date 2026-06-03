<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { z } from 'zod';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import LogTimeline from '$lib/components/logs/LogTimeline.svelte';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { queryKeys } from '$lib/query/queryKeys';
	import { accessLogSchema } from '$lib/api/logs';

	const logsListSchema = z.array(accessLogSchema);

	const anomaliesQuery = createQuery(() => ({
		queryKey: queryKeys.home.anomalies(),
		queryFn: async () => {
			const res = await fetch('/api/logs?limit=100');
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			const all = logsListSchema.parse(await res.json());
			return all.filter((l) => l.result === 'denied').slice(0, 5);
		},
	}));
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between">
			<CardTitle class="text-base flex items-center gap-2">
				<AlertTriangle class="size-4" />
				Anomalies
			</CardTitle>
			<Button variant="ghost" size="sm" onclick={() => goto('/logs')}>
				Tout voir
				<ArrowRight class="size-4" />
			</Button>
		</div>
	</CardHeader>
	<CardContent>
		{#if anomaliesQuery.isLoading}
			<LoadingState variant="skeleton-rows" rows={3} />
		{:else if anomaliesQuery.isError || (anomaliesQuery.data ?? []).length === 0}
			<p class="text-sm text-muted-foreground">Aucune anomalie récente.</p>
		{:else}
			<LogTimeline rows={anomaliesQuery.data ?? []} onSelect={() => goto('/logs')} />
		{/if}
	</CardContent>
</Card>
