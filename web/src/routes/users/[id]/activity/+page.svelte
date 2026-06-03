<script lang="ts">
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import Activity from '@lucide/svelte/icons/activity';
</script>

<div class="space-y-4">
	<div>
		<h2 class="text-lg font-semibold">Activité</h2>
		<p class="text-sm text-muted-foreground">
			Historique des accès et actions effectuées par cet utilisateur.
		</p>
	</div>

	<EmptyState
		icon={Activity}
		title="Disponible en P4"
		description="L'historique filtré par utilisateur sera ajouté lors de la phase 4 (audit log)."
	/>
</div>
