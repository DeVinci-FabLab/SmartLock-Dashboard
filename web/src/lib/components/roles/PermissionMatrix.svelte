<script lang="ts" module>
	import type { PermissionLevel } from '$lib/auth/types';

	export interface MatrixRow {
		armoire_id: number;
		armoire_name: string;
		level: PermissionLevel;
	}
</script>

<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
	} from '$lib/components/ui/table';
	import PermissionLevelSelect from './PermissionLevelSelect.svelte';

	interface Props {
		rows: MatrixRow[];
		disabled?: boolean;
		/** Returns the set of armoire_ids currently being saved. */
		busyIds?: Set<number>;
		onChange: (armoireId: number, next: PermissionLevel) => void;
	}

	let { rows, disabled = false, busyIds = new Set(), onChange }: Props = $props();
</script>

<div class="rounded-md border border-border overflow-hidden">
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead>Armoire</TableHead>
				<TableHead class="w-64">Permission</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each rows as row (row.armoire_id)}
				<TableRow>
					<TableCell class="font-medium">{row.armoire_name}</TableCell>
					<TableCell>
						<PermissionLevelSelect
							level={row.level}
							{disabled}
							busy={busyIds.has(row.armoire_id)}
							onChange={(next) => onChange(row.armoire_id, next)}
						/>
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
</div>
