<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { can } from '$lib/auth/permissions';
	import type { Action, UserContext } from '$lib/auth/types';

	interface Props {
		action: Action;
		children: Snippet;
		fallback?: Snippet;
	}

	let { action, children, fallback }: Props = $props();

	let allowed = $derived(can(page.data.user as UserContext | null, action));
</script>

{#if allowed}
	{@render children()}
{:else if fallback}
	{@render fallback()}
{/if}
