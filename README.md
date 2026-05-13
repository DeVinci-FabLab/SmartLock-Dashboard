# SmartLock Dashboard

Tableau de bord interne pour la gestion des armoires connectées, des stocks, des rôles et de l'historique d'actions du **Devinci Fablab**.

> Outil interne, multi-rôles, avec authentification SSO (Keycloak), historique non altérable, panneau de contrôle tactile sur l'armoire, et affichage public à venir.

---

## Sommaire

- [Contexte](#contexte)
- [Intention](#intention)
- [Stack technique](#stack-technique)
- [Décisions clés](#décisions-clés)
- [Architecture](#architecture)
- [Structure du projet](#structure-du-projet)
- [Roadmap](#roadmap)
- [Démarrage rapide](#démarrage-rapide)
- [Installation détaillée](#installation-détaillée)
- [Commandes Make](#commandes-make)
- [Variables d'environnement](#variables-denvironnement)
- [Documents de référence](#documents-de-référence)
- [Licence](#licence)

---

## Contexte

Le Devinci Fablab dispose d'armoires connectées dont l'accès est contrôlé par badge étudiant. Chaque armoire contient un inventaire d'items (filaments, composants électroniques, textiles, fournitures de bureau, etc.). Le besoin :

- Gérer un **inventaire** dimensionné jusqu'à 100 types d'items par armoire.
- Tracer **toutes les actions** (entrée, sortie, modification) dans un historique non altérable.
- Contrôler l'accès aux armoires via une **WhiteList** dérivée des rôles utilisateur.
- Permettre à des **rôles distincts** (membre, 3D, électronique, textile, matérialiste, codir, admin) d'avoir des permissions différenciées sur l'UI.
- Offrir un **panneau tactile** sur l'armoire elle-même pour consulter et mettre à jour les stocks.
- Préparer un **affichage public** (kiosque) pour communiquer l'état du fablab.

Le cahier des charges complet et les variations par rôle sont décrits dans [`CDC.md`](./CDC.md).

## Intention

- **Outil interne maintenu par l'équipe**, pas un livrable client : les choix techniques privilégient la productivité de l'équipe et la maintenabilité long terme sur la transférabilité.
- **Évolutif** : démarrer sur la gestion d'inventaire, puis étendre vers d'autres outils internes du fablab, l'affichage public et le panneau tactile sur l'armoire — sur la même base technique.
- **Explicite plutôt que magique** : on privilégie les stacks où le code écrit est le code qui tourne (débogage facile, reprise par d'autres contributeurs étudiants).
- **Possession du code UI** : composants copiés dans le projet (style shadcn), zéro lock-in sur une bibliothèque tierce.

## Stack technique

| Couche | Choix | Justification courte |
|---|---|---|
| Meta-framework | **SvelteKit** (Svelte 5 + runes) | SSR explicite, file-based routing, hooks server, déploiement Node simple |
| UI / composants | **shadcn-svelte** + **bits-ui** | Composants copiés, zéro dépendance UI tierce |
| Styles | **Tailwind CSS v4** | Système de design utilitaire, aligné avec shadcn |
| Icônes | **Lucide** (`@lucide/svelte`) | Set d'icônes cohérent, léger |
| Auth | **Keycloak** (OIDC) via `@auth/sveltekit` ou `arctic` | SSO interne, gestion centralisée des comptes étudiants |
| Base de données | **PostgreSQL** (à intégrer) | Transactions, JSONB, row-level security pour l'audit |
| ORM | **Drizzle** (à intégrer) | SQL-first, type-safe, philosophie explicite |
| Validation | **Zod** (à intégrer) | Schémas partagés client / serveur |
| Build / dev | **Vite 7** | HMR rapide, config minimale |
| Conteneurisation | **Docker** + Docker Compose | Dev reproductible, déploiement self-hosted |

Le raisonnement détaillé derrière ces choix (et les alternatives écartées) est documenté dans [`decision-plan.md`](./decision-plan.md).

## Décisions clés

- **SvelteKit plutôt que Next.js**. Le projet est un outil interne maintenu par l'équipe sur la durée. L'argument "transférable à n'importe quel dev React" pèse moins que "moins de magie cachée, plus facile à reprendre pour un contributeur étudiant". SvelteKit a une séparation client / serveur explicite (`+page.svelte` vs `+page.server.ts`) sans Server Components ni cache defaults qui changent entre versions.
- **shadcn-svelte accepté comme exception**. Le doc de décision globale exclut les ports communautaires de shadcn ; `shadcn-svelte` (basé sur `bits-ui`) est l'exception documentée pour ce projet, car suffisamment mature et adopté.
- **PostgreSQL + audit append-only**. L'historique des actions doit être non altérable. Implémentation prévue : table `audit_log` en append-only, le rôle DB applicatif n'a pas les droits `DELETE` ni `UPDATE` dessus. Les exceptions (président / comité de contrôle) passent par un rôle DB séparé.
- **Permissions comme données, pas comme code**. Plutôt que de coder en dur `if (role === 'codir')`, les permissions sont stockées en DB (`role` → `permissions[]`), chargées dans `hooks.server.ts` à la connexion, et l'UI est gardée par clé de permission (`armoire:create`, `role:grant:admin`). Conséquence : ajouter un rôle = insérer une ligne, pas refactor.
- **Keycloak en SSO**. L'auth n'est pas faite dans l'app : Keycloak est la source de vérité. L'app valide la session côté serveur dans `hooks.server.ts`, mappe les claims Keycloak vers les permissions internes.
- **Self-hosted via Docker**. Pas de Vercel ni de cloud serverless : l'infra reste dans le fablab. `adapter-node` + image Docker Node sur un VPS / serveur interne.

## Architecture

```
┌──────────────────┐         ┌──────────────────┐
│  Panneau tactile │         │   Affichage      │
│  (kiosque        │         │   public         │
│  Chromium)       │         │   (kiosque)      │
└────────┬─────────┘         └─────────┬────────┘
         │                             │
         ▼                             ▼
┌─────────────────────────────────────────────────┐
│              SmartLock Dashboard                │
│        (SvelteKit, adapter-node, Docker)        │
│                                                 │
│  hooks.server.ts  →  session Keycloak           │
│  +page.server.ts  →  load DB (Drizzle)          │
│  +page.svelte     →  UI (shadcn-svelte)         │
└──────────┬─────────────────────────┬────────────┘
           │                         │
           ▼                         ▼
   ┌──────────────┐          ┌──────────────┐
   │   Keycloak   │          │  PostgreSQL  │
   │  (OIDC SSO)  │          │ (data+audit) │
   └──────────────┘          └──────────────┘
```

## Structure du projet

Le code applicatif est isolé dans `web/`. La racine ne contient que des éléments transverses (docs, Make, Docker, ignores). Cela permet d'ajouter facilement d'autres composants à côté plus tard (ex : `firmware/`, `infra/`, `docs/`) sans réorganiser.

```
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
├── decision-plan.md         Justification de la stack
├── README.md                Ce fichier
├── Makefile                 Commandes raccourcies (opère dans web/ via npm --prefix)
├── LICENSE
└── .gitignore
```

> Note : `.dockerignore` vit dans `web/` car Docker lit son `.dockerignore` à la racine du contexte de build (qui est `web/`, pas la racine du repo). C'est la convention.

## Roadmap

Construit incrémentalement, une couche à la fois :

1. **MVP UI navigable** (en cours, branche `draft-layout`) — layouts, composants shadcn-svelte, navigation entre pages "Armoires" et "Rôles", données statiques.
2. **Auth Keycloak** — intégration OIDC, sessions cookies, garde de routes, mapping claims → rôles internes.
3. **PostgreSQL + Drizzle** — schéma `users`, `roles`, `permissions`, `armoires`, `items`, `audit_log` ; rôles DB séparés (applicatif vs élevé).
4. **Permissions data-driven** — chargement des permissions en session, gates UI par clé, gates server par middleware.
5. **CRUD inventaire** — affichage, ajout, suppression d'items et types d'items selon rôle.
6. **Historique** — vue audit consultable, filtres par armoire/utilisateur/date, immuabilité garantie au niveau DB.
7. **Panneau tactile** — vue dédiée optimisée écran tactile (UI gros boutons, pas d'interaction clavier requise).
8. **Affichage public** — section `/display/*` sans auth, read-only, kiosque (autorefresh, plein écran).
9. **Outils additionnels** — autres modules métier du fablab sur la même base.

## Démarrage rapide

```bash
# 1. Cloner et entrer dans le dossier
git clone <url> SmartLock-Dashboard && cd SmartLock-Dashboard/draft-layout

# 2. Installer les dépendances
make install

# 3. Lancer en dev (http://localhost:5173)
make dev
```

Ou via Docker (recommandé pour reproduire l'environnement) :

```bash
make docker-dev
```

## Installation détaillée

### Prérequis

- **Node.js 20+** et **npm**
- **Docker** + **Docker Compose v2** (optionnel mais recommandé)
- **GNU Make** (préinstallé sur macOS/Linux ; Windows : via WSL ou Chocolatey)

### Installation locale (sans Docker)

```bash
make install     # npm install
make dev         # serveur de dev sur :5173
make check       # vérification des types Svelte / TypeScript
```

### Installation avec Docker

Le développement en conteneur garantit que tous les contributeurs travaillent avec la même version de Node, sans toucher leur installation locale. Le code est monté en bind mount, le HMR fonctionne normalement.

```bash
make docker-dev          # build + up, attaché aux logs
make docker-dev-detached # idem mais en arrière-plan
make docker-logs         # suivre les logs du conteneur
make docker-down         # arrêt
```

### Préparation production (à venir)

Le `docker/Dockerfile` de production existe mais nécessite de passer à `@sveltejs/adapter-node` (actuellement `adapter-auto`) :

```bash
npm --prefix web install -D @sveltejs/adapter-node
```

Puis modifier `web/svelte.config.js` :

```js
import adapter from '@sveltejs/adapter-node';
// ...
kit: { adapter: adapter() }
```

Ensuite :

```bash
make docker-prod         # build + lance l'image de prod sur :3000
make docker-prod-down    # arrêt
```

## Commandes Make

`make help` (ou simplement `make`) affiche la liste complète. Résumé :

| Catégorie | Cible | Effet |
|---|---|---|
| Dev local | `install` | Installe les dépendances npm |
| Dev local | `dev` | Lance Vite sur `:5173` |
| Dev local | `build` | Build de production (requiert adapter-node) |
| Dev local | `preview` | Sert le build de production localement |
| Dev local | `check` | Vérifie le typage Svelte / TS |
| Docker | `docker-dev` | Lance l'app en conteneur (HMR) |
| Docker | `docker-dev-detached` | Idem en arrière-plan |
| Docker | `docker-logs` | Logs du conteneur de dev |
| Docker | `docker-down` | Arrête le conteneur de dev |
| Docker | `docker-prod-build` | Build l'image de production |
| Docker | `docker-prod` | Lance la prod en arrière-plan |
| Docker | `docker-prod-down` | Arrête la prod |
| Nettoyage | `clean` | Supprime `node_modules`, `.svelte-kit`, `build` |
| Nettoyage | `clean-docker` | Supprime conteneurs, volumes et images locaux |

## Variables d'environnement

Aucune n'est nécessaire pour démarrer en dev sur l'UI seule. Au fur et à mesure que les couches s'ajoutent, créer un `web/.env` (non commité — SvelteKit lit le `.env` depuis la racine du projet, qui est `web/`) :

```dotenv
# À venir, exemples
DATABASE_URL=postgres://user:pass@localhost:5432/smartlock
KEYCLOAK_ISSUER=https://keycloak.devinci.fr/realms/fablab
KEYCLOAK_CLIENT_ID=smartlock-dashboard
KEYCLOAK_CLIENT_SECRET=...
AUTH_SECRET=...
```

Un `web/.env.example` sera maintenu pour documenter les variables attendues.

## Documents de référence

- [`CDC.md`](./CDC.md) — cahier des charges, rôles, permissions, contraintes métier.
- [`decision-plan.md`](./decision-plan.md) — justification détaillée de la stack et grille de décision pour les autres projets de l'équipe.

## Licence

Voir [`LICENSE`](./LICENSE).
