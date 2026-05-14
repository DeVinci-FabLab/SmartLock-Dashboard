<script lang="ts">
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import EmptyState from '$lib/components/primitives/EmptyState.svelte';
	import Construction from '@lucide/svelte/icons/construction';
</script>

<PageHeader title="Roles" description="Cette page sera implémentée en phase suivante." />

<EmptyState
	icon={Construction}
	title="Bientôt disponible"
	description="Le contenu de cette page sera ajouté lors de la phase correspondante du plan d'implémentation."
/>
