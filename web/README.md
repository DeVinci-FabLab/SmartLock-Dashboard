# SmartLock Dashboard — `web/`

SvelteKit 2 + Svelte 5 (runes mode) + Tailwind v4 + shadcn-svelte.

## Setup

1. Copy `.env.example` to `.env` and fill in Keycloak + API URLs.
2. Install deps:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server (http://localhost:5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | TypeScript + Svelte check |
| `npm run test` | Vitest run (unit + integration) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright E2E |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

## Project layout

```
src/
├── app.css                          Global Tailwind tokens (zinc + indigo, light + dark)
├── app.html                         SvelteKit HTML shell
├── hooks.server.ts                  OIDC session gate, token refresh, route guards
├── lib/
│   ├── auth/                        Tiers, permissions, Keycloak client, session
│   ├── api/                         Typed API client per resource
│   ├── schemas/                     Zod schemas for DTOs
│   ├── stores/                      Svelte 5 stores (currentUser, permissions)
│   ├── components/
│   │   ├── ui/                      shadcn-svelte vendored components
│   │   ├── primitives/              Custom primitives (PageHeader, EmptyState, …)
│   │   ├── layout/                  AppSidebar, AppTopbar, UserMenu, ThemeToggle
│   │   └── query/                   TanStack Query provider
│   └── config.ts                    Env var loader
└── routes/                          Pages
```

## References

- Spec : [`docs/superpowers/specs/2026-05-14-mvp-dashboard-design.md`](../docs/superpowers/specs/2026-05-14-mvp-dashboard-design.md)
- P0 plan : [`docs/superpowers/plans/2026-05-14-mvp-dashboard-p0-foundation.md`](../docs/superpowers/plans/2026-05-14-mvp-dashboard-p0-foundation.md)
- CDC : [`../CDC.md`](../CDC.md)
- Auth API : [`../SmartLock-Authentication-Authorization/`](../SmartLock-Authentication-Authorization/)
