<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
	} from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import type { z } from 'zod';
	import { accessLogSchema } from '$lib/api/logs';

	type LogRow = z.infer<typeof accessLogSchema>;

	interface Props {
		rows: LogRow[];
	}

	let { rows }: Props = $props();

	function fmt(ts: string): string {
		const d = new Date(ts);
		if (Number.isNaN(d.getTime())) return ts;
		return d.toLocaleString();
	}
</script>

<div class="rounded-md border border-border overflow-hidden">
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead class="w-48">Horodatage</TableHead>
				<TableHead>Utilisateur</TableHead>
				<TableHead class="w-32">Résultat</TableHead>
				<TableHead>Raison</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each rows as r (r.id)}
				<TableRow>
					<TableCell class="font-mono text-xs">{fmt(r.timestamp)}</TableCell>
					<TableCell class="font-medium">{r.username ?? '—'}</TableCell>
					<TableCell>
						{#if r.result === 'allowed'}
							<Badge class="bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
								Allowed
							</Badge>
						{:else}
							<Badge variant="destructive">Denied</Badge>
						{/if}
					</TableCell>
					<TableCell class="text-muted-foreground">{r.reason ?? '—'}</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
</div>
