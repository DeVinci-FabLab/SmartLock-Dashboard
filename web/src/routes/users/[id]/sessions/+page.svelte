<script lang="ts">
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import Monitor from '@lucide/svelte/icons/monitor';
</script>

<div class="space-y-4">
	<div>
		<h2 class="text-lg font-semibold">Sessions actives</h2>
		<p class="text-sm text-muted-foreground">
			Sessions Keycloak ouvertes pour cet utilisateur (navigateur, applications…).
		</p>
	</div>

	<EmptyState
		icon={Monitor}
		title="Endpoint backend non disponible"
		description="La liste des sessions Keycloak nécessite un endpoint /users/&#123;id&#125;/sessions côté API. À ajouter en post-MVP."
	/>
</div>
