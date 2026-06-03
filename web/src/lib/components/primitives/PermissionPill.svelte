<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import Eye from '@lucide/svelte/icons/eye';
	import Key from '@lucide/svelte/icons/key';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Lock from '@lucide/svelte/icons/lock';
	import type { Component } from 'svelte';
	import type { PermissionLevel } from '$lib/auth/types';

	interface Props {
		level: PermissionLevel;
	}

	let { level }: Props = $props();

	const META: Record<PermissionLevel, { label: string; icon: Component; cls: string }> = {
		none: {
			label: 'Aucun',
			icon: Lock,
			cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900',
		},
		can_view: {
			label: 'Voir',
			icon: Eye,
			cls: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
		},
		can_open: {
			label: 'Ouvrir',
			icon: Key,
			cls: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
		},
		can_edit: {
			label: 'Éditer',
			icon: Pencil,
			cls: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
		},
	};

	let m = $derived(META[level]);
	let Icon = $derived(m.icon);
</script>

<Badge class="{m.cls} flex items-center gap-1">
	<Icon class="h-3 w-3" />
	{m.label}
</Badge>
