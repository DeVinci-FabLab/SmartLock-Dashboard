<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import ErrorState from '$lib/components/primitives/ErrorState.svelte';

	let title = $derived(
		page.status === 404 ? 'Page introuvable' : page.status === 403 ? 'Accès refusé' : 'Erreur',
	);
	let description = $derived(page.error?.message ?? '');
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center">
	<ErrorState {title} {description} />
	<Button variant="outline" onclick={() => window.history.back()} class="mt-2">Retour</Button>
</div>
