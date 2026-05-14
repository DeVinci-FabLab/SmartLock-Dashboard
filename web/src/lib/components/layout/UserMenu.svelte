<script lang="ts">
	import { page } from '$app/state';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuTrigger,
	} from '$lib/components/ui/dropdown-menu';
	import RoleBadge from '$lib/components/primitives/RoleBadge.svelte';
	import { highestTier } from '$lib/auth/permissions';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { UserContext } from '$lib/auth/types';

	let user = $derived(page.data.user as UserContext | null);
	let initials = $derived(
		user
			? user.displayName
					.split(' ')
					.map((p) => p[0])
					.join('')
					.slice(0, 2)
					.toUpperCase()
			: '?',
	);
	let tier = $derived(user ? highestTier(user) : 'T5');
</script>

{#if user}
	<DropdownMenu>
		<DropdownMenuTrigger>
			{#snippet child({ props })}
				<Button variant="ghost" class="flex items-center gap-2 h-9" {...props}>
					<Avatar class="h-7 w-7">
						<AvatarFallback class="text-xs">{initials}</AvatarFallback>
					</Avatar>
					<div class="hidden sm:flex items-center gap-2">
						<span class="text-sm font-medium">{user.displayName}</span>
						<RoleBadge {tier} />
					</div>
					<ChevronDown class="h-4 w-4 text-muted-foreground" />
				</Button>
			{/snippet}
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end" class="w-56">
			<DropdownMenuLabel>
				<div class="flex flex-col">
					<span>{user.displayName}</span>
					<span class="text-xs font-normal text-muted-foreground">{user.email}</span>
				</div>
			</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuItem>
				{#snippet child({ props })}
					<a href="/me" {...props}>Profile</a>
				{/snippet}
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem>
				{#snippet child({ props })}
					<a href="/logout" {...props}>Déconnexion</a>
				{/snippet}
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
{/if}
