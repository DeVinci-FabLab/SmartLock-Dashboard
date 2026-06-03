<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Role } from '$lib/auth/types';

	interface Props {
		role: Role;
		showCapacities?: boolean;
	}

	let { role, showCapacities = false }: Props = $props();
</script>

<div class="flex flex-wrap items-center gap-1">
	{#if role.is_manager}
		<Badge class="bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 text-[10px]">
			manager
		</Badge>
	{/if}
	{#if role.is_role_admin}
		<Badge class="bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 text-[10px]">
			role_admin
		</Badge>
	{/if}
	{#if role.is_system}
		<Badge variant="outline" class="text-[10px]">système</Badge>
	{/if}
	{#if showCapacities}
		{#each role.capacities as cap (cap)}
			<Badge
				variant="secondary"
				class="font-mono text-[10px] bg-cyan-50 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200"
			>
				{cap}
			</Badge>
		{/each}
	{/if}
</div>
