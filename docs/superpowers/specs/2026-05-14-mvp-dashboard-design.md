# SmartLock Dashboard — MVP design spec

> Spec issu d'une session de brainstorming le 2026-05-14. Représente l'état validé du design à cette date.
> Le CDC (`CDC.md`) reste la source de vérité pour le périmètre fonctionnel et le modèle ACM.
> Ce document spécifie **comment** on construit l'UI/UX du dashboard, pas **quoi** le dashboard fait.

---

## 1. Périmètre MVP

### Inclus en v1 (« noyau + catalogue »)

- Authentification Keycloak (OIDC + PKCE + OTP)
- Gouvernance : annuaire users, gestion des rôles, matrice de permissions
- Armoires : consultation et actions selon permissions par armoire
- Catalogue items et gestion des stocks
- Audit log lisible
- Profil utilisateur

### Anticipé mais non implémenté en v1

- `/treasury` — workflow commandes (route réservée, placeholder)
- `/` non-authentifié — vitrine publique (liste membres + état armoires)

### Contrainte transverse

L'architecture (IA, design system, modèle de données frontend, conventions de routing, primitives) **doit anticiper** les fonctionnalités hors-MVP pour ne pas les bloquer. Aucune décision de v1 ne doit forcer un refactor majeur quand on ajoutera `/treasury` ou la vitrine publique.

---

## 2. Direction visuelle

- **Référence** : shadcn dashboard / Cal.com — neutre, clean, light+dark équilibrés
- **Densité** : raisonnable (ni Linear-dense, ni Stripe-airy) — confortable pour usage prolongé
- **Personnalité chromatique** : palette neutre principalement, accent indigo discret

---

## 3. Design tokens

| Token | Valeur |
|---|---|
| Base neutre | Tailwind `zinc` |
| Accent | `indigo-500` (light) / `indigo-400` (dark) |
| Success | `emerald` |
| Warning | `amber` |
| Destructive | `red` |
| Surface light | bg `zinc-50` / cards `white` / borders `zinc-200` / text `zinc-900` |
| Surface dark | bg `zinc-950` / cards `zinc-900` / borders `zinc-800` / text `zinc-50` |
| Radius | `0.5rem` (boutons, inputs) ; `1rem` (cards, dialogs) |
| Font sans | Inter Variable (`@fontsource-variable/inter`) |
| Font mono | JetBrains Mono (`@fontsource/jetbrains-mono`) |
| Type scale | shadcn defaults : 12 / 14 / 16 / 18 / 24 / 30 |
| Colonnes numériques | `font-variant-numeric: tabular-nums` |
| Spacing | Tailwind 4pt scale (default) |
| Icônes | Lucide |
| Theme | Light + dark, respect `prefers-color-scheme`, choix persisté `localStorage` |

---

## 4. Information architecture

### Structure d'écran

- Sidebar gauche collapsible (drawer sheet sur mobile)
- Topbar fine : breadcrumbs, command palette `⌘K`, theme toggle, user menu
- Zone de contenu principale capée à `max-w-7xl` centrée sur écrans `≥ xl`

### Entrées de sidebar (groupées en sections)

| Section | Entrée | Visibilité |
|---|---|---|
| Travail | Armoires | tout utilisateur authentifié |
| Travail | Items | tout utilisateur authentifié |
| Travail | Stocks | tout utilisateur authentifié |
| Gouvernance | Users | flag `manager` sur au moins un rôle |
| Gouvernance | Roles | flag `role_admin` sur au moins un rôle |
| Gouvernance | Logs | T0 (Codir/Admin sys) ou flag `audit_viewer` |
| (séparateur) | Profile | toujours |

Les sections sans entrée visible sont entièrement masquées (pas grisées).

### Routes

| Route | Description | Phase |
|---|---|---|
| `/login` | Handler Keycloak (callback OIDC) | P0 |
| `/logout` | Termine session, redirect Keycloak end-session | P0 |
| `/` (auth) | Redirect `/armoires` en P0–P3, devient home overview en P4 | P0 puis P4 |
| `/users` + `/users/[id]` | Annuaire + détail (tabs Roles / Activity / Sessions) | P1 |
| `/roles` + `/roles/[id]` | Liste + détail (tabs Permissions / Users / Settings) | P1 |
| `/armoires` + `/armoires/[id]` | Grid + détail (tabs Stock / Permissions / Activity) | P2 |
| `/items` + `/items/[id]` | Catalogue + détail (tabs Details / Stocks / Activity) | P3 |
| `/stocks` | Table flat item×armoire×qty | P3 |
| `/logs` | Audit timeline filtrable | P4 |
| `/me` | Profil + OTP + sessions + mon activité | P0 stub, P4 complet |
| `/treasury` | Placeholder « Bientôt disponible » | P4 |

