<script lang="ts">
	import { page } from '$app/state';
	import {
		Breadcrumb,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbList,
		BreadcrumbPage,
		BreadcrumbSeparator,
	} from '$lib/components/ui/breadcrumb';

	const LABELS: Record<string, string> = {
		armoires: 'Armoires',
		items: 'Items',
		stocks: 'Stocks',
		users: 'Users',
		roles: 'Roles',
		logs: 'Logs',
		me: 'Profile',
		treasury: 'Trésorerie',
	};

	let crumbs = $derived.by(() => {
		const segments = page.url.pathname.split('/').filter(Boolean);
		const acc: Array<{ href: string; label: string; isLast: boolean }> = [];
		segments.forEach((seg, i) => {
			const href = '/' + segments.slice(0, i + 1).join('/');
			const label = LABELS[seg] ?? seg;
			acc.push({ href, label, isLast: i === segments.length - 1 });
		});
		return acc;
	});
</script>

<Breadcrumb>
	<BreadcrumbList>
		<BreadcrumbItem>
			<BreadcrumbLink href="/">Accueil</BreadcrumbLink>
		</BreadcrumbItem>
		{#each crumbs as c (c.href)}
			<BreadcrumbSeparator />
			<BreadcrumbItem>
				{#if c.isLast}
					<BreadcrumbPage>{c.label}</BreadcrumbPage>
				{:else}
					<BreadcrumbLink href={c.href}>{c.label}</BreadcrumbLink>
				{/if}
			</BreadcrumbItem>
		{/each}
	</BreadcrumbList>
</Breadcrumb>
