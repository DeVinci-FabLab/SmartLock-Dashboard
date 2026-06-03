<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		CommandDialog,
		CommandEmpty,
		CommandGroup,
		CommandInput,
		CommandItem,
		CommandList,
	} from '$lib/components/ui/command';
	import { paletteItems } from '$lib/palette/items';
	import type { UserContext } from '$lib/auth/types';

	let open = $state(false);
	let user = $derived(page.data.user as UserContext | null);
	let items = $derived(paletteItems(user));

	$effect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				open = !open;
			}
		}
		document.addEventListener('keydown', onKey, true);
		return () => document.removeEventListener('keydown', onKey, true);
	});

	function go(href: string) {
		open = false;
		goto(href);
	}
</script>

<CommandDialog bind:open>
	<CommandInput placeholder="Naviguer ou rechercher…" />
	<CommandList>
		<CommandEmpty>Aucun résultat.</CommandEmpty>
		<CommandGroup heading="Navigation">
			{#each items as it (it.id)}
				<CommandItem value={it.label} onSelect={() => go(it.href)}>
					<it.icon class="size-4 text-muted-foreground" />
					<span>{it.label}</span>
				</CommandItem>
			{/each}
		</CommandGroup>
	</CommandList>
</CommandDialog>