### Home authentifié (P4)

Grille de cards role-adaptées, 2 colonnes ≥ md, 1 colonne en mobile :

| Widget | Audience | Contenu |
|---|---|---|
| Mes armoires | tout authentifié | top 5 armoires accessibles, lien `/armoires` |
| Activité récente | tout authentifié | 5 derniers events me concernant ; T0+audit voit global |
| Items low-stock | user avec `can_edit` stock | items sous seuil, CTA « Ajuster » |
| Users à attribuer | flag `manager` | badges scannés sans assign, nouveaux comptes sans rôle |
| Anomalies 24h | T0 / audit viewer | denials, cards unknown, failed_auth |

Si l'utilisateur n'a aucun widget visible : empty state explicite, pas de redirect.

---

## 5. Foundation (P0)

### Composants shadcn-svelte installés en P0

`Sidebar`, `Sheet`, `Breadcrumb`, `Separator`, `Sonner`, `Skeleton`, `DropdownMenu`, `Tooltip`, `Button`, `Avatar`, `Badge`.

Les autres composants (`Table`, `Form`, `Dialog`, `AlertDialog`, `Tabs`, `Combobox`, `Command`, `Switch`, `Checkbox`…) sont installés au moment où la première page qui en a besoin est faite.

### Primitives custom (P0)

| Composant | Rôle |
|---|---|
| `<PageHeader title description actions>` | h1 + sous-titre + slot d'actions à droite |
| `<EmptyState icon title description action>` | État vide standardisé |
| `<LoadingState variant="skeleton"\|"spinner">` | Pendant fetch |
| `<ErrorState onRetry>` | Erreur réseau / 5xx avec retry |
| `<RoleBadge tier=T0..T5>` | Badge couleur-codé par tier |
| `<PermissionPill level="view"\|"open"\|"edit">` | Pill 3 niveaux |
| `<Gated action="...">` | Cache son slot si user non autorisé |

### App shell

- `+layout.svelte` racine : `<SidebarProvider>` + topbar + slot
- `+layout.server.ts` : charge `currentUser` depuis session, redirect `/login` si non auth
- `hooks.server.ts` : handle session OIDC, refresh token automatique, garde de route
- `lib/auth/` : client Keycloak, helpers `requireTier(t)`, `requireFlag('manager')`, `canViewArmoire(id)`
- `lib/api/` : client typé FastAPI avec Zod runtime validation des responses, retry exponentiel sur 5xx
- Stores : `currentUser`, `permissions` (réactif sur token refresh)

### Routing P0

`/login`, `/logout`, `/` (redirect), `+error.svelte` racine, `/me` stub.

---

## 6. Patterns de page

### Pattern A — Liste

PageHeader (title, count, primary action) → toolbar (search, filter chips, refresh) → Table desktop / card stack mobile → footer pagination.

- Row click → navigation détail
- Actions par row dans menu `⋯`
- Bulk select via checkbox col 1, barre sticky en bas si ≥1 sélection
- URL state : filtres / search / page dans query string (deep-linkable)

### Pattern B — Détail

PageHeader (back, avatar/icon, name, meta-badges, actions) → tabs (encoded en `?tab=`) → tab content.

- Onglet « Activity » de chaque ressource = composant logs réutilisé filtré sur cette ressource
- Actions destructives : `<AlertDialog>` avec type-to-confirm

### Pattern C — Édition / création

| Cas | Pattern |
|---|---|
| Un seul champ ou cellule | Inline edit, save sur blur ou debounce, optimistic |
| 3–10 champs simples | `<Sheet>` latéral, form Zod, save → toast → close |
| Action ponctuelle / destructive | `<Dialog>` ou `<AlertDialog>` |
| 10+ champs ou matrice | Page dédiée (sous-tab) |

Jamais d'inline pour > 1 champ. Jamais de sheet/dialog pour un wizard multi-étapes (cas absent en MVP).

### Pages spéciales

