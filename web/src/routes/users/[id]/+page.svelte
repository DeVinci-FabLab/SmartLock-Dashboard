<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	onMount(() => {
		goto(`/users/${page.params.id}/roles`, { replaceState: true });
	});
</script>

<p class="text-sm text-muted-foreground">Redirection…</p>
