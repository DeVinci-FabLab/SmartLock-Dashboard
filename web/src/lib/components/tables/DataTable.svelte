<script lang="ts" generics="TRow">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
	} from '$lib/components/ui/table';
	import type { DataTableColumn } from './types';
	import LoadingState from '$lib/components/primitives/LoadingState.svelte';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import type { Component, Snippet } from 'svelte';

	interface Props {
		rows: TRow[];
		columns: DataTableColumn<TRow>[];
		rowKey: (row: TRow) => string | number;
		onRowClick?: (row: TRow) => void;
		loading?: boolean;
		emptyIcon?: Component;
		emptyTitle?: string;
		emptyDescription?: string;
		emptyAction?: Snippet;
	}

	let {
		rows,
		columns,
		rowKey,
		onRowClick,
		loading = false,
		emptyIcon,
		emptyTitle = 'Aucun résultat',
		emptyDescription,
		emptyAction,
	}: Props = $props();
</script>

{#if loading}
	<LoadingState variant="skeleton-rows" rows={5} />
{:else if rows.length === 0}
	<EmptyState
		icon={emptyIcon}
		title={emptyTitle}
		description={emptyDescription}
		action={emptyAction}
	/>
{:else}
	<div class="rounded-md border border-border overflow-hidden">
		<Table>
			<TableHeader>
				<TableRow>
					{#each columns as col (col.key)}
						<TableHead class={col.headerClass}>{col.header}</TableHead>
					{/each}
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each rows as row (rowKey(row))}
					<TableRow
						class={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
						onclick={() => onRowClick?.(row)}
					>
						{#each columns as col (col.key)}
							<TableCell class={col.cellClass}>
								{#if col.cell}
									{@render col.cell(row)}
								{:else}
									{String((row as Record<string, unknown>)[col.key] ?? '')}
								{/if}
							</TableCell>
						{/each}
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
{/if}
