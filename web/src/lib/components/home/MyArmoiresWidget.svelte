<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import Lock from '@lucide/svelte/icons/lock';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { PermissionLevel, UserContext } from '$lib/auth/types';
	import type { ArmoireDTO } from '$lib/schemas/armoire';

	interface Props {
		user: UserContext;
		armoires: ArmoireDTO[];
	}
	let { user, armoires }: Props = $props();

	const LEVEL_LABEL: Record<PermissionLevel, string> = {
		none: 'Aucun',
		can_view: 'Voir',
		can_open: 'Ouvrir',
		can_edit: 'Éditer',
	};

	let mine = $derived(
		user.armoirePermissions
			.map((p) => ({
				armoire: armoires.find((a) => a.id === p.armoire_id),
				level: p.level as PermissionLevel,
			}))
			.filter((r): r is { armoire: ArmoireDTO; level: PermissionLevel } => !!r.armoire)
			.slice(0, 5),
	);
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between">
			<CardTitle class="text-base flex items-center gap-2">
				<Lock class="size-4" />
				Mes armoires
			</CardTitle>
			<Button variant="ghost" size="sm" onclick={() => goto('/armoires')}>
				Tout voir
				<ArrowRight class="size-4" />
			</Button>
		</div>
	</CardHeader>
	<CardContent>
		{#if mine.length === 0}
			<p class="text-sm text-muted-foreground">
				Tu n'as pas encore d'accès personnel. Une fois que tu en auras, ils apparaîtront ici.
			</p>
		{:else}
			<ul class="space-y-1.5">
				{#each mine as row (row.armoire.id)}
					<li>
						<button
							type="button"
							class="w-full flex items-center justify-between text-sm rounded-md px-2 py-1.5 hover:bg-muted/50"
							onclick={() => goto(`/armoires/${row.armoire.id}`)}
						>
							<span class="font-medium">{row.armoire.locker_type}</span>
							<span class="text-xs text-muted-foreground">{LEVEL_LABEL[row.level]}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</CardContent>
</Card>
