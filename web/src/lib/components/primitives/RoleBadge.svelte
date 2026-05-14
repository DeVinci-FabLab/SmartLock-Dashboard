<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Tier } from '$lib/auth/types';

	interface Props {
		tier: Tier;
		label?: string;
	}

	let { tier, label }: Props = $props();

	const COLORS: Record<Tier, string> = {
		T0: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200',
		T1: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200',
		T2: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
		T3: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200',
		T4: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200',
		T5: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200',
	};
</script>

<Badge class="{COLORS[tier]} font-mono text-[10px] uppercase tracking-wide">
	{label ?? tier}
</Badge>
