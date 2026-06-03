<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		threshold: number | null | undefined;
		total: number;
	}

	let { threshold, total }: Props = $props();

	let isLow = $derived(threshold !== null && threshold !== undefined && total < threshold);
</script>

{#if isLow}
	<Badge variant="destructive" class="text-[10px]">Low stock</Badge>
{/if}
