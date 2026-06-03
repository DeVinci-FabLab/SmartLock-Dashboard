<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import Users from '@lucide/svelte/icons/users';
	import { goto } from '$app/navigation';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import UserStatusBadge from '$lib/components/users/UserStatusBadge.svelte';
	import DataTable from '$lib/components/tables/DataTable.svelte';
	import type { DataTableColumn } from '$lib/components/tables/types';
	import type { UserDTO } from '$lib/schemas/user';
	import type { LayoutData } from '../$types';

	let { data }: { data: LayoutData } = $props();

	const usersQuery = createQuery(() => ({
		queryKey: ['roles', data.role.name, 'users'] as const,
		queryFn: async (): Promise<UserDTO[]> => {
			const res = await fetch(`/api/roles/${encodeURIComponent(data.role.name)}/users`);
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return res.json();
		},
	}));

	function initials(u: UserDTO): string {
		const first = u.firstName ?? u.username;
		const last = u.lastName ?? '';
		return `${first[0] ?? '?'}${last[0] ?? ''}`.toUpperCase();
	}

	function displayName(u: UserDTO): string {
		const composed = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
		return composed || u.username;
	}

	const columns: DataTableColumn<UserDTO>[] = [
		{ key: 'name', header: 'Utilisateur', cell: nameCell },
		{ key: 'email', header: 'Email', cellClass: 'text-muted-foreground' },
		{ key: 'status', header: 'Statut', cell: statusCell, headerClass: 'w-32' },
	];
</script>

{#snippet nameCell(u: UserDTO)}
	<div class="flex items-center gap-3">
		<Avatar class="h-7 w-7">
			<AvatarFallback class="text-xs">{initials(u)}</AvatarFallback>
		</Avatar>
		<span class="font-medium">{displayName(u)}</span>
	</div>
{/snippet}

{#snippet statusCell(u: UserDTO)}
	<UserStatusBadge enabled={u.enabled} />
{/snippet}

<div class="space-y-4">
	<div>
		<h2 class="text-lg font-semibold">Utilisateurs avec ce rôle</h2>
		<p class="text-sm text-muted-foreground">
			Vue inverse — backend ne supporte pas encore le filtre par rôle, liste vide attendue jusqu'à
			ce que l'endpoint soit livré.
		</p>
	</div>

	{#if usersQuery.isLoading}
		<LoadingState variant="skeleton-rows" rows={4} />
	{:else if (usersQuery.data ?? []).length === 0}
		<EmptyState
			icon={Users}
			title="Aucun utilisateur"
			description="Aucun utilisateur n'est assigné à ce rôle (ou le backend ne filtre pas encore par rôle)."
		/>
	{:else}
		<DataTable
			rows={usersQuery.data ?? []}
			{columns}
			rowKey={(u) => u.id}
			onRowClick={(u) => goto(`/users/${u.id}`)}
		/>
	{/if}
</div>
