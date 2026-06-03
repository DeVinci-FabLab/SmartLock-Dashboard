<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import type { z } from 'zod';
	import { accessLogSchema } from '$lib/api/logs';

	type LogRow = z.infer<typeof accessLogSchema>;

	interface Props {
		rows: LogRow[];
		onSelect: (row: LogRow) => void;
	}

	let { rows, onSelect }: Props = $props();

	function fmt(ts: string): string {
		const d = new Date(ts);
		return Number.isNaN(d.getTime()) ? ts : d.toLocaleString();
	}
</script>

<ol class="space-y-1">
	{#each rows as r (r.id)}
		<li>
			<button
				type="button"
				onclick={() => onSelect(r)}
				class="w-full flex items-start gap-3 rounded-md px-3 py-2 hover:bg-muted/40 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<div class="mt-0.5">
					{#if r.result === 'allowed'}
						<CircleCheck class="size-4 text-emerald-600" />
					{:else}
						<CircleX class="size-4 text-destructive" />
					{/if}
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 text-sm">
						<span class="font-mono text-xs text-muted-foreground">{fmt(r.timestamp)}</span>
						<span class="font-medium truncate">{r.username ?? 'inconnu'}</span>
						{#if r.locker_id !== null}
							<Badge variant="secondary" class="text-[10px]">#{r.locker_id}</Badge>
						{/if}
					</div>
					{#if r.reason}
						<div class="text-xs text-muted-foreground truncate">{r.reason}</div>
					{/if}
				</div>
			</button>
		</li>
	{/each}
</ol>
