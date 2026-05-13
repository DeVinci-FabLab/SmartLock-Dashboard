<script lang="ts">
  // ─── Imports shadcn-svelte ─────────────────────────────────────────────────
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";

</script>

<div>
    <div>
    <h1 class="text-3xl font-bold">Tableau de bord</h1>
    <p class="text-muted-foreground mt-1">
      Sur cette page, vous pouvez visualiser les stocks des armoires auxquelles vous avez accès.
    </p>
    </div>

    <Card.Root>
    <Card.Header>
      <Card.Title>Tableau de bord</Card.Title>
    </Card.Header>
    <Card.Content class="flex items-center gap-4">
      Sur cette page vous pouvez visualiser les stocks
    </Card.Content>
  </Card.Root>
</div>