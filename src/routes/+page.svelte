<script lang="ts">
  // ─── Imports shadcn-svelte ─────────────────────────────────────────────────
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import * as Table from "$lib/components/ui/table";
  import * as Tabs from "$lib/components/ui/tabs";
  import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";

  let count = $state(0);

</script>

<div class="container mx-auto p-6 max-w-5xl space-y-10">

  <!-- En-tête -->
  <div>
    <h1 class="text-3xl font-bold">Bienvenue sur Smartlock</h1>
    <p class="text-muted-foreground mt-1">
      La plateforme de gestion de stocks du Devinci Fablab
    </p>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>Connexion</Card.Title>
      <Card.Description>
        Entrez votre adresse devinci
      </Card.Description>
    </Card.Header>
    <Card.Content class="flex items-center gap-4">
      <Button onclick={() => count++} variant="outline" size="sm">Connexion</Button>
      <span class="text-2xl font-mono w-12 text-center">{count}</span>
    </Card.Content>
  </Card.Root>

    <Card.Root>
    <Card.Header>
      <Card.Title>C'est quoi Smartlock ?</Card.Title>
    </Card.Header>
    <Card.Content class="flex items-center gap-4">
      Au Devinci Fablab, les armoires sont équipées d'un système d'authentification et d'inventaire ...
    </Card.Content>
  </Card.Root>

</div>