**`/roles/[id]?tab=permissions`** — Matrice 2D (armoires × view/open/edit) avec contraintes logiques (edit implique open + view, open implique view). Toggle save debounce 500ms, toast groupé si bulk. Rôle système → matrice read-only avec banner explicatif. Mobile → liste accordéon par armoire.

**`/armoires/[id]?tab=stock`** — Liste items+qty avec input number inline (debounce 800ms), dot indicator de save status. `+ Add` ouvre sheet combobox d'items.

**`/logs`** — Timeline (pas tableau) avec date/heure, actor, action, target, résultat. Click event → side sheet droite avec JSON brut + IDs cliquables. Filtres en URL. Infinite scroll cursor-based. Export CSV pour T0+.

---

## 7. Data flow

### Stack

- **TanStack Query** (`@tanstack/svelte-query`) en couche principale : queries + mutations + cache
- **SvelteKit `+page.server.ts`** uniquement pour l'auth gate : vérifie session, redirect login, expose `currentUser`
- **Mutations client-side** (pas de form actions SvelteKit), enforcement de sécurité **côté API**
- **Validation** : Zod schemas dans `lib/schemas/`, validés client-side au blur, serveur sur l'API
- QueryClient singleton à la racine, devtools activé en dev

### Stale times

| Type | Stale time |
|---|---|
| Listes (users, items, armoires) | 30s |
| Ressources stables (system roles, catégories) | 5min |
| Logs | 10s |

### Pagination

- Users / items / armoires : offset, 50/page (volumes < 200)
- Logs : cursor-based, infinite scroll, "Load more" fallback no-JS

### Mutations optimistes

Réservées aux cas à faible risque de rejet et où l'attente serait gênante :
- Toggle dans matrice permissions
- Qty inline dans stock
- Toggle de statut

Rollback automatique si l'API rejette + toast d'erreur. Le reste (create, delete, role assign) attend la confirmation serveur.

### Toasts (Sonner)

- Success : 3s, vert discret, top-right
- Error : sticky jusqu'à dismiss, rouge, action "Réessayer" si pertinent
- Loading > 1s : promise-based, spinner intégré
- Grouping : actions multiples groupées (« 12 permissions mises à jour »)

### Real-time

Pas en MVP. Bouton « Refresh » manuel sur logs et stock. SSE possible post-MVP sur `/logs`.

---

## 8. Loading / empty / error patterns

### Loading

| Cas | Pattern |
|---|---|
| Liste qui charge | `<Skeleton>` aux dimensions exactes, 5–10 ghost rows |
| Détail qui charge | Skeleton header + tabs ghost |
| Bouton en action | `<Button loading>` — spinner inline, disabled, largeur fixe |
| Auto-save inline | Dot status à droite : `●` pendant save, `✓` 800ms après succès, fade |
| Navigation entre pages | Barre de progression top (SvelteKit `navigating` store) |

### Empty

Icône Lucide grande (`h-12 w-12`, opacity 50), titre medium, description muted, CTA seulement si l'utilisateur peut agir.

### Error

| Type | Traitement |
|---|---|
| Network / 5xx | `<ErrorState>` plein-écran avec retry + lien support |
| 4xx avec field identifiable | Erreur inline + focus sur 1er invalid |
| 4xx générique | Banner rouge en haut du form avec message + fix |
| 403 | `<ErrorState>` « Tu n'as pas les droits » + explication ("requiert flag manager") |
| 404 | `<ErrorState>` « Ressource introuvable » + retour liste |

---

## 9. Permission gating UI

- Stores `currentUser` + `permissions` peuplés au login, refresh sur token refresh
- Helper `can(action, resource)` retourne boolean
- Composant `<Gated action="...">` cache son slot si non autorisé
- Sidebar items conditionnels (voir §4)
- Boutons d'action cachés (pas grisés) si pas autorisé

**L'enforcement réel est côté API.** Le gating UI = UX (cacher l'inutile), pas sécurité.

---

## 10. Responsive

### Breakpoints

| Breakpoint | Px | Comportement |
|---|---|---|
| Base | < 640 | Sidebar drawer, tables = card stack, dialogs = full-screen sheets |
| `sm` | ≥ 640 | Tables compactes, sidebar toujours en drawer |
| `md` | ≥ 768 | Sidebar persistante collapsible |
| `lg` | ≥ 1024 | Layout cible, tout déroulé |
| `xl` / `2xl` | ≥ 1280 / 1536 | Contenu capé `max-w-7xl` centré |

