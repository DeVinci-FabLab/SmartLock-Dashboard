<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import RoleBadge from '$lib/components/primitives/RoleBadge.svelte';
	import RoleFlagBadges from '$lib/components/roles/RoleFlagBadges.svelte';
	import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let role = $derived(data.role);

	let currentTab = $derived.by(() => {
		const segments = page.url.pathname.split('/').filter(Boolean);
		const last = segments[segments.length - 1];
		return last === role.name ? 'permissions' : last;
	});
</script>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<Button variant="ghost" size="sm" onclick={() => goto('/roles')}>
			<ArrowLeft class="size-4" />
			<span>Retour</span>
		</Button>
	</div>

	<PageHeader
		title={role.label}
		description={role.is_system ? 'Rôle système (immuable)' : 'Rôle custom'}
	>
		{#snippet actions()}
			<RoleBadge tier={role.tier} />
		{/snippet}
	</PageHeader>

	<div class="text-xs text-muted-foreground font-mono">{role.name}</div>

	<RoleFlagBadges {role} />

	<Tabs
		value={currentTab}
		onValueChange={(v) => goto(`/roles/${role.name}/${v}`, { replaceState: true })}
	>
		<TabsList>
			<TabsTrigger value="permissions">Permissions</TabsTrigger>
			<TabsTrigger value="users">Users</TabsTrigger>
			<TabsTrigger value="settings">Settings</TabsTrigger>
		</TabsList>
	</Tabs>

	{@render children()}
</div>
