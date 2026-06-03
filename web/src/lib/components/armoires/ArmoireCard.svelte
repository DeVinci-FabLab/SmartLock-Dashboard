<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Lock from '@lucide/svelte/icons/lock';
	import type { ArmoireDTO } from '$lib/schemas/armoire';
	import type { PermissionLevel } from '$lib/auth/types';

	interface Props {
		armoire: ArmoireDTO;
		myLevel?: PermissionLevel;
		onClick: () => void;
	}

	let { armoire, myLevel, onClick }: Props = $props();

	const LEVEL_LABEL: Record<PermissionLevel, string> = {
		none: 'Aucun',
		can_view: 'Voir',
		can_open: 'Ouvrir',
		can_edit: 'Éditer',
	};
</script>

<button
	type="button"
	onclick={onClick}
	class="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
>
	<Card class="hover:bg-muted/40 transition-colors cursor-pointer">
		<CardHeader>
			<div class="flex items-start justify-between gap-2">
				<div class="flex items-center gap-2">
					<Lock class="size-4 text-muted-foreground" />
					<CardTitle class="text-base font-medium">{armoire.locker_type}</CardTitle>
				</div>
				{#if !armoire.is_active}
					<Badge variant="outline" class="text-[10px]">Inactive</Badge>
				{/if}
			</div>
		</CardHeader>
		<CardContent class="text-sm text-muted-foreground flex items-center justify-between">
			<span class="font-mono text-xs">#{armoire.id}</span>
			{#if myLevel && myLevel !== 'none'}
				<Badge variant="secondary">{LEVEL_LABEL[myLevel]}</Badge>
			{/if}
		</CardContent>
	</Card>
</button>
