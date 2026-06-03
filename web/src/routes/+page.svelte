<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { createQuery } from '@tanstack/svelte-query';
	import Lock from '@lucide/svelte/icons/lock';
	import Package from '@lucide/svelte/icons/package';
	import Shield from '@lucide/svelte/icons/shield';
	import Activity from '@lucide/svelte/icons/activity';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Gated from '$lib/components/primitives/Gated.svelte';
	import HomeHeader from '$lib/components/home/HomeHeader.svelte';
	import MyArmoiresWidget from '$lib/components/home/MyArmoiresWidget.svelte';
	import RecentActivityWidget from '$lib/components/home/RecentActivityWidget.svelte';
	import LowStockWidget from '$lib/components/home/LowStockWidget.svelte';
	import UsersToAttributeWidget from '$lib/components/home/UsersToAttributeWidget.svelte';
	import AnomaliesWidget from '$lib/components/home/AnomaliesWidget.svelte';
	import { armoireListResponseSchema } from '$lib/schemas/armoire';
	import { queryKeys } from '$lib/query/queryKeys';
	import type { UserContext } from '$lib/auth/types';

	let user = $derived(page.data.user as UserContext | null);

	const armoiresQuery = createQuery(() => ({
		queryKey: queryKeys.armoires.list(),
		queryFn: async () => {
			const res = await fetch('/api/lockers');
			if (!res.ok) throw new Error(`Échec : ${res.status}`);
			return armoireListResponseSchema.parse(await res.json());
		},
		enabled: !!user,
	}));
</script>

{#if user}
	<div class="space-y-6">
		<HomeHeader {user} />

		<div class="grid gap-4 lg:grid-cols-2">
			<MyArmoiresWidget {user} armoires={armoiresQuery.data ?? []} />

			<Gated action={{ type: 'view_logs' }}>
				<RecentActivityWidget />
			</Gated>

			<Gated action={{ type: 'view_low_stock' }}>
				<LowStockWidget />
			</Gated>

			<Gated action={{ type: 'view_users' }}>
				<UsersToAttributeWidget />
			</Gated>

			<Gated action={{ type: 'view_logs' }}>
				<AnomaliesWidget />
			</Gated>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex flex-col">
		<header class="border-b border-border">
			<div class="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Lock class="size-5" />
					<span class="font-semibold tracking-tight">SmartLock</span>
					<span class="text-xs text-muted-foreground border-l border-border pl-2 ml-1">
						DeVinci Fablab
					</span>
				</div>
				<Button href="/login">
					Se connecter
					<ArrowRight class="size-4" />
				</Button>
			</div>
		</header>

		<main class="flex-1">
			<section class="mx-auto max-w-6xl px-6 py-16 sm:py-24">
				<div class="max-w-2xl space-y-4">
					<h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
						Tableau de bord SmartLock
					</h1>
					<p class="text-lg text-muted-foreground">
						Gère les armoires connectées du fablab, les permissions par rôle, le catalogue d'items
						et les stocks — depuis un seul endroit.
					</p>
					<div class="flex items-center gap-3 pt-2">
						<Button size="lg" href="/login">
							Se connecter avec Keycloak
							<ArrowRight class="size-4" />
						</Button>
						<a
							class="text-sm text-muted-foreground hover:text-foreground"
							href="https://github.com/DeVinci-FabLab/SmartLock-Dashboard"
							target="_blank"
							rel="noopener noreferrer"
						>
							En savoir plus →
						</a>
					</div>
				</div>
			</section>

			<section class="mx-auto max-w-6xl px-6 pb-16 sm:pb-24">
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader>
							<div class="flex items-center gap-2">
								<Lock class="size-4 text-muted-foreground" />
								<CardTitle class="text-base">Armoires</CardTitle>
							</div>
						</CardHeader>
						<CardContent class="text-sm text-muted-foreground">
							Visualise et configure les armoires, leurs permissions par rôle et leur stock.
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<div class="flex items-center gap-2">
								<Shield class="size-4 text-muted-foreground" />
								<CardTitle class="text-base">Rôles &amp; capacités</CardTitle>
							</div>
						</CardHeader>
						<CardContent class="text-sm text-muted-foreground">
							Définit qui peut voir, ouvrir ou éditer chaque armoire, et quelles actions
							administratives sont permises.
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<div class="flex items-center gap-2">
								<Package class="size-4 text-muted-foreground" />
								<CardTitle class="text-base">Catalogue &amp; stocks</CardTitle>
							</div>
						</CardHeader>
						<CardContent class="text-sm text-muted-foreground">
							Référence les items du fablab, suit les quantités par armoire et exporte les stocks
							en CSV.
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<div class="flex items-center gap-2">
								<Activity class="size-4 text-muted-foreground" />
								<CardTitle class="text-base">Audit</CardTitle>
							</div>
						</CardHeader>
						<CardContent class="text-sm text-muted-foreground">
							Historique des accès et des actions, filtrable par armoire — pour comprendre et
							résoudre les incidents.
						</CardContent>
					</Card>
				</div>
			</section>
		</main>

		<footer class="border-t border-border">
			<div class="mx-auto max-w-6xl px-6 py-4 text-xs text-muted-foreground flex items-center justify-between">
				<span>© DeVinci Fablab</span>
				<a
					class="hover:text-foreground"
					href="https://auth.devinci-fablab.fr"
					target="_blank"
					rel="noopener noreferrer"
				>
					Authentification : Keycloak
				</a>
			</div>
		</footer>
	</div>
{/if}