### Patterns mobiles spécifiques

- Tables → card stack
- Matrice permissions → liste accordéon par armoire avec 3 switches
- Tabs (4+) → `<Select>` au-dessus du contenu
- Sheet edit → `Drawer` bottom-up avec drag handle
- Tous les états hover ont un équivalent press

---

## 11. Accessibilité

WCAG AA, vérifié au cours du build.

| Critère | Standard |
|---|---|
| Contraste texte | 4.5:1 normal, 3:1 large |
| Focus visible | Ring 2px indigo-500 à 60% opacity sur tous les interactifs |
| Keyboard nav | Tab order = visuel, Esc ferme overlays, Enter submit, flèches dans menus |
| `aria-*` | Label icon-only buttons, `aria-live` polite toasts, `aria-current` sidebar |
| Lecteurs d'écran | Hiérarchie h1–h3, landmarks `<main>` `<nav>` `<header>` |
| Reduced motion | Respect `prefers-reduced-motion`, transitions > 150ms désactivées |
| Color-only meaning | Jamais — toujours doubler couleur + icône + texte |
| Form errors | Inline + `aria-invalid` + focus auto sur 1er invalid |

---

## 12. Performance

Cibles vérifiées avec Lighthouse au cours du build :

| Métrique | Cible |
|---|---|
| FCP (4G) | < 1.5s |
| TTI | < 2.5s |
| Bundle initial gzipped | < 200 KB (hors fonts) |
| CLS | < 0.1 |
| Long tasks > 50ms | < 3 par route |

Leviers : code-splitting par route (SvelteKit), lazy import composants lourds (matrice, charts futurs), images `loading="lazy"`, fonts `font-display: swap` + préchargement Inter Regular + 500.

### Animations

- Durations : 150ms micro / 200ms transitions / 300ms entrées / max 400ms
- Easing : `ease-out` entrées, `ease-in` sorties
- Transformations uniquement (`transform`, `opacity`) — jamais `width/height/top/left`
- Skeletons : pulse 1.5s

---

## 13. Testing

Stratégie pragmatique (pas full-TDD).

| Couche | Outil | Discipline |
|---|---|---|
| Helpers permission (`lib/auth/can.ts`) | Vitest | **TDD obligatoire** — pièce critique |
| Zod schemas | Vitest | Inputs valides + invalides par schema |
| Primitives custom | Testing Library + Vitest | Rendu basique, snapshot léger |
| Pages métier | — | Couvert par E2E |
| Happy paths critiques | Playwright | E2E fin de chaque phase, dans `e2e/` |
| Régression visuelle | Manuel + dark audit P4 | Pas de Chromatic/Percy en MVP |

Pas de gate CI bloquant sur couverture en P0–P3. En P4 : lock 90%+ sur helpers permission + schemas.

---

## 14. Plan par phases

### Phase 0 — Foundation

**Livrables** :
- Init SvelteKit 2 + Vite 7 + TypeScript strict + Tailwind v4
- shadcn-svelte + thème zinc/indigo + composants P0 listés (§5)
- Inter Variable + JetBrains Mono via `@fontsource`
- Lucide, `@tanstack/svelte-query` + devtools, Zod, `sveltekit-superforms`
- App shell : layout racine avec Sidebar + Topbar + breadcrumb + theme toggle + user menu
- Primitives custom (§5)
- Auth `hooks.server.ts` : OIDC handler, session cookies httpOnly, refresh auto, route guards
- Stores `currentUser`, `permissions`
- Helpers `requireTier`, `requireFlag`, `can(action, resource)` **avec tests TDD**
- Client API typé FastAPI avec Zod runtime validation des responses
- Routes : `/`, `/login`, `/logout`, `/me` (stub), `+error.svelte`
- Toolchain : ESLint, Prettier, Husky, lint-staged, Vitest, Playwright skeleton
- README initial décrivant l'arborescence

**Aucune page métier.** Sidebar avec entrées présentes mais non implémentées.

### Phase 1 — Gouvernance

