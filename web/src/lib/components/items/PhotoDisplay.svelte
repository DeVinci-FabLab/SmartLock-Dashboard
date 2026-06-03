<script lang="ts">
	import Image from '@lucide/svelte/icons/image';

	interface Props {
		photo: string | null | undefined;
		alt: string;
		class?: string;
	}

	let { photo, alt, class: klass = 'size-24' }: Props = $props();

	let isUrl = $derived(!!photo && /^https?:\/\//.test(photo));
</script>

{#if isUrl}
	<img src={photo} {alt} class={`object-cover rounded ${klass}`} loading="lazy" />
{:else if photo}
	<div
		class={`flex items-center justify-center bg-muted rounded text-xs text-muted-foreground font-mono ${klass}`}
		title={photo}
	>
		{photo}
	</div>
{:else}
	<div class={`flex items-center justify-center bg-muted rounded ${klass}`}>
		<Image class="size-6 text-muted-foreground/50" />
	</div>
{/if}
