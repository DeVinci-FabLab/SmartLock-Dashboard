<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import Inbox from '@lucide/svelte/icons/inbox';

	interface Props {
		icon?: Component;
		title: string;
		description?: string;
		action?: Snippet;
	}

	let { icon: Icon = Inbox, title, description, action }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
	<Icon class="h-12 w-12 text-muted-foreground/50" />
	<h2 class="text-lg font-medium">{title}</h2>
	{#if description}
		<p class="text-sm text-muted-foreground max-w-md">{description}</p>
	{/if}
	{#if action}
		<div class="mt-2">{@render action()}</div>
	{/if}
</div>
