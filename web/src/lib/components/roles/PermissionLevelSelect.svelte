<script lang="ts">
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import type { PermissionLevel } from '$lib/auth/types';

	interface Props {
		level: PermissionLevel;
		disabled?: boolean;
		busy?: boolean;
		onChange: (next: PermissionLevel) => void;
	}

	let { level, disabled = false, busy = false, onChange }: Props = $props();

	const LABELS: Record<PermissionLevel, string> = {
		none: 'Aucun',
		can_view: 'Voir',
		can_open: 'Ouvrir',
		can_edit: 'Éditer',
	};
</script>

<div class="flex items-center gap-3">
	<Select
		type="single"
		value={level}
		{disabled}
		onValueChange={(v) => v && onChange(v as PermissionLevel)}
	>
		<SelectTrigger class="w-44">{LABELS[level]}</SelectTrigger>
		<SelectContent>
			<SelectItem value="none">Aucun</SelectItem>
			<SelectItem value="can_view">Voir</SelectItem>
			<SelectItem value="can_open">Ouvrir</SelectItem>
			<SelectItem value="can_edit">Éditer</SelectItem>
		</SelectContent>
	</Select>
	{#if busy}
		<span
			class="size-3 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin"
			aria-label="Sauvegarde en cours"
		></span>
	{/if}
</div>
