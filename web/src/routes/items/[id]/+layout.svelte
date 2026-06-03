<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	let item = $derived(data.item);

	let currentTab = $derived.by(() => {
		const segments = page.url.pathname.split('/').filter(Boolean);
		const last = segments[segments.length - 1];
		return last === String(item.id) ? 'details' : last;
	});
</script>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<Button variant="ghost" size="sm" onclick={() => goto('/items')}>
			<ArrowLeft class="size-4" />
			<span>Retour</span>
		</Button>
	</div>

	<PageHeader title={item.name} description={`Référence ${item.reference}`} />

	<Tabs
		value={currentTab}
		onValueChange={(v) => goto(`/items/${item.id}/${v}`, { replaceState: true })}
	>
		<TabsList>
			<TabsTrigger value="details">Détails</TabsTrigger>
			<TabsTrigger value="stocks">Stocks</TabsTrigger>
		</TabsList>
	</Tabs>

	{@render children()}
</div>
