<script lang="ts">
	import { page } from '$app/state';
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import RoleBadge from '$lib/components/primitives/RoleBadge.svelte';
	import type { UserContext } from '$lib/auth/types';

	let user = $derived(page.data.user as UserContext | null);
</script>

<PageHeader title="Profile" description="Tes informations Keycloak (stub P0)." />

{#if user}
	<div class="mt-6 space-y-2 text-sm">
		<div><span class="font-medium">Nom :</span> {user.displayName}</div>
		<div><span class="font-medium">Email :</span> {user.email}</div>
		<div>
			<span class="font-medium">Username :</span>
			<span class="font-mono">{user.username}</span>
		</div>
		<div class="flex items-center gap-2 flex-wrap">
			<span class="font-medium">Rôles :</span>
			{#each user.roles as r (r.name)}
				<RoleBadge tier={r.tier} label={r.name} />
			{/each}
		</div>
	</div>
{/if}
