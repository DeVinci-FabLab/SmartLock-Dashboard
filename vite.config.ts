import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		watch: {
			usePolling: true, // Force la détection des changements dans Docker
		},
		host: true, // Équivalent de --host
		strictPort: true,
		port: 5173
	}
});