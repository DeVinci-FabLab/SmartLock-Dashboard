<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import { SidebarInset, SidebarProvider } from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import AppTopbar from '$lib/components/layout/AppTopbar.svelte';
	import CommandPalette from '$lib/components/palette/CommandPalette.svelte';
	import QueryProvider from '$lib/components/query/QueryProvider.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	let isAuthRoute = $derived(
		page.url.pathname.startsWith('/login') || page.url.pathname.startsWith('/logout'),
	);
</script>

<ModeWatcher />
<Toaster />

<QueryProvider>
	{#if isAuthRoute || !page.data.user}
		{@render children?.()}
	{:else}
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				{#if page.data.authBypass}
					<div
						class="bg-amber-100 dark:bg-amber-950 border-b border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs px-4 py-1.5 text-center"
					>
						⚠️ Dev mode — Keycloak non configuré, auth bypassée. Configure `web/.env` pour activer
						l'auth réelle.
					</div>
				{/if}
				<AppTopbar />
				<CommandPalette />
				<main class="flex-1 p-6">
					<div class="mx-auto max-w-7xl">
						{@render children?.()}
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	{/if}
</QueryProvider>
