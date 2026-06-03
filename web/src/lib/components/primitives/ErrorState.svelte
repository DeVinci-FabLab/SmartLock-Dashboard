<script lang="ts">
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		title?: string;
		description?: string;
		onRetry?: () => void;
	}

	let {
		title = 'Une erreur est survenue',
		description = 'Réessaye dans quelques instants. Si le problème persiste, contacte un admin.',
		onRetry,
	}: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
	<AlertTriangle class="h-12 w-12 text-destructive" />
	<h2 class="text-lg font-medium">{title}</h2>
	<p class="text-sm text-muted-foreground max-w-md">{description}</p>
	{#if onRetry}
		<Button variant="outline" onclick={onRetry} class="mt-2">Réessayer</Button>
	{/if}
</div>
