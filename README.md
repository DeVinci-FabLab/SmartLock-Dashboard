# SmartLock Dashboard

Tableau de bord interne pour la gestion des armoires connectées, des stocks, des rôles et de l'historique d'actions du **Devinci Fablab**.

> Outil interne, multi-rôles, avec authentification SSO (Keycloak), modèle ACM en tiers (rôles système immuables + rôles personnalisés configurables via le dashboard), et historique d'actions append-only.

---

## Sommaire

- [SmartLock Dashboard](#smartlock-dashboard)
  - [Sommaire](#sommaire)
  - [Contexte](#contexte)
  - [Intention](#intention)
  - [Stack technique](#stack-technique)
  - [Décisions clés](#décisions-clés)
  - [Architecture](#architecture)
  - [Structure du projet](#structure-du-projet)
  - [Roadmap](#roadmap)
  - [Démarrage rapide](#démarrage-rapide)
  - [Installation détaillée](#installation-détaillée)
    - [Prérequis](#prérequis)
    - [Installation locale (sans Docker)](#installation-locale-sans-docker)
    - [Installation avec Docker](#installation-avec-docker)
    - [Préparation production (à venir)](#préparation-production-à-venir)
  - [Commandes Just](#commandes-just)
  - [Variables d'environnement](#variables-denvironnement)
  - [Documents de référence](#documents-de-référence)
  - [Licence](#licence)

---

## Contexte

Le Devinci Fablab dispose d'armoires connectées dont l'accès est contrôlé par badge étudiant. Chaque armoire contient un inventaire d'items (filaments, composants électroniques, textiles, fournitures de bureau, etc.). Le besoin :

- Gérer un **inventaire** dimensionné jusqu'à 100 types d'items par armoire, avec photos, références d'achat externes (Amazon, RS, fournisseur direct) et seuils de stock bas.
- Tracer **toutes les actions** (accès NFC, mouvements de stock, modifications de catalogue, attributions de rôles, cycle de vie de comptes, génération de bons de commande) dans un audit log append-only au niveau DB.
- Contrôler l'accès via un **modèle ACM en tiers** (T0..T5) où chaque tier contient des rôles pairs (Zero Trust, aucun droit implicite). Le modèle distingue **6 rôles système immuables** (Admin sys, Présidence, Codir, Trésorerie, Bureau, Membre) et des **rôles personnalisés** (Agents, Responsables, Createch, Ingénieur de recherche…) créés/édités/supprimés via le dashboard.
- Chaque rôle porte deux flags : **`manager`** (peut attribuer/révoquer des rôles utilisateurs aux tiers strictement inférieurs) et **`role_admin`** (peut gérer le catalogue de rôles). Permissions par armoire en enum 3 niveaux (`can_view < can_open < can_edit`). Effectif sur un utilisateur = max sur tous ses rôles.
- Générer des **bons de commande CSV** pour la Trésorerie à partir des alertes de stock bas, stockés dans un object storage S3-compatible.

Le cahier des charges complet est décrit dans [`CDC.md`](./CDC.md). Le panneau tactile et l'affichage public vitrine sont **hors scope** de ce projet.

## Intention

- **Outil interne maintenu par l'équipe**, pas un livrable client : les choix techniques privilégient la productivité de l'équipe et la maintenabilité long terme sur la transférabilité.
- **Évolutif** : démarrer sur la gestion d'inventaire et de rôles, puis étendre vers d'autres outils internes du fablab sur la même base technique. Le panneau tactile et l'éventuel affichage public sont traités dans des projets séparés qui consomment la même API d'auth.
- **Explicite plutôt que magique** : on privilégie les stacks où le code écrit est le code qui tourne (débogage facile, reprise par d'autres contributeurs étudiants).
- **Possession du code UI** : composants copiés dans le projet (style shadcn), zéro lock-in sur une bibliothèque tierce.

## Stack technique

| Couche               | Choix                                                | Justification courte                                                                                                                                                                              |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Meta-framework       | **SvelteKit** (Svelte 5 + runes)                     | SSR explicite, file-based routing, hooks server, déploiement Node simple                                                                                                                          |
| UI / composants      | **shadcn-svelte** + **bits-ui**                      | Composants copiés, zéro dépendance UI tierce                                                                                                                                                      |
| Styles               | **Tailwind CSS v4**                                  | Système de design utilitaire, aligné avec shadcn                                                                                                                                                  |
| Icônes               | **Lucide** (`@lucide/svelte`)                        | Set d'icônes cohérent, léger                                                                                                                                                                      |
| Auth (SSO)           | **Keycloak** (OIDC + PKCE, OTP pour T2+)             | SSO interne. Le dashboard ne parle jamais à Keycloak directement, tout passe par l'API.                                                                                                           |
| API d'auth / données | **SmartLock-Authentication-Authorization** (FastAPI) | Service externe ([repo](https://github.com/DeVinci-FabLab/SmartLock-Authentication-Authorization)). Source de vérité pour identités, rôles, permissions, audit. Le dashboard est son client REST. |
| Base de données      | **PostgreSQL** (côté API d'auth)                     | Transactions, JSONB, audit append-only via rôle DB séparé.                                                                                                                                        |
| Object storage       | **rustfs** (S3-compatible, drop-in MinIO)            | Stockage des photos d'items et des CSV générés. Accès via URLs signées émises par l'API.                                                                                                          |
| Validation           | **Zod** (à intégrer)                                 | Schémas partagés client / serveur côté SvelteKit                                                                                                                                                  |
| Build / dev          | **Vite 7**                                           | HMR rapide, config minimale                                                                                                                                                                       |
| Conteneurisation     | **Docker** + Docker Compose                          | Dev reproductible, déploiement self-hosted. Le compose inclut SvelteKit + rustfs.                                                                                                                 |

Les décisions structurantes derrière ces choix sont résumées dans la section [Décisions clés](#décisions-clés) ci-dessous.

## Décisions clés

- **SvelteKit plutôt que Next.js**. Le projet est un outil interne maintenu par l'équipe sur la durée. L'argument "transférable à n'importe quel dev React" pèse moins que "moins de magie cachée, plus facile à reprendre pour un contributeur étudiant". SvelteKit a une séparation client / serveur explicite (`+page.svelte` vs `+page.server.ts`) sans Server Components ni cache defaults qui changent entre versions.
- **shadcn-svelte accepté comme exception**. Le doc de décision globale exclut les ports communautaires de shadcn ; `shadcn-svelte` (basé sur `bits-ui`) est l'exception documentée pour ce projet, car suffisamment mature et adopté.
- **API d'auth comme single source of truth**. Le dashboard ne parle jamais à Keycloak ni à PostgreSQL directement — tout passe par l'API [`SmartLock-Authentication-Authorization`](https://github.com/DeVinci-FabLab/SmartLock-Authentication-Authorization) (FastAPI). Centralise auth, permissions, audit, contrôle d'accès. Le dashboard est un client REST + un BFF SvelteKit fin via `+page.server.ts`. Conséquence : une seule surface à sécuriser, une seule matrice ACM à maintenir, et le panneau tactile (autre projet) consomme la même API.
- **Modèle ACM en tiers, rôles système + custom**. Hiérarchie linéaire de 6 tiers (T0..T5), rôles pairs au sein d'un tier. 6 rôles système codés en dur (Admin sys, Présidence, Codir, Trésorerie, Bureau, Membre) ; tout le reste est custom et configurable via dashboard. Chaque rôle porte les flags `manager` et `role_admin`, qui dictent qui peut attribuer/révoquer un rôle utilisateur et qui peut gérer le catalogue. Conséquence : créer un nouvel Agent ou Responsable = quelques clics côté dashboard, pas un déploiement de code.
- **Audit log append-only**. La table d'audit est en append-only au niveau DB. Le rôle applicatif n'a ni `DELETE` ni `UPDATE` dessus. Seul un rôle DB séparé (Admin sys uniquement, hors API) peut intervenir pour des raisons techniques (corruption, migration, archivage). Rétention indéfinie par défaut.
- **rustfs pour les assets binaires**. Service d'object storage S3-compatible (drop-in MinIO) déployé dans le compose de ce projet. Stocke les photos d'items et les CSV générés par le workflow Trésorerie. L'API détient les credentials du bucket ; le dashboard accède aux assets via des URLs signées émises par l'API, valables un temps court.
- **Keycloak en SSO**. L'auth n'est pas faite dans l'app : Keycloak est la source de vérité, accédée uniquement par l'API d'auth. Le dashboard reçoit un JWT, valide la session côté serveur dans `hooks.server.ts`, et propage le token aux appels API.
- **Self-hosted via Docker**. Pas de Vercel ni de cloud serverless : l'infra reste dans le fablab. `adapter-node` + image Docker Node sur un VPS / serveur interne, plus rustfs en service voisin.

## Architecture

```plain
                  ┌────────────────────────┐
                  │     Utilisateur        │
                  │     (navigateur)       │
                  └───────────┬────────────┘
                              │ HTTPS (OIDC + PKCE login,
                              │        Bearer JWT pour API)
                              ▼
              ┌────────────────────────────────────────┐
              │      SmartLock Dashboard               │
              │      (SvelteKit + adapter-node)        │  ← ce projet
              │                                        │
              │  hooks.server.ts  →  session JWT       │
              │  +page.server.ts  →  BFF / proxy REST  │
              │  +page.svelte     →  UI (shadcn)       │
              └─────────────────┬──────────────────────┘
                                │ REST + Bearer JWT
                                ▼
              ┌────────────────────────────────────────┐
              │      SmartLock-Authentication-         │
              │      Authorization (FastAPI)           │  ← projet voisin
              └────┬───────────────┬──────────────┬────┘
                   │               │              │
                   ▼               ▼              ▼
           ┌──────────┐     ┌──────────┐     ┌──────────┐
           │ Keycloak │     │PostgreSQL│     │  rustfs  │
           │  (OIDC)  │     │ (data +  │     │  (S3 obj │
           │          │     │  audit)  │     │   store) │
           └──────────┘     └──────────┘     └─────┬────┘
                                                   │
                                                   │ déployé dans
                                                   │ le compose
                                                   │ de ce projet

      ┌──────────────────────────┐
      │  Panneau tactile NFC     │  ← autre projet (hors scope) :
      │  (Raspberry Pi)          │    consomme la même API d'auth.
      └──────────────────────────┘
```

## Structure du projet

Le code applicatif est isolé dans `web/`. La racine ne contient que des éléments transverses (docs, justfile, Docker, ignores). Cela permet d'ajouter facilement d'autres composants à côté plus tard (ex : `firmware/`, `infra/`, `docs/`) sans réorganiser.

```plain
.
├── docker/                  Dockerfiles et compose (dev + prod)
│   ├── Dockerfile           Image de production (multi-stage, adapter-node)
│   ├── Dockerfile.dev       Image de dev (Vite HMR)
│   ├── compose.yaml         Compose dev (context: ../web, bind mount + HMR)
│   └── compose.prod.yaml    Compose prod (context: ../web, restart policy)
├── web/                     Projet SvelteKit (tout le code applicatif)
│   ├── src/
│   │   ├── routes/          Routes SvelteKit (file-based)
│   │   │   ├── +layout.svelte
│   │   │   ├── +page.svelte
│   │   │   └── Main/        Section principale (à structurer)
│   │   ├── lib/
│   │   │   ├── components/ui/   Composants shadcn-svelte (copiés, modifiables)
│   │   │   ├── assets/          Logos, favicon
│   │   │   └── utils.ts         Helpers UI (cn, clsx)
│   │   ├── app.html         Template HTML racine
│   │   ├── app.css          CSS global (Tailwind import)
│   │   └── app.d.ts         Types globaux SvelteKit
│   ├── static/              Assets servis tels quels
│   ├── components.json      Config shadcn-svelte
│   ├── svelte.config.js     Config SvelteKit (adapter, runes)
│   ├── vite.config.ts       Config Vite (HMR Docker-friendly)
│   ├── tsconfig.json        Config TypeScript
│   ├── package.json
│   ├── .npmrc
│   └── .dockerignore        Lu par Docker au build (contexte = web/)
├── CDC.md                   Cahier des charges (besoins métier)
├── README.md                Ce fichier
├── justfile                 Commandes raccourcies (opère dans web/ via npm --prefix)
├── LICENSE
└── .gitignore
```

> Note : `.dockerignore` vit dans `web/` car Docker lit son `.dockerignore` à la racine du contexte de build (qui est `web/`, pas la racine du repo). C'est la convention.

## Roadmap

Construit incrémentalement, une couche à la fois :

1. **MVP UI navigable** (en cours, branche `draft-layout`) — layouts, composants shadcn-svelte, navigation entre pages "Armoires" et "Rôles", données statiques.
2. **Auth Keycloak via API** — flow OIDC + PKCE côté SvelteKit, sessions JWT serveur, OTP imposé pour les comptes T2+.
3. **Intégration API d'auth** — appels REST depuis `+page.server.ts` vers `/users`, `/roles`, `/armoires`, `/items`, `/stock`. Pas de DB locale au dashboard, tout passe par l'API.
4. **Gates côté UI** — affichage conditionné par tier et flags `manager` / `role_admin` du compte connecté (cf. CDC).
5. **CRUD inventaire** — items, catégories, stock, seuils, via les endpoints API.
6. **Historique / audit log** — vue consultable, filtres par armoire / utilisateur / date / type d'événement.
7. **Landing publique** — page `/` sans auth (présentation, lien GitHub, lien asso, bouton login).
8. **Gestion des rôles personnalisés** — vue dédiée pour comptes `role_admin = true` : créer / éditer / supprimer un rôle custom, configurer tier et flags.
9. **Workflow Trésorerie** — vue stocks bas, sélection d'items, génération CSV (stocké dans rustfs), suivi binaire `draft → clos`.
10. **Intégration rustfs** — upload des photos d'items, téléchargement des CSV via URLs signées émises par l'API.
11. **Outils additionnels** — autres modules métier du fablab sur la même base.

Le **panneau tactile** sur armoire et un éventuel **affichage public vitrine** sont hors scope de ce dépôt — ils sont traités dans des projets séparés qui consomment la même API d'auth.

## Démarrage rapide

```bash
# 1. Cloner et entrer dans le dossier
git clone <url> SmartLock-Dashboard && cd SmartLock-Dashboard

# 2. Installer les dépendances
just install

# 3. Lancer en dev (http://localhost:5173)
just dev-local
```

Ou via Docker (recommandé pour reproduire l'environnement) :

```bash
just dev
```

## Installation détaillée

### Prérequis

- **Node.js 22+** et **npm**
- **Docker** + **Docker Compose v2** (optionnel mais recommandé)
- **just** ([installation](https://github.com/casey/just?tab=readme-ov-file#installation) — `brew install just` sur macOS, `cargo install just` partout sinon)

### Installation locale (sans Docker)

```bash
just install     # npm install
just dev-local   # Vite dev server sur :5173 (sans conteneur)
just check       # svelte-check (types)
```

### Installation avec Docker

Le développement en conteneur garantit que tous les contributeurs travaillent avec la même version de Node, sans toucher leur installation locale. Le code est monté en bind mount, le HMR fonctionne normalement.

```bash
just dev         # build + up détaché sur :5173 (recipe idempotente)
just dev-logs    # suivre les logs du conteneur
just stop        # arrêter dev + prod
```

### Production

Le `docker/Dockerfile` de production utilise `@sveltejs/adapter-node` et tourne sur Node 22 alpine. Le `compose.prod.yaml` charge automatiquement `web/.env` côté host, applique le hardening (read_only, cap_drop ALL, no-new-privileges, init, non-root, limites mem/cpu/pids, log rotation) et expose un healthcheck `GET /health` (30s interval, 3 retries).

```bash
just prod        # build + up détaché sur 127.0.0.1:3000 (recipe idempotente)
just prod-logs   # suivre les logs du conteneur
just stop        # arrêter dev + prod
```

Le conteneur expose `/health` qui retourne `{"status":"ok"}` — utilisé pour le healthcheck Docker et toute supervision externe.

### Tests

```bash
just check       # svelte-check (types)
just lint        # eslint
just test        # vitest unit
just test-e2e    # playwright + axe-core a11y smoke
just ci          # tout enchaîné, fail-fast
```

La suite E2E suppose le **dev bypass** (pas de `KEYCLOAK_ISSUER` dans `web/.env`). Sous Keycloak réel, les specs auth (armoires, items, stocks, roles, logs, home, palette, a11y des routes auth) sont skippées proprement avec un motif clair dans le rapport.

## Commandes Just

`just` (sans argument) affiche le menu complet. Résumé :

| Catégorie    | Recipe       | Effet                                                                 |
| ------------ | ------------ | --------------------------------------------------------------------- |
| Repo         | `update`     | `git pull --rebase`                                                   |
| Repo         | `install`    | `npm install` dans `web/`                                             |
| Dev local    | `dev-local`  | Vite dev server sur `:5173` (sans conteneur)                          |
| Dev local    | `build`      | Build SvelteKit prod dans `web/build`                                 |
| Dev local    | `preview`    | Sert le build prod localement                                         |
| Qualité      | `check`      | svelte-check                                                          |
| Qualité      | `lint`       | eslint                                                                |
| Qualité      | `test`       | vitest unit                                                           |
| Qualité      | `test-e2e`   | playwright + axe                                                      |
| Qualité      | `ci`         | check + lint + test + test-e2e (fail-fast)                            |
| Docker dev   | `dev`        | Tear-down + rebuild + up détaché sur `:5173`                          |
| Docker dev   | `dev-logs`   | Logs du conteneur dev                                                 |
| Docker prod  | `prod`       | Tear-down + rebuild + up détaché sur `127.0.0.1:3000` (image hardened)|
| Docker prod  | `prod-logs`  | Logs du conteneur prod                                                |
| Nettoyage    | `stop`       | Arrête dev + prod (volumes conservés)                                 |
| Nettoyage    | `clean`      | Reset total — conteneurs, volumes, caches BuildKit, artefacts locaux  |

`dev` et `prod` sont idempotents : chaque appel commence par `docker compose down -v --remove-orphans` avant le `up --build`, donc pas besoin de variantes `restart-*`.

## Variables d'environnement

Aucune n'est nécessaire pour démarrer en dev sur l'UI seule. Au fur et à mesure que les couches s'ajoutent, créer un `web/.env` (non commité — SvelteKit lit le `.env` depuis la racine du projet, qui est `web/`) :

Le fichier de référence est [`web/.env.example`](./web/.env.example). À reporter dans `web/.env` (non commité) :

```dotenv
# Backend API
PUBLIC_SMARTLOCK_API_URL=https://api.smartlock.devinci-fablab.fr

# Keycloak (realm dev pour tests, prod pour production)
KEYCLOAK_ISSUER=https://auth.devinci-fablab.fr/realms/dev
KEYCLOAK_CLIENT_ID=smartlock-dashboard
KEYCLOAK_CLIENT_SECRET=...   # depuis Keycloak admin → Credentials
KEYCLOAK_REDIRECT_URI=https://dashboard.smartlock.devinci-fablab.fr/login/callback
KEYCLOAK_POST_LOGOUT_URI=https://dashboard.smartlock.devinci-fablab.fr

# Cookie de session SvelteKit (32+ bytes random — `openssl rand -hex 32`)
SESSION_SECRET=...
```

Pas de `DATABASE_URL` ni de credentials rustfs côté dashboard : le dashboard ne parle ni à PostgreSQL ni à rustfs directement, c'est l'API qui en a la responsabilité.

**Mode dev bypass** : si `KEYCLOAK_ISSUER` est vide en `dev`, le dashboard authentifie un faux user T0 avec toutes les capacités — utile pour travailler sur le chrome et les routes sans monter Keycloak.

## Documents de référence

- [`CDC.md`](./CDC.md) — cahier des charges complet : modèle ACM en tiers, rôles système et personnalisés, flags `manager` / `role_admin`, cycle de vie compte, capacités spécifiques, audit log, workflow Trésorerie, divergences avec l'API d'auth actuelle.
- [`SmartLock-Authentication-Authorization`](https://github.com/DeVinci-FabLab/SmartLock-Authentication-Authorization) — API backend FastAPI, source de vérité pour identités, rôles, permissions, audit. Le dashboard est son client.
- [`docs/superpowers/plans/`](./docs/superpowers/plans/) — historique des phases d'implémentation (P0 foundation → P4 audit + polish) avec, pour chaque phase, ce qui a été livré, ce qui a été explicitement coupé, et les dépendances backend.

## Licence

Voir [`LICENSE`](./LICENSE).
