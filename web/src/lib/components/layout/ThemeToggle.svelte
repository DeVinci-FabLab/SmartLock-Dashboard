<script lang="ts">
	import { resetMode, setMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger,
	} from '$lib/components/ui/dropdown-menu';
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		{#snippet child({ props })}
			<Button variant="ghost" size="icon" {...props}>
				<Sun class="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
				<Moon
					class="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end">
		<DropdownMenuItem onclick={() => setMode('light')}>Light</DropdownMenuItem>
		<DropdownMenuItem onclick={() => setMode('dark')}>Dark</DropdownMenuItem>
		<DropdownMenuItem onclick={() => resetMode()}>Système</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
