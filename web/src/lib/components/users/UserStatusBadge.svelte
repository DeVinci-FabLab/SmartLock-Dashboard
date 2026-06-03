<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		enabled: boolean;
	}

	let { enabled }: Props = $props();
</script>

{#if enabled}
	<Badge class="bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
		Actif
	</Badge>
{:else}
	<Badge class="bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Révoqué</Badge>
{/if}
