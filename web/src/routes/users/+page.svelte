<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import DataTable from '$lib/components/tables/DataTable.svelte';
	import DataTableToolbar from '$lib/components/tables/DataTableToolbar.svelte';
	import DataTablePagination from '$lib/components/tables/DataTablePagination.svelte';
	import UserStatusBadge from '$lib/components/users/UserStatusBadge.svelte';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { queryKeys } from '$lib/query/queryKeys';
	import { userListResponseSchema, type UserListParams } from '$lib/schemas/user';
	import type { UserDTO } from '$lib/schemas/user';
	import type { DataTableColumn } from '$lib/components/tables/types';
	import Users from '@lucide/svelte/icons/users';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	let searchInput = $state<string>(data.params.search ?? '');
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function commitSearch(value: string) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const url = new URL(page.url);
			if (value) url.searchParams.set('q', value);
			else url.searchParams.delete('q');
			url.searchParams.delete('page');
			goto(url, { keepFocus: true, noScroll: true, replaceState: true });
		}, 300);
	}

	function changePage(next: number) {
		const url = new URL(page.url);
		if (next > 0) url.searchParams.set('page', String(next));
		else url.searchParams.delete('page');
		goto(url, { noScroll: false });
	}

	const params: UserListParams = $derived(data.params);

	const usersQuery = createQuery(() => ({
		queryKey: queryKeys.users.list(params),
		queryFn: async () => {
			const qs = new URLSearchParams();
			if (params.search) qs.set('search', params.search);
			if (params.first !== undefined) qs.set('first', String(params.first));
			if (params.max_results !== undefined) qs.set('max_results', String(params.max_results));
			const res = await fetch(`/api/users?${qs.toString()}`);
			if (!res.ok) throw new Error(`Failed to load users: ${res.status}`);
			const json = await res.json();
			return userListResponseSchema.parse(json);
		},
		initialData: data.users,
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
		{
			key: 'username',
			header: 'Identifiant',
			cellClass: 'font-mono text-xs text-muted-foreground',
		},
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

<PageHeader title="Users" description="Annuaire des membres du fablab et de leurs rôles." />

<div class="mt-6 space-y-4">
	<DataTableToolbar
		search={searchInput}
		searchPlaceholder="Rechercher par nom, email…"
		onSearchChange={(v) => {
			searchInput = v;
			commitSearch(v);
		}}
	/>

	<DataTable
		rows={usersQuery.data ?? []}
		{columns}
		rowKey={(u) => u.id}
		loading={usersQuery.isLoading}
		onRowClick={(u) => goto(`/users/${u.id}`)}
		emptyIcon={Users}
		emptyTitle="Aucun utilisateur"
		emptyDescription="Aucun utilisateur ne correspond à ta recherche."
	/>

	<DataTablePagination
		page={data.page}
		pageSize={data.pageSize}
		totalShown={(usersQuery.data ?? []).length}
		hasMore={(usersQuery.data ?? []).length === data.pageSize}
		onPageChange={changePage}
	/>
</div>
