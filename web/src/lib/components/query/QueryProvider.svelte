<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import { browser, dev } from '$app/environment';

	let { children } = $props();

	const client = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30 * 1000,
				retry: (failureCount, error) => {
					if (error && typeof error === 'object' && 'status' in error) {
						const status = (error as { status: number }).status;
						if (status >= 400 && status < 500) return false;
					}
					return failureCount < 2;
				},
				refetchOnWindowFocus: browser,
			},
			mutations: {
				retry: false,
			},
		},
	});
</script>

<QueryClientProvider {client}>
	{@render children?.()}
	{#if dev && browser}
		<SvelteQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
	{/if}
</QueryClientProvider>
