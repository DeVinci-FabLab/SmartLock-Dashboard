import type { Component } from 'svelte';
import type { Action, UserContext } from '$lib/auth/types';
import { can } from '$lib/auth/permissions';
import Lock from '@lucide/svelte/icons/lock';
import Package from '@lucide/svelte/icons/package';
import Layers from '@lucide/svelte/icons/layers';
import Shield from '@lucide/svelte/icons/shield';
import Users from '@lucide/svelte/icons/users';
import Activity from '@lucide/svelte/icons/activity';
import UserCircle from '@lucide/svelte/icons/user-circle';
import House from '@lucide/svelte/icons/house';

export interface PaletteItem {
	id: string;
	label: string;
	hint?: string;
	href: string;
	icon: Component;
	gate?: Action;
}

const ITEMS: PaletteItem[] = [
	{ id: 'home', label: 'Accueil', href: '/', icon: House },
	{ id: 'armoires', label: 'Armoires', href: '/armoires', icon: Lock },
	{ id: 'items', label: 'Items', href: '/items', icon: Package, gate: { type: 'view_items' } },
	{ id: 'stocks', label: 'Stocks', href: '/stocks', icon: Layers, gate: { type: 'view_items' } },
	{ id: 'roles', label: 'Roles', href: '/roles', icon: Shield, gate: { type: 'view_roles' } },
	{ id: 'users', label: 'Users', href: '/users', icon: Users, gate: { type: 'view_users' } },
	{ id: 'logs', label: 'Logs', href: '/logs', icon: Activity, gate: { type: 'view_logs' } },
	{ id: 'me', label: 'Mon profil', href: '/me', icon: UserCircle },
];

export function paletteItems(user: UserContext | null): PaletteItem[] {
	return ITEMS.filter((it) => !it.gate || can(user, it.gate));
}
