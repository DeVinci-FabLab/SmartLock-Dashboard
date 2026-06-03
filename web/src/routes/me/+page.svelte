<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/primitives/PageHeader.svelte';
	import RoleBadge from '$lib/components/primitives/RoleBadge.svelte';
	import MyActivitySection from '$lib/components/me/MyActivitySection.svelte';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { config } from '$lib/config';
	import type { UserContext } from '$lib/auth/types';

	let user = $derived(page.data.user as UserContext | null);

	let accountConsoleUrl = $derived(
		config.keycloak.issuer ? `${config.keycloak.issuer}/account/` : '',
	);
</script>

<PageHeader title="Mon profil" description="Identité Keycloak et activité personnelle." />

{#if user}
	<div class="mt-6 space-y-8 max-w-3xl">
		<section class="space-y-2 text-sm">
			<h2 class="text-lg font-semibold">Identité</h2>
			<div><span class="font-medium">Nom :</span> {user.displayName}</div>
			<div><span class="font-medium">Email :</span> {user.email || '—'}</div>
			<div>
				<span class="font-medium">Username :</span>
				<span class="font-mono">{user.username}</span>
			</div>
			<div class="flex items-center gap-2 flex-wrap">
				<span class="font-medium">Rôles :</span>
				{#if user.roles.length === 0}
					<span class="text-muted-foreground">
						Aucun rôle enrichi (backend /roles indisponible ou aucun rôle assigné).
					</span>
				{:else}
					{#each user.roles as r (r.name)}
						<RoleBadge tier={r.tier} label={r.name} />
					{/each}
				{/if}
			</div>
		</section>

		<Separator />

		<section class="space-y-2">
			<h2 class="text-lg font-semibold">Sécurité &amp; sessions</h2>
			<p class="text-sm text-muted-foreground">
				La gestion du mot de passe, du 2FA (OTP) et des sessions actives se fait dans le compte
				Keycloak. Ouvre la console pour :
			</p>
			<ul class="text-sm list-disc pl-5 space-y-0.5 text-muted-foreground">
				<li>Changer ton mot de passe</li>
				<li>Activer l'authentification à deux facteurs (OTP)</li>
				<li>Voir et révoquer tes sessions actives</li>
			</ul>
			{#if accountConsoleUrl}
				<Button variant="outline" href={accountConsoleUrl} target="_blank" rel="noopener noreferrer">
					Ouvrir la console Keycloak
					<ExternalLink class="size-4" />
				</Button>
			{:else}
				<p class="text-xs text-muted-foreground">Keycloak non configuré (mode dev bypass).</p>
			{/if}
		</section>

		<Separator />

		<MyActivitySection username={user.username} />
	</div>
{/if}
