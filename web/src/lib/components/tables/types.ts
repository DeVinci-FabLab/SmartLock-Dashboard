import type { Snippet } from 'svelte';

export interface DataTableColumn<TRow> {
	key: string;
	header: string;
	/** Render cell content for a row. If omitted, falls back to `row[key]`. */
	cell?: Snippet<[TRow]>;
	/** Tailwind classes applied to <td> for this column. */
	cellClass?: string;
	/** Tailwind classes applied to <th> for this column. */
	headerClass?: string;
}
