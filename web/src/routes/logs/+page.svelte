<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import { z } from 'zod';
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import ErrorState from '$lib/components/primitives/ErrorState.svelte';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import LogTimeline from '$lib/components/logs/LogTimeline.svelte';
	import LogDetailSheet from '$lib/components/logs/LogDetailSheet.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import Activity from '@lucide/svelte/icons/activity';
	import Download from '@lucide/svelte/icons/download';
	import { queryKeys } from '$lib/query/queryKeys';
	import { accessLogSchema } from '$lib/api/logs';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const logsListSchema = z.array(accessLogSchema);
	type LogRow = z.infer<typeof accessLogSchema>;

	let selected = $state<LogRow | null>(null);
	let sheetOpen = $state(false);
	let lockerFilter = $derived(data.params.locker_id ? String(data.params.locker_id) : 'all');

	function changeLockerFilter(v: string) {
		const url = new URL(page.url);
		if (v && v !== 'all') url.searchParams.set('locker_id', v);
		else url.searchParams.delete('locker_id');
		goto(url, { noScroll: true });
	}

	const logsQuery = createInfiniteQuery(() => ({
		queryKey: queryKeys.logs.list({ limit: data.pageSize, locker_id: data.params.locker_id }),
		queryFn: async ({ pageParam }: { pageParam: number }) => {
			const qs = new URLSearchParams();
			qs.set('limit', String(data.pageSize));
			qs.set('skip', String(pageParam));
			if (data.params.locker_id !== undefined) qs.set('locker_id', String(data.params.locker_id));
			const res = await fetch(`/api/logs?${qs.toString()}`);
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return logsListSchema.parse(await res.json());
		},
		initialPageParam: 0,
		getNextPageParam: (last: LogRow[], pages: LogRow[][]) => {
			if (last.length < data.pageSize) return undefined;
			return pages.reduce((acc, p) => acc + p.length, 0);
		},
		initialData: { pages: [data.logs], pageParams: [0] },
	}));

	let rows = $derived((logsQuery.data?.pages ?? []).flat());

	function csvUrl(): string {
		const qs = new URLSearchParams();
		if (data.params.locker_id !== undefined) qs.set('locker_id', String(data.params.locker_id));
		const s = qs.toString();
		return s ? `/api/logs.csv?${s}` : '/api/logs.csv';
	}
</script>

<PageHeader title="Logs" description="Audit des tentatives d'ouverture des armoires.">
	{#snippet actions()}
		<Gated action={{ type: 'export_logs' }}>
			<Button variant="outline" onclick={() => (window.location.href = csvUrl())}>
				<Download class="size-4" />
				Exporter CSV
			</Button>
		</Gated>
	{/snippet}
</PageHeader>

<div class="mt-6 space-y-4">
	<div class="flex items-center gap-3">
		<Select type="single" value={lockerFilter} onValueChange={(v) => v && changeLockerFilter(v)}>
			<SelectTrigger class="w-56">
				{lockerFilter === 'all'
					? 'Toutes armoires'
					: (data.lockers.find((l) => String(l.id) === lockerFilter)?.locker_type ?? 'Armoire')}
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">Toutes armoires</SelectItem>
				{#each data.lockers as l (l.id)}
					<SelectItem value={String(l.id)}>{l.locker_type}</SelectItem>
				{/each}
			</SelectContent>
		</Select>
	</div>

	{#if logsQuery.isLoading && rows.length === 0}
		<LoadingState variant="skeleton-rows" rows={8} />
	{:else if logsQuery.isError}
		<ErrorState
			title="Impossible de charger l'audit"
			description={logsQuery.error?.message ?? ''}
			onRetry={() => logsQuery.refetch()}
		/>
	{:else if rows.length === 0}
		<EmptyState
			icon={Activity}
			title="Aucun événement"
			description="Aucun log ne correspond à ce filtre."
		/>
	{:else}
		<LogTimeline
			{rows}
			onSelect={(r) => {
				selected = r;
				sheetOpen = true;
			}}
		/>
		<div class="flex justify-center pt-2">
			<Button
				variant="outline"
				size="sm"
				disabled={!logsQuery.hasNextPage || logsQuery.isFetchingNextPage}
				onclick={() => logsQuery.fetchNextPage()}
			>
				{logsQuery.isFetchingNextPage
					? 'Chargement…'
					: logsQuery.hasNextPage
						? 'Charger plus'
						: 'Fin de l\'historique'}
			</Button>
		</div>
	{/if}
</div>

<LogDetailSheet open={sheetOpen} row={selected} onOpenChange={(v) => (sheetOpen = v)} />
