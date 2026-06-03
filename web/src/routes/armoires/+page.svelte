<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import ArmoireCard from '$lib/components/armoires/ArmoireCard.svelte';
	import CreateArmoireSheet from '$lib/components/armoires/CreateArmoireSheet.svelte';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import Plus from '@lucide/svelte/icons/plus';
	import Lock from '@lucide/svelte/icons/lock';
	import { queryKeys } from '$lib/query/queryKeys';
	import type { ArmoireCreatePayload, ArmoireDTO } from '$lib/schemas/armoire';
	import type { PermissionLevel, UserContext } from '$lib/auth/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab = $state<'mine' | 'all'>('mine');
	let createOpen = $state(false);

	const qc = useQueryClient();

	let user = $derived(page.data.user as UserContext | null);

	function levelFor(armoireId: number): PermissionLevel {
		return user?.armoirePermissions.find((p) => p.armoire_id === armoireId)?.level ?? 'none';
	}

	let myArmoires = $derived(data.armoires.filter((a) => levelFor(a.id) !== 'none'));

	const createArmoireMutation = createMutation(() => ({
		mutationFn: async (payload: ArmoireCreatePayload) => {
			const res = await fetch('/api/lockers', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
			return res.json() as Promise<ArmoireDTO>;
		},
		onSuccess: async (created) => {
			toast.success(`Armoire "${created.locker_type}" créée.`);
			createOpen = false;
			qc.invalidateQueries({ queryKey: queryKeys.armoires.all() });
			await invalidate('armoires:list');
			goto(`/armoires/${created.id}`);
		},
		onError: (e: Error) => toast.error(e.message),
	}));
</script>

<PageHeader title="Armoires" description="Espaces de stockage gérés par le fablab.">
	{#snippet actions()}
		<Gated action={{ type: 'create_armoire' }}>
			<Button onclick={() => (createOpen = true)}>
				<Plus class="size-4" />
				Créer une armoire
			</Button>
		</Gated>
	{/snippet}
</PageHeader>

<div class="mt-6">
	<Tabs value={activeTab} onValueChange={(v) => (activeTab = v as 'mine' | 'all')}>
		<TabsList>
			<TabsTrigger value="mine">
				Mes accès
				<span class="ml-1.5 text-muted-foreground tabular-nums">({myArmoires.length})</span>
			</TabsTrigger>
			<TabsTrigger value="all">
				Toutes
				<span class="ml-1.5 text-muted-foreground tabular-nums">({data.armoires.length})</span>
			</TabsTrigger>
		</TabsList>

		<TabsContent value="mine" class="mt-4">
			{#if myArmoires.length === 0}
				<EmptyState
					icon={Lock}
					title="Aucun accès"
					description="Tu n’as pas encore de permission sur une armoire. Demande l’assignation d’un rôle à un manager."
				/>
			{:else}
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each myArmoires as a (a.id)}
						<ArmoireCard armoire={a} myLevel={levelFor(a.id)} onClick={() => goto(`/armoires/${a.id}`)} />
					{/each}
				</div>
			{/if}
		</TabsContent>

		<TabsContent value="all" class="mt-4">
			{#if data.armoires.length === 0}
				<EmptyState
					icon={Lock}
					title="Aucune armoire"
					description="Le fablab ne référence pas encore d’armoire."
				/>
			{:else}
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.armoires as a (a.id)}
						<ArmoireCard armoire={a} myLevel={levelFor(a.id)} onClick={() => goto(`/armoires/${a.id}`)} />
					{/each}
				</div>
			{/if}
		</TabsContent>
	</Tabs>
</div>

<CreateArmoireSheet
	open={createOpen}
	mode="create"
	busy={createArmoireMutation.isPending}
	onOpenChange={(v) => (createOpen = v)}
	onSubmit={(payload) => createArmoireMutation.mutate(payload)}
/>
