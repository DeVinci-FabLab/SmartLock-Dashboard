<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import Search from '@lucide/svelte/icons/search';
	import type { Snippet } from 'svelte';

	interface Props {
		search?: string;
		searchPlaceholder?: string;
		onSearchChange?: (value: string) => void;
		filters?: Snippet;
		actions?: Snippet;
	}

	let {
		search = '',
		searchPlaceholder = 'Rechercher…',
		onSearchChange,
		filters,
		actions,
	}: Props = $props();
</script>

<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	<div class="flex flex-1 items-center gap-2">
		{#if onSearchChange}
			<div class="relative max-w-sm flex-1">
				<Search
					class="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
				/>
				<Input
					value={search}
					placeholder={searchPlaceholder}
					class="pl-8"
					oninput={(e) => onSearchChange?.((e.target as HTMLInputElement).value)}
				/>
			</div>
		{/if}
		{#if filters}{@render filters()}{/if}
	</div>
	{#if actions}<div class="flex items-center gap-2">{@render actions()}</div>{/if}
</div>
