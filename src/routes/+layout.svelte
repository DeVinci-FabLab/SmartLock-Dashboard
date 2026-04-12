<nav>
  <a href="/">Accueil</a> 
  <a href="/Main">Page principale</a>
  <a href="/Roles">Page des rôles</a>
</nav>

<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.png" />
</svelte:head>

{@render children()}