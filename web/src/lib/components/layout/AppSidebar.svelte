<script lang="ts">
	import { page } from '$app/state';
	import { can } from '$lib/auth/permissions';
	import type { Action, UserContext } from '$lib/auth/types';
	import type { Component } from 'svelte';
	import Box from '@lucide/svelte/icons/box';
	import Package from '@lucide/svelte/icons/package';
	import Layers from '@lucide/svelte/icons/layers';
	import Users from '@lucide/svelte/icons/users';
	import Shield from '@lucide/svelte/icons/shield';
	import Scroll from '@lucide/svelte/icons/scroll';
	import {
		Sidebar,
		SidebarContent,
		SidebarGroup,
		SidebarGroupContent,
		SidebarGroupLabel,
		SidebarHeader,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
		SidebarRail,
		SidebarTrigger,
	} from '$lib/components/ui/sidebar';

	interface NavItem {
		label: string;
		href: string;
		icon: Component;
		action?: Action;
	}

	const work: NavItem[] = [
		{ label: 'Armoires', href: '/armoires', icon: Box },
		{ label: 'Items', href: '/items', icon: Package },
		{ label: 'Stocks', href: '/stocks', icon: Layers },
	];

	const governance: NavItem[] = [
		{ label: 'Users', href: '/users', icon: Users, action: { type: 'view_users' } },
		{ label: 'Roles', href: '/roles', icon: Shield, action: { type: 'view_roles' } },
		{ label: 'Logs', href: '/logs', icon: Scroll, action: { type: 'view_logs' } },
	];

	let user = $derived(page.data.user as UserContext | null);
	let visibleGovernance = $derived(
		governance.filter((item) => !item.action || can(user, item.action)),
	);

	function isActive(href: string): boolean {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}
</script>

<Sidebar collapsible="icon">
	<SidebarHeader>
		<div class="flex items-center gap-2">
			<a
				href="/"
				class="flex min-w-0 flex-1 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:hidden"
			>
				<div
					class="bg-primary text-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-md"
				>
					<Box class="size-4" />
				</div>
				<div class="grid min-w-0 flex-1 text-left text-sm leading-tight">
					<span class="truncate font-semibold">SmartLock</span>
					<span class="truncate text-xs text-muted-foreground">Dashboard</span>
				</div>
			</a>
			<SidebarTrigger class="size-7 shrink-0 group-data-[collapsible=icon]:mx-auto" />
		</div>
	</SidebarHeader>

	<SidebarContent>
		<SidebarGroup>
			<SidebarGroupLabel>Travail</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{#each work as item (item.href)}
						{@const Icon = item.icon}
						<SidebarMenuItem>
							<SidebarMenuButton isActive={isActive(item.href)} tooltipContent={item.label}>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<Icon />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</SidebarMenuButton>
						</SidebarMenuItem>
					{/each}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>

		{#if visibleGovernance.length > 0}
			<SidebarGroup>
				<SidebarGroupLabel>Gouvernance</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{#each visibleGovernance as item (item.href)}
							{@const Icon = item.icon}
							<SidebarMenuItem>
								<SidebarMenuButton isActive={isActive(item.href)} tooltipContent={item.label}>
									{#snippet child({ props })}
										<a href={item.href} {...props}>
											<Icon />
											<span>{item.label}</span>
										</a>
									{/snippet}
								</SidebarMenuButton>
							</SidebarMenuItem>
						{/each}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		{/if}
	</SidebarContent>

	<SidebarRail />
</Sidebar>
