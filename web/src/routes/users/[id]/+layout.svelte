<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import UserStatusBadge from '$lib/components/users/UserStatusBadge.svelte';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let u = $derived(data.targetUser);
	let initials = $derived(
		(u.firstName?.[0] ?? u.username[0] ?? '?').toUpperCase() +
			(u.lastName?.[0] ?? '').toUpperCase(),
	);
	let displayName = $derived(`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username);

	let currentTab = $derived.by(() => {
		const segments = page.url.pathname.split('/').filter(Boolean);
		const last = segments[segments.length - 1];
		return last === u.id ? 'roles' : last;
	});
</script>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<Button variant="ghost" size="sm" onclick={() => goto('/users')}>
			<ArrowLeft class="size-4" />
			<span>Retour</span>
		</Button>
	</div>

	<PageHeader title={displayName} description={u.email}>
		{#snippet actions()}
			<UserStatusBadge enabled={u.enabled} />
		{/snippet}
	</PageHeader>

	<div class="flex items-center gap-4">
		<Avatar class="size-12">
			<AvatarFallback>{initials}</AvatarFallback>
		</Avatar>
		<div class="text-sm text-muted-foreground">
			<div>
				<span class="font-medium text-foreground">Identifiant&nbsp;:</span>
				<span class="font-mono">{u.username}</span>
			</div>
			<div class="font-mono text-xs">ID Keycloak&nbsp;: {u.id}</div>
		</div>
	</div>

	<Tabs
		value={currentTab}
		onValueChange={(v) => goto(`/users/${u.id}/${v}`, { replaceState: true })}
	>
		<TabsList>
			<TabsTrigger value="roles">Rôles</TabsTrigger>
			<TabsTrigger value="activity">Activité</TabsTrigger>
			<TabsTrigger value="sessions">Sessions</TabsTrigger>
		</TabsList>
	</Tabs>

	{@render children()}
</div>
