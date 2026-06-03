<script lang="ts">
	import {
		Sheet,
		SheetContent,
		SheetDescription,
		SheetHeader,
		SheetTitle,
	} from '$lib/components/ui/sheet';
	import { Badge } from '$lib/components/ui/badge';
	import type { z } from 'zod';
	import { accessLogSchema } from '$lib/api/logs';

	type LogRow = z.infer<typeof accessLogSchema>;

	interface Props {
		open: boolean;
		row: LogRow | null;
		onOpenChange: (open: boolean) => void;
	}

	let { open, row, onOpenChange }: Props = $props();
</script>

<Sheet {open} {onOpenChange}>
	<SheetContent class="sm:max-w-md overflow-y-auto">
		{#if row}
			<SheetHeader>
				<SheetTitle class="flex items-center gap-2">
					Event #{row.id}
					{#if row.result === 'allowed'}
						<Badge>allowed</Badge>
					{:else}
						<Badge variant="destructive">denied</Badge>
					{/if}
				</SheetTitle>
				<SheetDescription>{new Date(row.timestamp).toLocaleString()}</SheetDescription>
			</SheetHeader>

			<dl class="mt-4 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
				<dt class="text-muted-foreground">user</dt>
				<dd>{row.username ?? '—'}</dd>
				<dt class="text-muted-foreground">user_id</dt>
				<dd class="font-mono text-xs break-all">{row.user_id ?? '—'}</dd>
				<dt class="text-muted-foreground">locker_id</dt>
				<dd>{row.locker_id ?? '—'}</dd>
				<dt class="text-muted-foreground">card_id</dt>
				<dd class="font-mono text-xs">{row.card_id ?? '—'}</dd>
				<dt class="text-muted-foreground">can_view</dt>
				<dd>{row.can_view ?? '—'}</dd>
				<dt class="text-muted-foreground">can_open</dt>
				<dd>{row.can_open ?? '—'}</dd>
				<dt class="text-muted-foreground">reason</dt>
				<dd>{row.reason ?? '—'}</dd>
			</dl>

			<details class="mt-4 text-xs">
				<summary class="cursor-pointer text-muted-foreground">Raw JSON</summary>
				<pre class="mt-2 rounded-md bg-muted p-3 overflow-x-auto"><code>{JSON.stringify(row, null, 2)}</code></pre>
			</details>
		{/if}
	</SheetContent>
</Sheet>
