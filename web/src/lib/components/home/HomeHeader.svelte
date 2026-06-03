<script lang="ts">
	import type { UserContext } from '$lib/auth/types';

	interface Props {
		user: UserContext;
	}
	let { user }: Props = $props();
</script>

<header class="space-y-1">
	<h1 class="text-2xl font-semibold tracking-tight">
		Bonjour, {user.displayName.split(' ')[0]}
	</h1>
	<p class="text-sm text-muted-foreground">
		Voici un aperçu adapté à tes rôles.
	</p>
</header>
