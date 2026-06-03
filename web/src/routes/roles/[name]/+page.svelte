<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	onMount(() => {
		goto(`/roles/${page.params.name}/permissions`, { replaceState: true });
	});
</script>

<p class="text-sm text-muted-foreground">Redirection…</p>
