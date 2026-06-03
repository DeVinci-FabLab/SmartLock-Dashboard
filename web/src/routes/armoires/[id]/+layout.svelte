<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	let armoire = $derived(data.armoire);

	let currentTab = $derived.by(() => {
		const segments = page.url.pathname.split('/').filter(Boolean);
		const last = segments[segments.length - 1];
		return last === String(armoire.id) ? 'stock' : last;
	});
</script>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<Button variant="ghost" size="sm" onclick={() => goto('/armoires')}>
			<ArrowLeft class="size-4" />
			<span>Retour</span>
		</Button>
	</div>

	<PageHeader
		title={armoire.locker_type}
		description={`Armoire #${armoire.id}`}
	>
		{#snippet actions()}
			{#if !armoire.is_active}
				<Badge variant="outline">Inactive</Badge>
			{:else}
				<Badge>Active</Badge>
			{/if}
		{/snippet}
	</PageHeader>

	<Tabs
		value={currentTab}
		onValueChange={(v) => goto(`/armoires/${armoire.id}/${v}`, { replaceState: true })}
	>
		<TabsList>
			<TabsTrigger value="stock">Stock</TabsTrigger>
			<TabsTrigger value="permissions">Permissions</TabsTrigger>
			<TabsTrigger value="activity">Activité</TabsTrigger>
			<TabsTrigger value="settings">Paramètres</TabsTrigger>
		</TabsList>
	</Tabs>

	{@render children()}
</div>