**Livrables** :
- `/users` : liste, search, filter tier, filter status, pagination 50
- `/users/[id]` : tabs Roles / Activity / Sessions
- `/roles` : liste avec tabs Système / Custom
- `/roles/[id]?tab=permissions` : matrice complète armoires × (view/open/edit), contraintes logiques
- `/roles/[id]?tab=users` : users avec ce rôle
- `/roles/[id]?tab=settings` : éditer (créer si custom)
- Composants installés : `Table`, `Form`, `Combobox`, `Dialog`, `AlertDialog`, `Tabs`, `Switch`, `Checkbox`
- Dialogs : assigner rôle, créer/éditer rôle custom, revoke user, delete role custom
- Permission gating fin-en-fin (sidebar conditionnel, boutons gated, garde route serveur)
- E2E : assigner rôle, créer rôle custom, toggle permission dans matrice

### Phase 2 — Armoires

**Livrables** :
- `/armoires` : grid de cards filtrable « Mes accès / Toutes »
- `/armoires/[id]?tab=stock` : liste items+qty, inline edit si `can_edit`
- `/armoires/[id]?tab=permissions` : vue inverse de la matrice — qui peut quoi sur cette armoire
- `/armoires/[id]?tab=activity` : audit filtré
- Sheet : créer/éditer métadonnées armoire (gated)
- AlertDialog : delete armoire (type-to-confirm)
- E2E : naviguer Mes armoires → consulter stock → éditer qty si autorisé

### Phase 3 — Items + Stocks

**Livrables** :
- `/items` : table search par ref/name, filter category, pagination
- `/items/[id]?tab=details` : read + edit metadata
- `/items/[id]?tab=stocks` : répartition de l'item dans les armoires (vue inverse)
- `/items/[id]?tab=activity` : audit filtré
- Sheet : créer/éditer item, upload photo vers rustfs (preview, drag-drop)
- `/stocks` : table flat filtrable, inline edit qty, export CSV (T1+)
- Composants : photo display avec zoom, FileUploader
- E2E : créer item avec photo, ajuster stock dans armoire, exporter CSV

### Phase 4 — Audit + home + polish

**Livrables** :
- `/logs` : timeline, filtres URL, infinite scroll, side sheet détail event, export CSV
- `/` : home overview avec widgets role-adaptés (Mes armoires, Activité, Items low-stock conditionnel, Users à attribuer conditionnel, Anomalies conditionnel)
- `/me` : Profile complet, OTP setup, sessions, mon activité
- Command palette ⌘K (CommandDialog) : search global + nav rapide
- Route placeholder `/treasury` (page « Bientôt disponible »)
- Polish : transitions, dark mode audit, a11y audit (axe-core), Lighthouse audit
- Documentation : README dashboard mis à jour, doc utilisateur courte par rôle
- E2E : happy path complet (login OTP → assign role → consult armoire → edit stock → check logs)

---

## 15. Choix explicitement écartés

- **TanStack Query absent en MVP** : initialement retenu (SvelteKit natif + invalidate), changé à TanStack Query dès P0 sur demande utilisateur (cache cross-route et prefetch).
- **Form actions SvelteKit** : remplacées par mutations TanStack Query client-side ; sécurité enforced API-side.
- **TDD strict sur toute la codebase** : limité aux helpers de permission et aux schemas Zod ; le reste est manuel + E2E.
- **Mobile post-MVP** : rejeté — responsive prévu dès P0, l'usage mobile (consulter ses armoires en salle) est légitime.
- **WCAG AAA** : rejeté — outil interne, AA est le standard professionnel suffisant.
- **SSE pour logs live** : rejeté en MVP — bouton refresh manuel suffit ; SSE réintroductible post-MVP.
- **Dashboard overview en P0** : rejeté — les sources de données n'existent pas encore en P0, livré en P4 quand tout existe.

---

## 16. Open points (à clarifier avant ou pendant l'implémentation)

- **Flag `audit_viewer`** : nouveau flag à ajouter au modèle de rôles pour découpler la lecture des logs du tier T0. À confirmer avec le backend API. Alternative : restreindre `/logs` à T0 sans flag custom.
- **Couleur d'accent Devinci/Fablab** : indigo retenu par défaut, mais à reconfirmer si une charte Devinci existe.
- **Workflow de création de user** : la création passe-t-elle entièrement par Keycloak admin (lien externe) ou par le dashboard via l'API (`POST /users` à créer côté API) ? Affecte le bouton « Inviter » sur `/users`.
- **Upload photo vers rustfs** : endpoint API à confirmer (le CDC mentionne « écrit par l'API uniquement », il faut donc un `POST /items/{id}/photo` ou similaire).
- **Threshold low-stock** : par item (champ dédié sur Item) ou global (constante) ? Affecte le widget home + la page items.
