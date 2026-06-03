<script lang="ts">
	import AppBreadcrumbs from './AppBreadcrumbs.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import UserMenu from './UserMenu.svelte';
</script>

<header class="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
	<AppBreadcrumbs />
	<div class="ml-auto flex items-center gap-2">
		<ThemeToggle />
		<UserMenu />
	</div>
</header>
