<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import Users from '@lucide/svelte/icons/users';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { queryKeys } from '$lib/query/queryKeys';
	import { userListResponseSchema } from '$lib/schemas/user';

	const noRolesQuery = createQuery(() => ({
		queryKey: queryKeys.home.usersToAttribute(),
		queryFn: async () => {
			const res = await fetch('/api/users/no-roles');
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return userListResponseSchema.parse(await res.json());
		},
	}));
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between">
			<CardTitle class="text-base flex items-center gap-2">
				<Users class="size-4" />
				Users à attribuer
			</CardTitle>
			<Button variant="ghost" size="sm" onclick={() => goto('/users')}>
				Tout voir
				<ArrowRight class="size-4" />
			</Button>
		</div>
	</CardHeader>
	<CardContent>
		{#if noRolesQuery.isLoading}
			<LoadingState variant="skeleton-rows" rows={3} />
		{:else if noRolesQuery.isError || (noRolesQuery.data ?? []).length === 0}
			<p class="text-sm text-muted-foreground">Tous les users ont au moins un rôle.</p>
		{:else}
			<ul class="space-y-1.5">
				{#each noRolesQuery.data ?? [] as u (u.id)}
					<li>
						<button
							type="button"
							class="w-full flex items-center justify-between text-sm rounded-md px-2 py-1.5 hover:bg-muted/50"
							onclick={() => goto(`/users/${u.id}`)}
						>
							<span class="font-medium truncate">{u.firstName ?? u.username} {u.lastName ?? ''}</span>
							<span class="text-xs text-muted-foreground font-mono">{u.username}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</CardContent>
</Card>
