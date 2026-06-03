<script lang="ts" module>
	import type { PermissionLevel, Tier } from '$lib/auth/types';

	export interface LockerMatrixRow {
		role_name: string;
		role_label: string;
		role_tier: Tier;
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
	import RoleBadge from '$lib/components/primitives/RoleBadge.svelte';
	import PermissionLevelSelect from '$lib/components/roles/PermissionLevelSelect.svelte';

	interface Props {
		rows: LockerMatrixRow[];
		disabled?: boolean;
		busyRoles?: Set<string>;
		onChange: (roleName: string, next: PermissionLevel) => void;
	}

	let { rows, disabled = false, busyRoles = new Set(), onChange }: Props = $props();
</script>

<div class="rounded-md border border-border overflow-hidden">
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead>Rôle</TableHead>
				<TableHead class="w-24">Tier</TableHead>
				<TableHead class="w-64">Permission</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each rows as row (row.role_name)}
				<TableRow>
					<TableCell class="font-medium">
						<div class="flex flex-col">
							<span>{row.role_label}</span>
							<span class="font-mono text-xs text-muted-foreground">{row.role_name}</span>
						</div>
					</TableCell>
					<TableCell><RoleBadge tier={row.role_tier} /></TableCell>
					<TableCell>
						<PermissionLevelSelect
							level={row.level}
							{disabled}
							busy={busyRoles.has(row.role_name)}
							onChange={(next) => onChange(row.role_name, next)}
						/>
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
</div>
