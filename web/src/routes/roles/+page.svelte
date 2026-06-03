<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import DataTable from '$lib/components/tables/DataTable.svelte';
	import RoleBadge from '$lib/components/primitives/RoleBadge.svelte';
	import RoleFlagBadges from '$lib/components/roles/RoleFlagBadges.svelte';
	import CreateRoleDialog from '$lib/components/roles/CreateRoleDialog.svelte';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Shield from '@lucide/svelte/icons/shield';
	import { highestTier } from '$lib/auth/permissions';
	import { queryKeys } from '$lib/query/queryKeys';
	import type { DataTableColumn } from '$lib/components/tables/types';
	import type { RoleDTO, RoleCreatePayload } from '$lib/schemas/role';
	import type { UserContext } from '$lib/auth/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab = $state<'system' | 'custom'>('system');
	let createOpen = $state(false);

	const qc = useQueryClient();

	let user = $derived(page.data.user as UserContext | null);
	let maxTier = $derived(user ? highestTier(user) : 5);

	let systemRoles = $derived(data.roles.filter((r) => r.is_system));
	let customRoles = $derived(data.roles.filter((r) => !r.is_system));

	const createRoleMutation = createMutation(() => ({
		mutationFn: async (payload: RoleCreatePayload) => {
			const res = await fetch('/api/roles', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({ message: res.statusText }));
				throw new Error(body.message ?? `Échec : ${res.status}`);
			}
			return res.json();
		},
		onSuccess: async (created: RoleDTO) => {
			toast.success(`Rôle "${created.name}" créé.`);
			createOpen = false;
			qc.invalidateQueries({ queryKey: queryKeys.roles.all() });
			await invalidate('roles:list');
			goto(`/roles/${created.name}`);
		},
		onError: (err: Error) => toast.error(err.message),
	}));

	const columns: DataTableColumn<RoleDTO>[] = [
		{ key: 'label', header: 'Libellé', cell: labelCell, cellClass: 'font-medium' },
		{ key: 'name', header: 'Nom', cell: nameCell, cellClass: 'font-mono text-xs' },
		{ key: 'tier', header: 'Tier', cell: tierCell, headerClass: 'w-20' },
		{ key: 'flags', header: 'Capacités', cell: flagsCell },
	];
</script>

{#snippet labelCell(r: RoleDTO)}
	<span>{r.label}</span>
{/snippet}

{#snippet nameCell(r: RoleDTO)}
	<span>{r.name}</span>
{/snippet}

{#snippet tierCell(r: RoleDTO)}
	<RoleBadge tier={r.tier} />
{/snippet}

{#snippet flagsCell(r: RoleDTO)}
	<RoleFlagBadges role={r} />
{/snippet}

<PageHeader title="Roles" description="Définit les capacités et les accès aux armoires.">
	{#snippet actions()}
		<Gated action={{ type: 'manage_roles' }}>
			<Button onclick={() => (createOpen = true)}>
				<Plus class="size-4" />
				Créer un rôle
			</Button>
		</Gated>
	{/snippet}
</PageHeader>

<div class="mt-6">
	<Tabs value={activeTab} onValueChange={(v) => (activeTab = v as 'system' | 'custom')}>
		<TabsList>
			<TabsTrigger value="system">
				Système <span class="ml-1.5 text-muted-foreground tabular-nums">({systemRoles.length})</span>
			</TabsTrigger>
			<TabsTrigger value="custom">
				Custom <span class="ml-1.5 text-muted-foreground tabular-nums">({customRoles.length})</span>
			</TabsTrigger>
		</TabsList>

		<TabsContent value="system" class="mt-4">
			<DataTable
				rows={systemRoles}
				{columns}
				rowKey={(r) => r.name}
				onRowClick={(r) => goto(`/roles/${r.name}`)}
				emptyIcon={Shield}
				emptyTitle="Aucun rôle système"
			/>
		</TabsContent>

		<TabsContent value="custom" class="mt-4">
			<DataTable
				rows={customRoles}
				{columns}
				rowKey={(r) => r.name}
				onRowClick={(r) => goto(`/roles/${r.name}`)}
				emptyIcon={Shield}
				emptyTitle="Aucun rôle custom"
				emptyDescription="Crée un rôle custom pour configurer des accès spécifiques."
			/>
		</TabsContent>
	</Tabs>
</div>

<CreateRoleDialog
	open={createOpen}
	busy={createRoleMutation.isPending}
	maxTier={maxTier}
	onOpenChange={(v) => (createOpen = v)}
	onSubmit={(payload) => createRoleMutation.mutate(payload)}
/>
