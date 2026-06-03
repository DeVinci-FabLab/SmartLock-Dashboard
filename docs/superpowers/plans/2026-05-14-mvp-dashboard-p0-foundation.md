# SmartLock Dashboard MVP — Phase 0 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation layer of the SmartLock dashboard — design system, app shell, Keycloak auth, permission helpers, API client, and routing scaffold. No business pages yet. Output is a deployable empty shell with working login, navigation, theme toggle, and route guards.

**Architecture:** SvelteKit 2 (Svelte 5 runes mode) in `web/`. Tailwind v4 with shadcn-svelte components (zinc base, indigo accent). TanStack Query for client-side data fetching. Zod for runtime validation. Keycloak OIDC handled in `hooks.server.ts` with session cookies. Permission helpers built TDD-style (`lib/auth/`). UI primitives in `lib/components/primitives/`. Existing `web/` skeleton kept (package.json, svelte.config.js, components.json) — only the dummy routes and stale `lib/index.ts` are wiped.

**Tech Stack:**
- SvelteKit 2, Svelte 5 (runes), Vite 8, TypeScript strict
- Tailwind v4, shadcn-svelte (style `vega`, base `zinc`, accent `indigo`), bits-ui
- `@tanstack/svelte-query` + devtools, Zod
- `@fontsource-variable/inter`, `@fontsource/jetbrains-mono`
- `@lucide/svelte`, `mode-watcher`, `clsx`, `tailwind-merge`, `tailwind-variants`
- `openid-client` for Keycloak OIDC server-side
- Vitest + `@testing-library/svelte`, Playwright
- ESLint + Prettier + Husky + lint-staged

**Spec reference:** `docs/superpowers/specs/2026-05-14-mvp-dashboard-design.md`

**Working directory for all commands below:** `web/` (the SvelteKit project). All file paths in this plan are relative to `web/` unless specified otherwise.

---

## File Structure (target after P0)

```
web/
├── package.json                  [modify]
├── components.json               [modify: baseColor → zinc]
├── svelte.config.js              [modify: fix alias]
├── eslint.config.js              [create]
├── .prettierrc                   [create]
├── .prettierignore               [create]
├── .husky/pre-commit             [create]
├── vitest.config.ts              [create]
├── playwright.config.ts          [create]
├── .env.example                  [create]
├── tests/
│   └── e2e/smoke.spec.ts         [create]
└── src/
    ├── app.html                  [modify: theme detection script]
    ├── app.css                   [modify or create at src/app.css]
    ├── app.d.ts                  [modify: Locals type]
    ├── hooks.server.ts           [create]
    ├── lib/
    │   ├── utils.ts              [keep cn(); add formatters]
    │   ├── auth/
    │   │   ├── types.ts          [create]
    │   │   ├── tiers.ts          [create]
    │   │   ├── tiers.test.ts     [create]
    │   │   ├── permissions.ts    [create]
    │   │   ├── permissions.test.ts [create]
    │   │   ├── keycloak.ts       [create]
    │   │   └── session.ts        [create]
    │   ├── stores/
    │   │   ├── user.svelte.ts    [create — uses runes]
    │   │   └── permissions.svelte.ts [create]
    │   ├── api/
    │   │   ├── client.ts         [create]
    │   │   ├── client.test.ts    [create]
    │   │   ├── users.ts          [create]
    │   │   ├── roles.ts          [create]
    │   │   ├── armoires.ts       [create]
    │   │   ├── items.ts          [create]
    │   │   ├── stocks.ts         [create]
    │   │   └── logs.ts           [create]
    │   ├── schemas/
    │   │   ├── user.ts           [create]
    │   │   ├── user.test.ts      [create]
    │   │   ├── role.ts           [create]
    │   │   ├── armoire.ts        [create]
    │   │   ├── item.ts           [create]
    │   │   ├── stock.ts          [create]
    │   │   └── permission.ts     [create]
    │   ├── components/
    │   │   ├── ui/               [shadcn-managed: add sidebar, sheet, breadcrumb, separator, sonner, skeleton, dropdown-menu, tooltip]
    │   │   ├── primitives/
    │   │   │   ├── PageHeader.svelte    [create]
    │   │   │   ├── EmptyState.svelte    [create]
    │   │   │   ├── LoadingState.svelte  [create]
    │   │   │   ├── ErrorState.svelte    [create]
    │   │   │   ├── RoleBadge.svelte     [create]
    │   │   │   ├── PermissionPill.svelte [create]
    │   │   │   └── Gated.svelte         [create]
    │   │   ├── layout/
    │   │   │   ├── AppSidebar.svelte    [create]
    │   │   │   ├── AppTopbar.svelte     [create]
    │   │   │   ├── AppBreadcrumbs.svelte [create]
    │   │   │   ├── UserMenu.svelte      [create]
    │   │   │   └── ThemeToggle.svelte   [create]
    │   │   └── query/
    │   │       └── QueryProvider.svelte [create]
    │   └── config.ts             [create — env loader]
    └── routes/
        ├── +layout.svelte        [rewrite]
        ├── +layout.server.ts     [create]
        ├── +page.server.ts       [create — redirect /armoires]
        ├── +error.svelte         [create]
        ├── login/
        │   ├── +page.server.ts   [create — initiate OIDC]
        │   └── callback/+server.ts [create]
        ├── logout/+server.ts     [create]
        ├── me/+page.svelte       [create stub]
        ├── armoires/+page.svelte [create placeholder]
        ├── users/+page.svelte    [create placeholder]
        ├── roles/+page.svelte    [create placeholder]
        ├── items/+page.svelte    [create placeholder]
        ├── stocks/+page.svelte   [create placeholder]
        ├── logs/+page.svelte     [create placeholder]
        └── treasury/+page.svelte [create placeholder]
```

**Files explicitly wiped before starting** (committed first):
- `web/src/routes/+page.svelte`, `web/src/routes/+layout.svelte`, `web/src/routes/layout.css`
- `web/src/routes/Main/` (entire directory)
- `web/src/lib/index.ts`

The pre-installed shadcn components (`avatar`, `badge`, `button`, `card`, `table`, `tabs`) under `web/src/lib/components/ui/` are kept — they're upstream-vendored and we'll reuse them. Theme tokens will be reconfigured via `components.json` + `app.css`.

---

## Section A — Cleanup and dependency install

### Task 1: Wipe legacy routes and stale lib

**Files:**
- Delete: `web/src/routes/+page.svelte`
- Delete: `web/src/routes/+layout.svelte`
- Delete: `web/src/routes/layout.css`
- Delete: `web/src/routes/Main/` (recursive)
- Delete: `web/src/lib/index.ts`

- [ ] **Step 1: Delete stale files**

Run from repo root:
```bash
cd web && rm -rf src/routes/Main src/routes/+page.svelte src/routes/+layout.svelte src/routes/layout.css src/lib/index.ts && cd ..
```

- [ ] **Step 2: Verify project structure**

Run: `ls web/src/routes/`
Expected: empty directory listing (or only `.gitkeep` if any).

- [ ] **Step 3: Commit**

```bash
git add -A web/src/
git commit -m "chore(web): wipe legacy routes and stale lib/index for P0 reboot"
```

---

### Task 2: Install runtime dependencies

**Files:**
- Modify: `web/package.json` (deps added via npm)

- [ ] **Step 1: Install TanStack Query, Zod, mode-watcher**

```bash
cd web
npm install @tanstack/svelte-query @tanstack/svelte-query-devtools zod mode-watcher
```

- [ ] **Step 2: Install Keycloak OIDC client and JWT helper**

```bash
npm install openid-client jose
```

`openid-client` handles Authorization Code + PKCE flow server-side. `jose` parses/verifies JWTs.

- [ ] **Step 3: Install JetBrains Mono font**

```bash
npm install @fontsource/jetbrains-mono
```

Inter Variable is already installed (`@fontsource-variable/inter`).

- [ ] **Step 4: Verify package.json**

Run: `cat package.json`
Expected: new deps present in `dependencies` (TanStack Query, Zod, mode-watcher, openid-client, jose, @fontsource/jetbrains-mono).

- [ ] **Step 5: Commit**

```bash
git add web/package.json web/package-lock.json
git commit -m "chore(web): install P0 runtime deps (tanstack-query, zod, openid-client, mode-watcher)"
```

---

### Task 3: Install dev dependencies (testing + tooling)

- [ ] **Step 1: Install Vitest + Testing Library**

```bash
cd web
npm install -D vitest @testing-library/svelte @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 3: Install ESLint + Prettier + Husky**

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-svelte prettier prettier-plugin-svelte husky lint-staged
```

- [ ] **Step 4: Verify dev deps**

Run: `cat package.json | grep -E "vitest|playwright|eslint|prettier|husky"`
Expected: all 4 categories present in `devDependencies`.

- [ ] **Step 5: Commit**

```bash
git add web/package.json web/package-lock.json
git commit -m "chore(web): install P0 dev deps (vitest, playwright, eslint, prettier, husky)"
```

---

### Task 4: Add npm scripts

**Files:**
- Modify: `web/package.json` (scripts section)

- [ ] **Step 1: Replace scripts block in package.json**

In `web/package.json`, replace the existing `"scripts"` block with:

```json
"scripts": {
  "dev": "vite dev",
  "build": "vite build",
  "preview": "vite preview",
  "prepare": "svelte-kit sync && husky",
  "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
  "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "lint": "eslint .",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

- [ ] **Step 2: Verify**

Run: `cd web && npm run check`
Expected: passes (no source code yet to check, but command resolves).

- [ ] **Step 3: Commit**

```bash
git add web/package.json
git commit -m "chore(web): add npm scripts for test, lint, format"
```

---

## Section B — Tooling configuration

### Task 5: Configure Prettier

**Files:**
- Create: `web/.prettierrc`
- Create: `web/.prettierignore`

- [ ] **Step 1: Create `web/.prettierrc`**

```json
{
  "useTabs": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [
    {
      "files": "*.svelte",
      "options": { "parser": "svelte" }
    }
  ]
}
```

- [ ] **Step 2: Create `web/.prettierignore`**

```
.svelte-kit
build
dist
node_modules
package-lock.json
src/lib/components/ui
```

(The `src/lib/components/ui` exclusion preserves shadcn-svelte's vendored formatting.)

- [ ] **Step 3: Verify Prettier runs**

Run: `cd web && npm run format:check`
Expected: exits 0 (no files yet to fail).

- [ ] **Step 4: Commit**

```bash
git add web/.prettierrc web/.prettierignore
git commit -m "chore(web): configure Prettier"
```

---

### Task 6: Configure ESLint

**Files:**
- Create: `web/eslint.config.js`

- [ ] **Step 1: Create `web/eslint.config.js`**

```javascript
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  {
    ignores: [
      'build/',
      '.svelte-kit/',
      'dist/',
      'src/lib/components/ui/'
    ]
  }
);
```

- [ ] **Step 2: Install missing peer deps**

```bash
cd web && npm install -D globals eslint-config-prettier
```

- [ ] **Step 3: Verify ESLint runs**

Run: `cd web && npm run lint`
Expected: exits 0 (no source files to lint yet beyond config).

- [ ] **Step 4: Commit**

```bash
git add web/eslint.config.js web/package.json web/package-lock.json
git commit -m "chore(web): configure ESLint with svelte + prettier integration"
```

---

### Task 7: Configure Husky + lint-staged

**Files:**
- Create: `web/.husky/pre-commit`
- Modify: `web/package.json` (add `lint-staged` config)

- [ ] **Step 1: Initialize husky**

```bash
cd web && npx husky init
```

This creates `.husky/pre-commit` with a default script.

- [ ] **Step 2: Replace `.husky/pre-commit` content**

```bash
#!/usr/bin/env sh
cd web && npx lint-staged
```

Make executable:
```bash
chmod +x web/.husky/pre-commit
```

- [ ] **Step 3: Add lint-staged config to `web/package.json`**

Append after `"scripts": { ... }`:

```json
"lint-staged": {
  "*.{js,ts,svelte}": ["prettier --write", "eslint --fix"],
  "*.{json,md,css}": ["prettier --write"]
}
```

- [ ] **Step 4: Verify pre-commit hook is set up**

Run: `ls -la web/.husky/pre-commit`
Expected: file exists, executable.

- [ ] **Step 5: Commit**

```bash
git add web/.husky web/package.json
git commit -m "chore(web): set up Husky + lint-staged for pre-commit hooks"
```

---

### Task 8: Configure Vitest

**Files:**
- Create: `web/vitest.config.ts`
- Modify: `web/src/app.d.ts` (add types if needed)

- [ ] **Step 1: Create `web/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
```

- [ ] **Step 2: Create `web/src/test-setup.ts`**

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Verify Vitest boots**

Run: `cd web && npm run test`
Expected: "No test files found" — that's fine, just confirms config loads.

- [ ] **Step 4: Commit**

```bash
git add web/vitest.config.ts web/src/test-setup.ts
git commit -m "chore(web): configure Vitest with jsdom + jest-dom matchers"
```

---

### Task 9: Configure Playwright

**Files:**
- Create: `web/playwright.config.ts`
- Create: `web/tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Create `web/playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe'
  }
});
```

- [ ] **Step 2: Create `web/tests/e2e/smoke.spec.ts`**

```typescript
import { expect, test } from '@playwright/test';

test('app boots and redirects unauthenticated to /login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
});
```

This test will fail until login is wired up — that's expected. It's a target.

- [ ] **Step 3: Commit**

```bash
git add web/playwright.config.ts web/tests/e2e/smoke.spec.ts
git commit -m "chore(web): configure Playwright + add smoke test (will fail until auth wired)"
```

---

### Task 10: Fix svelte.config.js alias and add env types

**Files:**
- Modify: `web/svelte.config.js`
- Modify: `web/src/app.d.ts`
- Create: `web/.env.example`

- [ ] **Step 1: Replace `web/svelte.config.js`**

```javascript
import adapter from '@sveltejs/adapter-auto';
import { relative, sep } from 'node:path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    runes: ({ filename }) => {
      const relativePath = relative(import.meta.dirname, filename);
      const pathSegments = relativePath.toLowerCase().split(sep);
      const isExternalLibrary = pathSegments.includes('node_modules');
      return isExternalLibrary ? undefined : true;
    }
  },
  kit: {
    adapter: adapter()
  }
};

export default config;
```

(Removes the bogus `"@/*": "./path/to/lib/*"` alias — we use `$lib` everywhere.)

- [ ] **Step 2: Replace `web/src/app.d.ts`**

```typescript
import type { UserContext } from '$lib/auth/types';

declare global {
  namespace App {
    interface Error {
      code?: string;
    }
    interface Locals {
      user: UserContext | null;
      accessToken: string | null;
    }
    interface PageData {
      user: UserContext | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
```

- [ ] **Step 3: Create `web/.env.example`**

```
# SmartLock backend API base URL
PUBLIC_SMARTLOCK_API_URL=http://localhost:8000

# Keycloak realm
KEYCLOAK_ISSUER=http://localhost:8080/realms/fablab
KEYCLOAK_CLIENT_ID=smartlock-dashboard
KEYCLOAK_CLIENT_SECRET=
KEYCLOAK_REDIRECT_URI=http://localhost:5173/login/callback
KEYCLOAK_POST_LOGOUT_URI=http://localhost:5173

# Session cookie secret (32+ random bytes)
SESSION_SECRET=change-me-to-a-real-secret-32-bytes-minimum
```

- [ ] **Step 4: Verify svelte-check passes**

Run: `cd web && npm run check`
Expected: passes (note: `UserContext` import in app.d.ts will fail. We'll create the type in Task 15. For now, replace the import with `type UserContext = unknown;` placeholder and remove on completion of Task 15.)

Actually use this placeholder for `app.d.ts` until Task 15:

```typescript
type UserContext = unknown; // replaced in Task 15

declare global {
  namespace App {
    interface Error {
      code?: string;
    }
    interface Locals {
      user: UserContext | null;
      accessToken: string | null;
    }
    interface PageData {
      user: UserContext | null;
    }
  }
}

export {};
```

- [ ] **Step 5: Commit**

```bash
git add web/svelte.config.js web/src/app.d.ts web/.env.example
git commit -m "chore(web): fix svelte alias, add Locals/PageData types, .env.example"
```

---

## Section C — Tailwind theme + design tokens

### Task 11: Move app.css to src/ and rewrite design tokens

**Files:**
- Create: `web/src/app.css` (move from `src/routes/layout.css`, rewrite)
- Modify: `web/components.json` (point to new path, switch base to zinc)
- Modify: `web/src/app.html` (link to new CSS)

- [ ] **Step 1: Create `web/src/app.css`**

```css
@import 'tailwindcss';

@import '@fontsource-variable/inter/wght.css';
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/500.css';

@plugin 'tailwindcss-animate';

@custom-variant dark (&:is(.dark *));

@theme {
  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}

:root {
  --radius: 0.5rem;

  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 238 84% 60%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --success: 142 71% 45%;
  --success-foreground: 0 0% 98%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 238 84% 60%;
  --sidebar: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-primary: 238 84% 60%;
  --sidebar-primary-foreground: 0 0% 98%;
  --sidebar-accent: 240 4.8% 95.9%;
  --sidebar-accent-foreground: 240 5.9% 10%;
  --sidebar-border: 240 5.9% 90%;
  --sidebar-ring: 238 84% 60%;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 5% 7%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 234 89% 74%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 50%;
  --destructive-foreground: 0 0% 98%;
  --success: 142 65% 50%;
  --success-foreground: 0 0% 98%;
  --warning: 38 92% 55%;
  --warning-foreground: 240 5.9% 10%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 234 89% 74%;
  --sidebar: 240 5% 7%;
  --sidebar-foreground: 0 0% 98%;
  --sidebar-primary: 234 89% 74%;
  --sidebar-primary-foreground: 240 5.9% 10%;
  --sidebar-accent: 240 3.7% 15.9%;
  --sidebar-accent-foreground: 0 0% 98%;
  --sidebar-border: 240 3.7% 15.9%;
  --sidebar-ring: 234 89% 74%;
}

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-success: hsl(var(--success));
  --color-success-foreground: hsl(var(--success-foreground));
  --color-warning: hsl(var(--warning));
  --color-warning-foreground: hsl(var(--warning-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-sidebar: hsl(var(--sidebar));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-ring: hsl(var(--sidebar-ring));

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: var(--font-sans);
  font-feature-settings: 'rlig' 1, 'calt' 1;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 2: Delete old `src/routes/layout.css` if not already deleted**

```bash
rm -f web/src/routes/layout.css
```

- [ ] **Step 3: Update `web/components.json` baseColor and css path**

Replace contents with:

```json
{
  "$schema": "https://shadcn-svelte.com/schema.json",
  "tailwind": {
    "css": "src/app.css",
    "baseColor": "zinc"
  },
  "aliases": {
    "components": "$lib/components",
    "utils": "$lib/utils",
    "ui": "$lib/components/ui",
    "hooks": "$lib/hooks",
    "lib": "$lib"
  },
  "typescript": true,
  "registry": "https://shadcn-svelte.com/registry",
  "style": "vega",
  "iconLibrary": "lucide",
  "menuColor": "default",
  "menuAccent": "subtle"
}
```

- [ ] **Step 4: Replace `web/src/app.html`**

```html
<!doctype html>
<html lang="fr" %sveltekit.theme%>
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>SmartLock Dashboard</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

- [ ] **Step 5: Verify dev server boots**

```bash
cd web && npm run dev &
sleep 5 && curl -sI http://localhost:5173/ | head -2
pkill -f "vite dev" || true
```

Expected: HTTP 200 (or 404 for the root since no route yet, but the dev server itself runs).

- [ ] **Step 6: Commit**

```bash
git add web/src/app.css web/components.json web/src/app.html
git commit -m "feat(web): set up Tailwind v4 design tokens (zinc + indigo, light+dark)"
```

---

### Task 12: Install P0 shadcn-svelte components

**Files:**
- Adds: `web/src/lib/components/ui/{sidebar,sheet,breadcrumb,separator,sonner,skeleton,dropdown-menu,tooltip,scroll-area}/`

- [ ] **Step 1: Install P0 components via shadcn-svelte CLI**

```bash
cd web
npx shadcn-svelte@latest add sidebar sheet breadcrumb separator sonner skeleton dropdown-menu tooltip scroll-area
```

When prompted, accept all defaults. `scroll-area` is needed for sidebar overflow.

- [ ] **Step 2: Verify installed components**

Run: `ls web/src/lib/components/ui/`
Expected: directories for `avatar`, `badge`, `breadcrumb`, `button`, `card`, `dropdown-menu`, `scroll-area`, `separator`, `sheet`, `sidebar`, `skeleton`, `sonner`, `table`, `tabs`, `tooltip`.

- [ ] **Step 3: Verify check still passes**

```bash
cd web && npm run check
```

Expected: passes (or warnings only about unused vars).

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/components/ui web/package.json web/package-lock.json
git commit -m "feat(web): install P0 shadcn-svelte components (sidebar, sheet, breadcrumb, …)"
```

---

## Section D — Permission helpers (TDD)

### Task 13: Create auth types

**Files:**
- Create: `web/src/lib/auth/types.ts`

- [ ] **Step 1: Create `web/src/lib/auth/types.ts`**

```typescript
/**
 * Tiers from the CDC ACM model. T0 is highest authority, T5 lowest.
 * Lower numeric value = higher tier.
 */
export type Tier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

/**
 * Permission levels on an armoire, ordered.
 */
export type PermissionLevel = 'none' | 'view' | 'open' | 'edit';

/**
 * A role held by a user.
 */
export interface Role {
  name: string;
  tier: Tier;
  manager: boolean;
  role_admin: boolean;
  audit_viewer: boolean;
  system: boolean;
}

/**
 * Per-armoire permission for the current user.
 * Computed by the API based on the user's roles ∪ direct overrides.
 */
export interface ArmoirePermission {
  armoire_id: number;
  level: PermissionLevel;
}

/**
 * The authenticated user as exposed to client code.
 * Mirrors the JWT claims + computed effective permissions.
 */
export interface UserContext {
  id: string;
  username: string;
  displayName: string;
  email: string;
  enabled: boolean;
  roles: Role[];
  armoirePermissions: ArmoirePermission[];
}

/**
 * Actions that can be permission-checked via can().
 */
export type Action =
  | { type: 'view_armoire'; armoireId: number }
  | { type: 'open_armoire'; armoireId: number }
  | { type: 'edit_armoire'; armoireId: number }
  | { type: 'view_users' }
  | { type: 'manage_users' }
  | { type: 'view_roles' }
  | { type: 'manage_roles' }
  | { type: 'view_logs' }
  | { type: 'export_logs' };
```

- [ ] **Step 2: Update `web/src/app.d.ts` to import the real type**

Replace the placeholder line `type UserContext = unknown;` with:
```typescript
import type { UserContext } from '$lib/auth/types';
```

(Move this to the top of the file, before `declare global`.)

- [ ] **Step 3: Verify `npm run check` passes**

```bash
cd web && npm run check
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/auth/types.ts web/src/app.d.ts
git commit -m "feat(web/auth): define UserContext, Role, Tier, PermissionLevel, Action types"
```

---

### Task 14: TDD tier comparison helpers

**Files:**
- Create: `web/src/lib/auth/tiers.test.ts`
- Create: `web/src/lib/auth/tiers.ts`

- [ ] **Step 1: Write `web/src/lib/auth/tiers.test.ts`**

```typescript
import { describe, expect, it } from 'vitest';
import { compareTiers, isHigherTier, isStrictlyHigherTier, tierRank } from './tiers';

describe('tierRank', () => {
  it('T0 is rank 0 (highest)', () => {
    expect(tierRank('T0')).toBe(0);
  });
  it('T5 is rank 5 (lowest)', () => {
    expect(tierRank('T5')).toBe(5);
  });
});

describe('compareTiers', () => {
  it('returns negative when a is higher than b (lower rank number)', () => {
    expect(compareTiers('T1', 'T3')).toBeLessThan(0);
  });
  it('returns positive when a is lower than b', () => {
    expect(compareTiers('T4', 'T1')).toBeGreaterThan(0);
  });
  it('returns 0 when equal', () => {
    expect(compareTiers('T2', 'T2')).toBe(0);
  });
});

describe('isHigherTier (>=)', () => {
  it('T1 is higher-or-equal than T3', () => {
    expect(isHigherTier('T1', 'T3')).toBe(true);
  });
  it('T2 is higher-or-equal than T2 (equal counts)', () => {
    expect(isHigherTier('T2', 'T2')).toBe(true);
  });
  it('T4 is not higher-or-equal than T1', () => {
    expect(isHigherTier('T4', 'T1')).toBe(false);
  });
});

describe('isStrictlyHigherTier (>)', () => {
  it('T1 is strictly higher than T3', () => {
    expect(isStrictlyHigherTier('T1', 'T3')).toBe(true);
  });
  it('T2 is NOT strictly higher than T2', () => {
    expect(isStrictlyHigherTier('T2', 'T2')).toBe(false);
  });
  it('T4 is not strictly higher than T1', () => {
    expect(isStrictlyHigherTier('T4', 'T1')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests and verify they all fail**

```bash
cd web && npm run test -- tiers.test.ts
```

Expected: FAIL — module not found (`./tiers`).

- [ ] **Step 3: Implement `web/src/lib/auth/tiers.ts`**

```typescript
import type { Tier } from './types';

const RANK: Record<Tier, number> = {
  T0: 0,
  T1: 1,
  T2: 2,
  T3: 3,
  T4: 4,
  T5: 5,
};

export function tierRank(tier: Tier): number {
  return RANK[tier];
}

export function compareTiers(a: Tier, b: Tier): number {
  return tierRank(a) - tierRank(b);
}

export function isHigherTier(a: Tier, b: Tier): boolean {
  return compareTiers(a, b) <= 0;
}

export function isStrictlyHigherTier(a: Tier, b: Tier): boolean {
  return compareTiers(a, b) < 0;
}
```

- [ ] **Step 4: Run the tests and verify they pass**

```bash
cd web && npm run test -- tiers.test.ts
```

Expected: 12 tests passing.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/auth/tiers.ts web/src/lib/auth/tiers.test.ts
git commit -m "feat(web/auth): TDD tier comparison helpers"
```

---

### Task 15: TDD permission helpers (can, requireTier, requireFlag)

**Files:**
- Create: `web/src/lib/auth/permissions.test.ts`
- Create: `web/src/lib/auth/permissions.ts`

- [ ] **Step 1: Write `web/src/lib/auth/permissions.test.ts`**

```typescript
import { describe, expect, it } from 'vitest';
import type { ArmoirePermission, Role, UserContext } from './types';
import {
  can,
  hasFlag,
  highestTier,
  permissionAtLeast,
  requireFlag,
  requireTier,
} from './permissions';

function role(opts: Partial<Role> & { tier: Role['tier']; name: string }): Role {
  return {
    manager: false,
    role_admin: false,
    audit_viewer: false,
    system: false,
    ...opts,
  };
}

function user(opts: Partial<UserContext> & { roles: Role[] }): UserContext {
  return {
    id: 'u1',
    username: 'alice',
    displayName: 'Alice',
    email: 'a@x',
    enabled: true,
    armoirePermissions: [],
    ...opts,
  };
}

describe('highestTier', () => {
  it('returns the highest-rank tier among roles', () => {
    const u = user({
      roles: [role({ name: 'a', tier: 'T3' }), role({ name: 'b', tier: 'T1' })],
    });
    expect(highestTier(u)).toBe('T1');
  });
  it('returns T5 fallback when no roles', () => {
    expect(highestTier(user({ roles: [] }))).toBe('T5');
  });
});

describe('hasFlag', () => {
  it('true when at least one role has the flag', () => {
    const u = user({
      roles: [
        role({ name: 'a', tier: 'T2', manager: false }),
        role({ name: 'b', tier: 'T1', manager: true }),
      ],
    });
    expect(hasFlag(u, 'manager')).toBe(true);
  });
  it('false when no role has the flag', () => {
    const u = user({
      roles: [role({ name: 'a', tier: 'T1' })],
    });
    expect(hasFlag(u, 'role_admin')).toBe(false);
  });
});

describe('requireTier', () => {
  it('passes when user has a role at or above tier', () => {
    const u = user({ roles: [role({ name: 'a', tier: 'T1' })] });
    expect(requireTier(u, 'T2')).toBe(true);
  });
  it('fails when user is strictly below', () => {
    const u = user({ roles: [role({ name: 'a', tier: 'T3' })] });
    expect(requireTier(u, 'T2')).toBe(false);
  });
});

describe('requireFlag', () => {
  it('alias for hasFlag', () => {
    const u = user({ roles: [role({ name: 'a', tier: 'T1', manager: true })] });
    expect(requireFlag(u, 'manager')).toBe(true);
    expect(requireFlag(u, 'role_admin')).toBe(false);
  });
});

describe('permissionAtLeast', () => {
  it('view ≤ open ≤ edit ordering', () => {
    expect(permissionAtLeast('view', 'view')).toBe(true);
    expect(permissionAtLeast('open', 'view')).toBe(true);
    expect(permissionAtLeast('edit', 'open')).toBe(true);
    expect(permissionAtLeast('view', 'open')).toBe(false);
    expect(permissionAtLeast('none', 'view')).toBe(false);
  });
});

describe('can — armoire actions', () => {
  const u = user({
    roles: [role({ name: 'a', tier: 'T3' })],
    armoirePermissions: [
      { armoire_id: 1, level: 'open' },
      { armoire_id: 2, level: 'view' },
    ],
  });

  it('view_armoire passes when level ≥ view', () => {
    expect(can(u, { type: 'view_armoire', armoireId: 1 })).toBe(true);
    expect(can(u, { type: 'view_armoire', armoireId: 2 })).toBe(true);
  });
  it('view_armoire fails when no permission entry', () => {
    expect(can(u, { type: 'view_armoire', armoireId: 99 })).toBe(false);
  });
  it('open_armoire requires level ≥ open', () => {
    expect(can(u, { type: 'open_armoire', armoireId: 1 })).toBe(true);
    expect(can(u, { type: 'open_armoire', armoireId: 2 })).toBe(false);
  });
  it('edit_armoire requires level = edit', () => {
    expect(can(u, { type: 'edit_armoire', armoireId: 1 })).toBe(false);
  });
});

describe('can — governance actions', () => {
  it('manage_users requires manager flag', () => {
    const u = user({ roles: [role({ name: 'a', tier: 'T1', manager: true })] });
    expect(can(u, { type: 'manage_users' })).toBe(true);
    expect(can(user({ roles: [role({ name: 'a', tier: 'T1' })] }), { type: 'manage_users' })).toBe(
      false,
    );
  });
  it('manage_roles requires role_admin flag', () => {
    const u = user({ roles: [role({ name: 'a', tier: 'T1', role_admin: true })] });
    expect(can(u, { type: 'manage_roles' })).toBe(true);
    expect(can(user({ roles: [role({ name: 'a', tier: 'T1' })] }), { type: 'manage_roles' })).toBe(
      false,
    );
  });
  it('view_logs requires audit_viewer flag OR tier ≥ T0', () => {
    expect(can(user({ roles: [role({ name: 'a', tier: 'T0' })] }), { type: 'view_logs' })).toBe(
      true,
    );
    expect(
      can(user({ roles: [role({ name: 'a', tier: 'T2', audit_viewer: true })] }), {
        type: 'view_logs',
      }),
    ).toBe(true);
    expect(can(user({ roles: [role({ name: 'a', tier: 'T2' })] }), { type: 'view_logs' })).toBe(
      false,
    );
  });
  it('view_users requires manage_users OR view_roles capability', () => {
    expect(
      can(user({ roles: [role({ name: 'a', tier: 'T1', manager: true })] }), { type: 'view_users' }),
    ).toBe(true);
    expect(
      can(user({ roles: [role({ name: 'a', tier: 'T1', role_admin: true })] }), {
        type: 'view_users',
      }),
    ).toBe(true);
  });
  it('null user always denied', () => {
    expect(can(null, { type: 'view_users' })).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests, verify all fail**

```bash
cd web && npm run test -- permissions.test.ts
```

Expected: FAIL — `./permissions` module not found.

- [ ] **Step 3: Implement `web/src/lib/auth/permissions.ts`**

```typescript
import { isHigherTier } from './tiers';
import type { Action, PermissionLevel, Role, Tier, UserContext } from './types';

const LEVEL_RANK: Record<PermissionLevel, number> = {
  none: 0,
  view: 1,
  open: 2,
  edit: 3,
};

export function permissionAtLeast(actual: PermissionLevel, required: PermissionLevel): boolean {
  return LEVEL_RANK[actual] >= LEVEL_RANK[required];
}

export function highestTier(user: UserContext): Tier {
  if (user.roles.length === 0) return 'T5';
  return user.roles.reduce<Tier>((acc, r) => (isHigherTier(r.tier, acc) ? r.tier : acc), 'T5');
}

export function hasFlag(user: UserContext, flag: 'manager' | 'role_admin' | 'audit_viewer'): boolean {
  return user.roles.some((r) => r[flag]);
}

export function requireFlag(
  user: UserContext,
  flag: 'manager' | 'role_admin' | 'audit_viewer',
): boolean {
  return hasFlag(user, flag);
}

export function requireTier(user: UserContext, minimum: Tier): boolean {
  return isHigherTier(highestTier(user), minimum);
}

function armoireLevel(user: UserContext, armoireId: number): PermissionLevel {
  return user.armoirePermissions.find((p) => p.armoire_id === armoireId)?.level ?? 'none';
}

export function can(user: UserContext | null, action: Action): boolean {
  if (!user) return false;

  switch (action.type) {
    case 'view_armoire':
      return permissionAtLeast(armoireLevel(user, action.armoireId), 'view');
    case 'open_armoire':
      return permissionAtLeast(armoireLevel(user, action.armoireId), 'open');
    case 'edit_armoire':
      return permissionAtLeast(armoireLevel(user, action.armoireId), 'edit');
    case 'view_users':
      return hasFlag(user, 'manager') || hasFlag(user, 'role_admin');
    case 'manage_users':
      return hasFlag(user, 'manager');
    case 'view_roles':
      return hasFlag(user, 'role_admin') || hasFlag(user, 'manager');
    case 'manage_roles':
      return hasFlag(user, 'role_admin');
    case 'view_logs':
      return requireTier(user, 'T0') || hasFlag(user, 'audit_viewer');
    case 'export_logs':
      return requireTier(user, 'T0') || hasFlag(user, 'audit_viewer');
  }
}
```

- [ ] **Step 4: Run tests, verify all pass**

```bash
cd web && npm run test -- permissions.test.ts
```

Expected: ~24 tests passing.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/auth/permissions.ts web/src/lib/auth/permissions.test.ts
git commit -m "feat(web/auth): TDD permission helpers (can, requireTier, requireFlag, …)"
```

---

## Section E — Zod schemas

### Task 16: Create user schema with tests

**Files:**
- Create: `web/src/lib/schemas/user.test.ts`
- Create: `web/src/lib/schemas/user.ts`

- [ ] **Step 1: Write `web/src/lib/schemas/user.test.ts`**

```typescript
import { describe, expect, it } from 'vitest';
import { userSchema, userListResponseSchema } from './user';

describe('userSchema', () => {
  const valid = {
    id: '8e7f3...',
    username: 'alice',
    email: 'a@x',
    firstName: 'Alice',
    lastName: 'D',
    enabled: true,
    attributes: { card_id: ['AA:BB'] },
  };

  it('parses a valid user', () => {
    expect(() => userSchema.parse(valid)).not.toThrow();
  });

  it('rejects missing id', () => {
    const { id, ...rest } = valid;
    expect(() => userSchema.parse(rest)).toThrow();
  });

  it('allows missing attributes', () => {
    const { attributes, ...rest } = valid;
    expect(() => userSchema.parse(rest)).not.toThrow();
  });

  it('attributes.card_id may be empty array', () => {
    expect(() => userSchema.parse({ ...valid, attributes: { card_id: [] } })).not.toThrow();
  });
});

describe('userListResponseSchema', () => {
  it('parses an array of users', () => {
    const valid = {
      id: '1',
      username: 'a',
      email: 'a@x',
      enabled: true,
    };
    expect(() => userListResponseSchema.parse([valid, valid])).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests, verify fail**

```bash
cd web && npm run test -- schemas/user.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `web/src/lib/schemas/user.ts`**

```typescript
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  enabled: z.boolean(),
  attributes: z
    .object({
      card_id: z.array(z.string()),
    })
    .partial()
    .optional(),
});

export const userListResponseSchema = z.array(userSchema);

export type UserDTO = z.infer<typeof userSchema>;
```

- [ ] **Step 4: Run tests, verify pass**

```bash
cd web && npm run test -- schemas/user.test.ts
```

Expected: 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/schemas/user.ts web/src/lib/schemas/user.test.ts
git commit -m "feat(web/schemas): user schema with Zod"
```

---

### Task 17: Create role, armoire, item, stock, permission schemas

**Files:**
- Create: `web/src/lib/schemas/role.ts`
- Create: `web/src/lib/schemas/armoire.ts`
- Create: `web/src/lib/schemas/item.ts`
- Create: `web/src/lib/schemas/stock.ts`
- Create: `web/src/lib/schemas/permission.ts`

- [ ] **Step 1: Create `web/src/lib/schemas/role.ts`**

```typescript
import { z } from 'zod';

export const tierSchema = z.enum(['T0', 'T1', 'T2', 'T3', 'T4', 'T5']);

export const roleSchema = z.object({
  name: z.string(),
  tier: tierSchema,
  manager: z.boolean(),
  role_admin: z.boolean(),
  audit_viewer: z.boolean(),
  system: z.boolean(),
});

export const roleListResponseSchema = z.array(roleSchema);

export type RoleDTO = z.infer<typeof roleSchema>;
```

- [ ] **Step 2: Create `web/src/lib/schemas/armoire.ts`**

```typescript
import { z } from 'zod';

export const armoireSchema = z.object({
  id: z.number().int().positive(),
  locker_type: z.string(),
  location: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const armoireListResponseSchema = z.array(armoireSchema);

export type ArmoireDTO = z.infer<typeof armoireSchema>;
```

- [ ] **Step 3: Create `web/src/lib/schemas/item.ts`**

```typescript
import { z } from 'zod';

export const categorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const itemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  reference: z.string(),
  description: z.string().nullable().optional(),
  category_id: z.number().int().positive(),
  photo_url: z.string().nullable().optional(),
  low_stock_threshold: z.number().int().nonnegative().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const itemListResponseSchema = z.array(itemSchema);

export type ItemDTO = z.infer<typeof itemSchema>;
export type CategoryDTO = z.infer<typeof categorySchema>;
```

- [ ] **Step 4: Create `web/src/lib/schemas/stock.ts`**

```typescript
import { z } from 'zod';

export const stockEntrySchema = z.object({
  id: z.number().int().positive(),
  item_id: z.number().int().positive(),
  locker_id: z.number().int().positive(),
  quantity: z.number().int().nonnegative(),
  unit_measure: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const stockListResponseSchema = z.array(stockEntrySchema);

export type StockEntryDTO = z.infer<typeof stockEntrySchema>;
```

- [ ] **Step 5: Create `web/src/lib/schemas/permission.ts`**

```typescript
import { z } from 'zod';

export const permissionLevelSchema = z.enum(['none', 'view', 'open', 'edit']);

export const lockerPermissionSchema = z.object({
  id: z.number().int().positive(),
  locker_id: z.number().int().positive(),
  subject_type: z.enum(['role', 'user']),
  role_name: z.string().nullable().optional(),
  user_id: z.string().nullable().optional(),
  can_view: z.boolean(),
  can_open: z.boolean(),
  can_edit: z.boolean(),
  valid_until: z.string().nullable().optional(),
  created_at: z.string(),
});

export const lockerPermissionListResponseSchema = z.array(lockerPermissionSchema);

export type LockerPermissionDTO = z.infer<typeof lockerPermissionSchema>;
export type PermissionLevelDTO = z.infer<typeof permissionLevelSchema>;
```

- [ ] **Step 6: Verify all schemas import-compile**

```bash
cd web && npm run check
```

Expected: passes.

- [ ] **Step 7: Commit**

```bash
git add web/src/lib/schemas/
git commit -m "feat(web/schemas): role, armoire, item, stock, permission Zod schemas"
```

---

## Section F — API client

### Task 18: TDD API client core (fetch wrapper + Zod validation)

**Files:**
- Create: `web/src/lib/api/client.test.ts`
- Create: `web/src/lib/api/client.ts`
- Create: `web/src/lib/config.ts`

- [ ] **Step 1: Create `web/src/lib/config.ts`**

```typescript
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export const config = {
  apiUrl: publicEnv.PUBLIC_SMARTLOCK_API_URL ?? 'http://localhost:8000',
  keycloak: {
    issuer: env.KEYCLOAK_ISSUER ?? '',
    clientId: env.KEYCLOAK_CLIENT_ID ?? '',
    clientSecret: env.KEYCLOAK_CLIENT_SECRET ?? '',
    redirectUri: env.KEYCLOAK_REDIRECT_URI ?? '',
    postLogoutUri: env.KEYCLOAK_POST_LOGOUT_URI ?? '',
  },
  sessionSecret: env.SESSION_SECRET ?? '',
};
```

- [ ] **Step 2: Write `web/src/lib/api/client.test.ts`**

```typescript
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiError, createApiClient } from './client';

const schema = z.object({ id: z.number() });

function mockFetch(response: { status: number; body?: unknown }) {
  return vi.fn().mockResolvedValue(
    new Response(response.body ? JSON.stringify(response.body) : null, {
      status: response.status,
      headers: { 'content-type': 'application/json' },
    }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createApiClient', () => {
  it('GET parses JSON via Zod schema', async () => {
    const fetchFn = mockFetch({ status: 200, body: { id: 42 } });
    const api = createApiClient({ baseUrl: 'http://x', fetchFn });
    const result = await api.get('/things/42', schema);
    expect(result).toEqual({ id: 42 });
  });

  it('GET throws ApiError on 4xx', async () => {
    const fetchFn = mockFetch({ status: 404, body: { detail: 'not found' } });
    const api = createApiClient({ baseUrl: 'http://x', fetchFn });
    await expect(api.get('/things/99', schema)).rejects.toBeInstanceOf(ApiError);
  });

  it('GET throws ApiError on schema mismatch', async () => {
    const fetchFn = mockFetch({ status: 200, body: { id: 'not-a-number' } });
    const api = createApiClient({ baseUrl: 'http://x', fetchFn });
    await expect(api.get('/things/1', schema)).rejects.toBeInstanceOf(ApiError);
  });

  it('attaches Authorization header when token provided', async () => {
    const fetchFn = mockFetch({ status: 200, body: { id: 1 } });
    const api = createApiClient({ baseUrl: 'http://x', fetchFn, getToken: () => 'tok-123' });
    await api.get('/x', schema);
    const headers = (fetchFn.mock.calls[0][1] as RequestInit).headers as Headers;
    expect(headers.get('authorization')).toBe('Bearer tok-123');
  });

  it('POST sends JSON body', async () => {
    const fetchFn = mockFetch({ status: 201, body: { id: 5 } });
    const api = createApiClient({ baseUrl: 'http://x', fetchFn });
    await api.post('/x', { name: 'a' }, schema);
    expect(fetchFn.mock.calls[0][1]).toMatchObject({ method: 'POST' });
    const body = (fetchFn.mock.calls[0][1] as RequestInit).body as string;
    expect(JSON.parse(body)).toEqual({ name: 'a' });
  });

  it('ApiError exposes status and detail', () => {
    const e = new ApiError(403, 'forbidden', 'no_permission');
    expect(e.status).toBe(403);
    expect(e.detail).toBe('forbidden');
    expect(e.code).toBe('no_permission');
  });
});
```

- [ ] **Step 3: Run tests, verify fail**

```bash
cd web && npm run test -- api/client.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement `web/src/lib/api/client.ts`**

```typescript
import type { ZodSchema } from 'zod';

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public code?: string,
  ) {
    super(`API ${status}: ${detail}`);
    this.name = 'ApiError';
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  fetchFn?: typeof fetch;
  getToken?: () => string | null | undefined;
}

export interface ApiClient {
  get<T>(path: string, schema: ZodSchema<T>): Promise<T>;
  post<T>(path: string, body: unknown, schema: ZodSchema<T>): Promise<T>;
  put<T>(path: string, body: unknown, schema: ZodSchema<T>): Promise<T>;
  patch<T>(path: string, body: unknown, schema: ZodSchema<T>): Promise<T>;
  delete(path: string): Promise<void>;
}

export function createApiClient(opts: ApiClientOptions): ApiClient {
  const fetchFn = opts.fetchFn ?? fetch;

  async function request<T>(
    method: string,
    path: string,
    body: unknown,
    schema: ZodSchema<T> | null,
  ): Promise<T | void> {
    const headers = new Headers({ 'content-type': 'application/json' });
    const token = opts.getToken?.();
    if (token) headers.set('authorization', `Bearer ${token}`);

    const res = await fetchFn(`${opts.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let detail = res.statusText;
      let code: string | undefined;
      try {
        const errBody = await res.json();
        detail = errBody.detail ?? detail;
        code = errBody.code;
      } catch {
        /* not json */
      }
      throw new ApiError(res.status, detail, code);
    }

    if (res.status === 204 || !schema) return undefined as unknown as T;

    const json = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(200, `Schema validation failed: ${parsed.error.message}`, 'schema_mismatch');
    }
    return parsed.data;
  }

  return {
    get: (path, schema) => request('GET', path, undefined, schema) as Promise<unknown>,
    post: (path, body, schema) => request('POST', path, body, schema) as Promise<unknown>,
    put: (path, body, schema) => request('PUT', path, body, schema) as Promise<unknown>,
    patch: (path, body, schema) => request('PATCH', path, body, schema) as Promise<unknown>,
    delete: (path) => request('DELETE', path, undefined, null) as Promise<void>,
  } as ApiClient;
}
```

- [ ] **Step 5: Run tests, verify pass**

```bash
cd web && npm run test -- api/client.test.ts
```

Expected: 6 tests passing.

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/api/client.ts web/src/lib/api/client.test.ts web/src/lib/config.ts
git commit -m "feat(web/api): TDD API client with Zod validation + ApiError"
```

---

### Task 19: Create per-resource API modules

**Files:**
- Create: `web/src/lib/api/users.ts`
- Create: `web/src/lib/api/roles.ts`
- Create: `web/src/lib/api/armoires.ts`
- Create: `web/src/lib/api/items.ts`
- Create: `web/src/lib/api/stocks.ts`
- Create: `web/src/lib/api/logs.ts`

Each module exports typed functions that use an `ApiClient` instance and the corresponding Zod schemas.

- [ ] **Step 1: Create `web/src/lib/api/users.ts`**

```typescript
import { userSchema, userListResponseSchema } from '$lib/schemas/user';
import type { ApiClient } from './client';

export const usersApi = (client: ApiClient) => ({
  list: () => client.get('/users', userListResponseSchema),
  get: (id: string) => client.get(`/users/${id}`, userSchema),
});
```

- [ ] **Step 2: Create `web/src/lib/api/roles.ts`**

```typescript
import { roleSchema, roleListResponseSchema } from '$lib/schemas/role';
import type { ApiClient } from './client';

export const rolesApi = (client: ApiClient) => ({
  listRealmRoles: () => client.get('/groups', roleListResponseSchema),
  assignRole: (userId: string, roleName: string) =>
    client.post(`/users/${userId}/roles/${roleName}`, {}, roleSchema),
  revokeRole: (userId: string, roleName: string) =>
    client.delete(`/users/${userId}/roles/${roleName}`),
});
```

- [ ] **Step 3: Create `web/src/lib/api/armoires.ts`**

```typescript
import { armoireSchema, armoireListResponseSchema } from '$lib/schemas/armoire';
import {
  lockerPermissionListResponseSchema,
  lockerPermissionSchema,
} from '$lib/schemas/permission';
import type { ApiClient } from './client';

export const armoiresApi = (client: ApiClient) => ({
  list: () => client.get('/lockers/', armoireListResponseSchema),
  get: (id: number) => client.get(`/lockers/${id}`, armoireSchema),
  listPermissions: (lockerId: number) =>
    client.get(`/lockers/${lockerId}/permissions`, lockerPermissionListResponseSchema),
  upsertPermission: (lockerId: number, body: Record<string, unknown>) =>
    client.post(`/lockers/${lockerId}/permissions`, body, lockerPermissionSchema),
});
```

- [ ] **Step 4: Create `web/src/lib/api/items.ts`**

```typescript
import { itemSchema, itemListResponseSchema, categorySchema } from '$lib/schemas/item';
import { z } from 'zod';
import type { ApiClient } from './client';

const categoryListSchema = z.array(categorySchema);

export const itemsApi = (client: ApiClient) => ({
  list: (params: { skip?: number; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.skip !== undefined) qs.set('skip', String(params.skip));
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return client.get(`/items/${suffix}`, itemListResponseSchema);
  },
  get: (id: number) => client.get(`/items/${id}`, itemSchema),
  listCategories: () => client.get('/categories/', categoryListSchema),
});
```

- [ ] **Step 5: Create `web/src/lib/api/stocks.ts`**

```typescript
import { stockEntrySchema, stockListResponseSchema } from '$lib/schemas/stock';
import type { ApiClient } from './client';

export const stocksApi = (client: ApiClient) => ({
  list: () => client.get('/stock/', stockListResponseSchema),
  get: (id: number) => client.get(`/stock/${id}`, stockEntrySchema),
  byLocker: (lockerId: number) =>
    client.get(`/lockers/${lockerId}/stock`, stockListResponseSchema),
});
```

- [ ] **Step 6: Create `web/src/lib/api/logs.ts`**

```typescript
import { z } from 'zod';
import type { ApiClient } from './client';

export const accessLogSchema = z.object({
  id: z.number().int(),
  locker_id: z.number().int().nullable(),
  card_id: z.string().nullable(),
  user_id: z.string().nullable(),
  username: z.string().nullable(),
  result: z.enum(['allowed', 'denied']),
  reason: z.string().nullable(),
  can_open: z.boolean().nullable(),
  can_view: z.boolean().nullable(),
  timestamp: z.string(),
});
const accessLogListSchema = z.array(accessLogSchema);

export const logsApi = (client: ApiClient) => ({
  list: (params: { skip?: number; limit?: number; locker_id?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.skip !== undefined) qs.set('skip', String(params.skip));
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    if (params.locker_id !== undefined) qs.set('locker_id', String(params.locker_id));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return client.get(`/logs/${suffix}`, accessLogListSchema);
  },
});
```

- [ ] **Step 7: Verify all import-compile**

```bash
cd web && npm run check
```

Expected: passes.

- [ ] **Step 8: Commit**

```bash
git add web/src/lib/api/
git commit -m "feat(web/api): per-resource API modules (users, roles, armoires, items, stocks, logs)"
```

---

## Section G — Keycloak OIDC auth

### Task 20: Implement OIDC session helpers

**Files:**
- Create: `web/src/lib/auth/keycloak.ts`
- Create: `web/src/lib/auth/session.ts`

- [ ] **Step 1: Create `web/src/lib/auth/keycloak.ts`**

```typescript
import * as oidc from 'openid-client';
import { config } from '$lib/config';

let cachedConfig: oidc.Configuration | null = null;

export async function getKeycloakConfig(): Promise<oidc.Configuration> {
  if (cachedConfig) return cachedConfig;
  cachedConfig = await oidc.discovery(
    new URL(config.keycloak.issuer),
    config.keycloak.clientId,
    config.keycloak.clientSecret,
  );
  return cachedConfig;
}

export async function buildAuthorizationUrl(state: string, codeVerifier: string): Promise<URL> {
  const kc = await getKeycloakConfig();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
  return oidc.buildAuthorizationUrl(kc, {
    redirect_uri: config.keycloak.redirectUri,
    scope: 'openid profile email',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
}

export async function exchangeCodeForTokens(
  currentUrl: URL,
  state: string,
  codeVerifier: string,
): Promise<oidc.TokenEndpointResponse> {
  const kc = await getKeycloakConfig();
  return oidc.authorizationCodeGrant(kc, currentUrl, {
    expectedState: state,
    pkceCodeVerifier: codeVerifier,
  });
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<oidc.TokenEndpointResponse> {
  const kc = await getKeycloakConfig();
  return oidc.refreshTokenGrant(kc, refreshToken);
}

export async function buildLogoutUrl(idTokenHint: string): Promise<URL> {
  const kc = await getKeycloakConfig();
  return oidc.buildEndSessionUrl(kc, {
    id_token_hint: idTokenHint,
    post_logout_redirect_uri: config.keycloak.postLogoutUri,
  });
}
```

- [ ] **Step 2: Create `web/src/lib/auth/session.ts`**

```typescript
import type { Cookies } from '@sveltejs/kit';
import { decodeJwt } from 'jose';
import type { Tier, UserContext } from './types';

const SESSION_COOKIE = 'smartlock_session';
const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export interface Session {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number; // epoch seconds
  oauthState?: string;
  codeVerifier?: string;
}

export function readSession(cookies: Cookies): Session | null {
  const raw = cookies.get(SESSION_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function writeSession(cookies: Cookies, session: Session): void {
  cookies.set(SESSION_COOKIE, JSON.stringify(session), COOKIE_OPTIONS);
}

export function clearSession(cookies: Cookies): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function isExpired(session: Session, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
  return session.expiresAt <= nowSeconds + 30; // 30s leeway
}

/**
 * Decodes the access token into a UserContext. Does NOT verify signature —
 * that's done by the API server. This is for UI display only.
 */
export function userContextFromToken(accessToken: string): UserContext {
  const claims = decodeJwt(accessToken) as Record<string, unknown>;
  const realmRoles = ((claims.realm_access as { roles?: string[] })?.roles ?? []) as string[];

  // The API enriches the JWT with our domain attributes (tier per role, flags).
  // If absent (raw Keycloak token), we fall back to defaults.
  const rolesMeta = (claims.smartlock_roles as Array<{
    name: string;
    tier: Tier;
    manager: boolean;
    role_admin: boolean;
    audit_viewer: boolean;
    system: boolean;
  }>) ?? [];

  const roles = rolesMeta.length
    ? rolesMeta
    : realmRoles.map((name) => ({
        name,
        tier: 'T5' as Tier,
        manager: false,
        role_admin: false,
        audit_viewer: false,
        system: false,
      }));

  return {
    id: (claims.sub as string) ?? '',
    username: (claims.preferred_username as string) ?? '',
    displayName:
      (claims.name as string) ??
      `${(claims.given_name as string) ?? ''} ${(claims.family_name as string) ?? ''}`.trim(),
    email: (claims.email as string) ?? '',
    enabled: true,
    roles,
    armoirePermissions:
      (claims.smartlock_armoire_permissions as UserContext['armoirePermissions']) ?? [],
  };
}
```

- [ ] **Step 3: Verify compile**

```bash
cd web && npm run check
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/auth/keycloak.ts web/src/lib/auth/session.ts
git commit -m "feat(web/auth): Keycloak OIDC client + session cookie helpers"
```

---

### Task 21: Implement hooks.server.ts for auth gating

**Files:**
- Create: `web/src/hooks.server.ts`

- [ ] **Step 1: Create `web/src/hooks.server.ts`**

```typescript
import { type Handle, redirect } from '@sveltejs/kit';
import { refreshAccessToken } from '$lib/auth/keycloak';
import {
  clearSession,
  isExpired,
  readSession,
  userContextFromToken,
  writeSession,
} from '$lib/auth/session';

const PUBLIC_PATHS = ['/login', '/login/callback', '/logout'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export const handle: Handle = async ({ event, resolve }) => {
  const session = readSession(event.cookies);

  if (session) {
    let active = session;
    if (isExpired(session)) {
      try {
        const tokens = await refreshAccessToken(session.refreshToken);
        active = {
          accessToken: tokens.access_token!,
          refreshToken: tokens.refresh_token ?? session.refreshToken,
          idToken: tokens.id_token ?? session.idToken,
          expiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in ?? 60),
        };
        writeSession(event.cookies, active);
      } catch {
        clearSession(event.cookies);
        active = session; // will fall through to redirect below
        if (!isPublic(event.url.pathname)) {
          throw redirect(303, '/login');
        }
      }
    }
    event.locals.accessToken = active.accessToken;
    event.locals.user = userContextFromToken(active.accessToken);
  } else {
    event.locals.accessToken = null;
    event.locals.user = null;
    if (!isPublic(event.url.pathname)) {
      throw redirect(303, '/login');
    }
  }

  return resolve(event);
};
```

- [ ] **Step 2: Verify compile**

```bash
cd web && npm run check
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add web/src/hooks.server.ts
git commit -m "feat(web/auth): hooks.server.ts gates routes + refreshes expired tokens"
```

---

### Task 22: Implement login + callback + logout routes

**Files:**
- Create: `web/src/routes/login/+page.server.ts`
- Create: `web/src/routes/login/callback/+server.ts`
- Create: `web/src/routes/logout/+server.ts`

- [ ] **Step 1: Create `web/src/routes/login/+page.server.ts`**

```typescript
import { redirect } from '@sveltejs/kit';
import * as oidc from 'openid-client';
import { buildAuthorizationUrl } from '$lib/auth/keycloak';
import { writeSession, readSession } from '$lib/auth/session';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
  if (locals.user) throw redirect(303, '/');

  const state = oidc.randomState();
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const authUrl = await buildAuthorizationUrl(state, codeVerifier);

  // Stash the verifier and state in the session cookie before redirect.
  const existing = readSession(cookies);
  writeSession(cookies, {
    accessToken: existing?.accessToken ?? '',
    refreshToken: existing?.refreshToken ?? '',
    idToken: existing?.idToken ?? '',
    expiresAt: 0,
    oauthState: state,
    codeVerifier,
  });

  throw redirect(303, authUrl.toString());
};
```

- [ ] **Step 2: Create `web/src/routes/login/+page.svelte`**

```svelte
<script lang="ts">
  // This page should never render — load() always redirects.
</script>

<p>Redirection vers Keycloak…</p>
```

- [ ] **Step 3: Create `web/src/routes/login/callback/+server.ts`**

```typescript
import { error, redirect } from '@sveltejs/kit';
import { exchangeCodeForTokens } from '$lib/auth/keycloak';
import { readSession, writeSession } from '$lib/auth/session';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const session = readSession(cookies);
  if (!session?.oauthState || !session.codeVerifier) {
    throw error(400, 'Session OAuth manquante. Recommencez la connexion.');
  }

  let tokens;
  try {
    tokens = await exchangeCodeForTokens(url, session.oauthState, session.codeVerifier);
  } catch (e) {
    throw error(400, `Échec de l'échange OIDC : ${(e as Error).message}`);
  }

  writeSession(cookies, {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token ?? '',
    idToken: tokens.id_token ?? '',
    expiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in ?? 60),
  });

  throw redirect(303, '/');
};
```

- [ ] **Step 4: Create `web/src/routes/logout/+server.ts`**

```typescript
import { redirect } from '@sveltejs/kit';
import { buildLogoutUrl } from '$lib/auth/keycloak';
import { clearSession, readSession } from '$lib/auth/session';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
  const session = readSession(cookies);
  clearSession(cookies);

  if (!session?.idToken) {
    throw redirect(303, '/login');
  }

  const url = await buildLogoutUrl(session.idToken);
  throw redirect(303, url.toString());
};
```

- [ ] **Step 5: Verify compile**

```bash
cd web && npm run check
```

Expected: passes.

- [ ] **Step 6: Commit**

```bash
git add web/src/routes/login web/src/routes/logout
git commit -m "feat(web/auth): /login, /login/callback, /logout OIDC routes"
```

---

## Section H — TanStack Query setup

### Task 23: Create QueryProvider component

**Files:**
- Create: `web/src/lib/components/query/QueryProvider.svelte`

- [ ] **Step 1: Create `web/src/lib/components/query/QueryProvider.svelte`**

```svelte
<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
  import { browser } from '$app/environment';
  import { dev } from '$app/environment';

  let { children } = $props();

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: (failureCount, error) => {
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: browser,
      },
      mutations: {
        retry: false,
      },
    },
  });
</script>

<QueryClientProvider {client}>
  {@render children?.()}
  {#if dev && browser}
    <SvelteQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
  {/if}
</QueryClientProvider>
```

- [ ] **Step 2: Verify compile**

```bash
cd web && npm run check
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/components/query/
git commit -m "feat(web): TanStack Query provider with stale time, retry policy, devtools"
```

---

## Section I — Custom primitives

### Task 24: PageHeader primitive

**Files:**
- Create: `web/src/lib/components/primitives/PageHeader.svelte`

- [ ] **Step 1: Create `web/src/lib/components/primitives/PageHeader.svelte`**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    description?: string;
    actions?: Snippet;
  }

  let { title, description, actions }: Props = $props();
</script>

<header class="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <h1 class="text-2xl font-semibold tracking-tight">{title}</h1>
    {#if description}
      <p class="text-sm text-muted-foreground mt-1">{description}</p>
    {/if}
  </div>
  {#if actions}
    <div class="flex items-center gap-2">
      {@render actions()}
    </div>
  {/if}
</header>
```

- [ ] **Step 2: Verify compile**

```bash
cd web && npm run check
```

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/components/primitives/PageHeader.svelte
git commit -m "feat(web/ui): PageHeader primitive"
```

---

### Task 25: EmptyState, LoadingState, ErrorState primitives

**Files:**
- Create: `web/src/lib/components/primitives/EmptyState.svelte`
- Create: `web/src/lib/components/primitives/LoadingState.svelte`
- Create: `web/src/lib/components/primitives/ErrorState.svelte`

- [ ] **Step 1: Create `web/src/lib/components/primitives/EmptyState.svelte`**

```svelte
<script lang="ts">
  import type { Snippet, Component } from 'svelte';
  import { InboxIcon } from '@lucide/svelte';

  interface Props {
    icon?: Component;
    title: string;
    description?: string;
    action?: Snippet;
  }

  let { icon: Icon = InboxIcon, title, description, action }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
  <Icon class="h-12 w-12 text-muted-foreground/50" />
  <h2 class="text-lg font-medium">{title}</h2>
  {#if description}
    <p class="text-sm text-muted-foreground max-w-md">{description}</p>
  {/if}
  {#if action}
    <div class="mt-2">{@render action()}</div>
  {/if}
</div>
```

- [ ] **Step 2: Create `web/src/lib/components/primitives/LoadingState.svelte`**

```svelte
<script lang="ts">
  import { Skeleton } from '$lib/components/ui/skeleton';

  interface Props {
    variant?: 'skeleton-rows' | 'skeleton-cards' | 'spinner';
    rows?: number;
  }

  let { variant = 'skeleton-rows', rows = 5 }: Props = $props();
</script>

{#if variant === 'skeleton-rows'}
  <div class="space-y-3 py-6">
    {#each Array.from({ length: rows }) as _}
      <Skeleton class="h-10 w-full" />
    {/each}
  </div>
{:else if variant === 'skeleton-cards'}
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 py-6">
    {#each Array.from({ length: rows }) as _}
      <Skeleton class="h-32 w-full" />
    {/each}
  </div>
{:else}
  <div class="flex items-center justify-center py-16">
    <div class="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent"></div>
  </div>
{/if}
```

- [ ] **Step 3: Create `web/src/lib/components/primitives/ErrorState.svelte`**

```svelte
<script lang="ts">
  import { AlertTriangleIcon } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';

  interface Props {
    title?: string;
    description?: string;
    onRetry?: () => void;
  }

  let {
    title = 'Une erreur est survenue',
    description = 'Réessaye dans quelques instants. Si le problème persiste, contacte un admin.',
    onRetry,
  }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
  <AlertTriangleIcon class="h-12 w-12 text-destructive" />
  <h2 class="text-lg font-medium">{title}</h2>
  <p class="text-sm text-muted-foreground max-w-md">{description}</p>
  {#if onRetry}
    <Button variant="outline" onclick={onRetry} class="mt-2">Réessayer</Button>
  {/if}
</div>
```

- [ ] **Step 4: Verify compile**

```bash
cd web && npm run check
```

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/components/primitives/EmptyState.svelte web/src/lib/components/primitives/LoadingState.svelte web/src/lib/components/primitives/ErrorState.svelte
git commit -m "feat(web/ui): EmptyState, LoadingState, ErrorState primitives"
```

---

### Task 26: RoleBadge, PermissionPill, Gated primitives

**Files:**
- Create: `web/src/lib/components/primitives/RoleBadge.svelte`
- Create: `web/src/lib/components/primitives/PermissionPill.svelte`
- Create: `web/src/lib/components/primitives/Gated.svelte`

- [ ] **Step 1: Create `web/src/lib/components/primitives/RoleBadge.svelte`**

```svelte
<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import type { Tier } from '$lib/auth/types';

  interface Props {
    tier: Tier;
    label?: string;
  }

  let { tier, label }: Props = $props();

  const COLORS: Record<Tier, string> = {
    T0: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200',
    T1: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200',
    T2: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
    T3: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200',
    T4: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200',
    T5: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200',
  };
</script>

<Badge class="{COLORS[tier]} font-mono text-[10px] uppercase tracking-wide">
  {label ?? tier}
</Badge>
```

- [ ] **Step 2: Create `web/src/lib/components/primitives/PermissionPill.svelte`**

```svelte
<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import { EyeIcon, KeyIcon, PencilIcon, LockIcon } from '@lucide/svelte';
  import type { PermissionLevel } from '$lib/auth/types';

  interface Props {
    level: PermissionLevel;
  }

  let { level }: Props = $props();

  const META: Record<PermissionLevel, { label: string; icon: typeof EyeIcon; cls: string }> = {
    none: { label: 'Aucun', icon: LockIcon, cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900' },
    view: { label: 'Voir', icon: EyeIcon, cls: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200' },
    open: { label: 'Ouvrir', icon: KeyIcon, cls: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' },
    edit: { label: 'Éditer', icon: PencilIcon, cls: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' },
  };

  let m = $derived(META[level]);
</script>

<Badge class="{m.cls} flex items-center gap-1">
  <m.icon class="h-3 w-3" />
  {m.label}
</Badge>
```

- [ ] **Step 3: Create `web/src/lib/components/primitives/Gated.svelte`**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';
  import { can } from '$lib/auth/permissions';
  import type { Action } from '$lib/auth/types';

  interface Props {
    action: Action;
    children: Snippet;
    fallback?: Snippet;
  }

  let { action, children, fallback }: Props = $props();

  let allowed = $derived(can(page.data.user, action));
</script>

{#if allowed}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
```

- [ ] **Step 4: Verify compile**

```bash
cd web && npm run check
```

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/components/primitives/RoleBadge.svelte web/src/lib/components/primitives/PermissionPill.svelte web/src/lib/components/primitives/Gated.svelte
git commit -m "feat(web/ui): RoleBadge, PermissionPill, Gated primitives"
```

---

## Section J — App shell

### Task 27: ThemeToggle component

**Files:**
- Create: `web/src/lib/components/layout/ThemeToggle.svelte`

- [ ] **Step 1: Create `web/src/lib/components/layout/ThemeToggle.svelte`**

```svelte
<script lang="ts">
  import { resetMode, setMode, mode } from 'mode-watcher';
  import { Button } from '$lib/components/ui/button';
  import { SunIcon, MoonIcon } from '@lucide/svelte';
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
        <SunIcon class="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <MoonIcon class="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
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
```

- [ ] **Step 2: Verify compile**

```bash
cd web && npm run check
```

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/components/layout/ThemeToggle.svelte
git commit -m "feat(web/layout): ThemeToggle dropdown with light/dark/system"
```

---

### Task 28: AppSidebar component

**Files:**
- Create: `web/src/lib/components/layout/AppSidebar.svelte`

- [ ] **Step 1: Create `web/src/lib/components/layout/AppSidebar.svelte`**

```svelte
<script lang="ts">
  import { page } from '$app/state';
  import { can } from '$lib/auth/permissions';
  import type { Action } from '$lib/auth/types';
  import {
    BoxIcon,
    PackageIcon,
    LayersIcon,
    UsersIcon,
    ShieldIcon,
    ScrollIcon,
    UserCircleIcon,
  } from '@lucide/svelte';
  import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from '$lib/components/ui/sidebar';

  interface NavItem {
    label: string;
    href: string;
    icon: typeof BoxIcon;
    action?: Action;
  }

  const work: NavItem[] = [
    { label: 'Armoires', href: '/armoires', icon: BoxIcon },
    { label: 'Items', href: '/items', icon: PackageIcon },
    { label: 'Stocks', href: '/stocks', icon: LayersIcon },
  ];

  const governance: NavItem[] = [
    { label: 'Users', href: '/users', icon: UsersIcon, action: { type: 'view_users' } },
    { label: 'Roles', href: '/roles', icon: ShieldIcon, action: { type: 'view_roles' } },
    { label: 'Logs', href: '/logs', icon: ScrollIcon, action: { type: 'view_logs' } },
  ];

  let visibleGovernance = $derived(
    governance.filter((item) => !item.action || can(page.data.user, item.action)),
  );

  function isActive(href: string): boolean {
    return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
  }
</script>

<Sidebar collapsible="icon">
  <SidebarHeader>
    <div class="flex items-center gap-2 px-2 py-1.5">
      <div class="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
        <BoxIcon class="h-4 w-4" />
      </div>
      <div class="text-sm font-semibold group-data-[collapsible=icon]:hidden">SmartLock</div>
    </div>
  </SidebarHeader>

  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Travail</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {#each work as item}
            <SidebarMenuItem>
              <SidebarMenuButton isActive={isActive(item.href)}>
                {#snippet child({ props })}
                  <a href={item.href} {...props}>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                {/snippet}
              </SidebarMenuButton>
            </SidebarMenuItem>
          {/each}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>

    {#if visibleGovernance.length > 0}
      <SidebarGroup>
        <SidebarGroupLabel>Gouvernance</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {#each visibleGovernance as item}
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive(item.href)}>
                  {#snippet child({ props })}
                    <a href={item.href} {...props}>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  {/snippet}
                </SidebarMenuButton>
              </SidebarMenuItem>
            {/each}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    {/if}

    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={isActive('/me')}>
              {#snippet child({ props })}
                <a href="/me" {...props}>
                  <UserCircleIcon />
                  <span>Profile</span>
                </a>
              {/snippet}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
```

- [ ] **Step 2: Verify compile**

```bash
cd web && npm run check
```

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/components/layout/AppSidebar.svelte
git commit -m "feat(web/layout): AppSidebar with role-gated Travail/Gouvernance/Profile sections"
```

---

### Task 29: UserMenu and AppBreadcrumbs components

**Files:**
- Create: `web/src/lib/components/layout/UserMenu.svelte`
- Create: `web/src/lib/components/layout/AppBreadcrumbs.svelte`

- [ ] **Step 1: Create `web/src/lib/components/layout/UserMenu.svelte`**

```svelte
<script lang="ts">
  import { page } from '$app/state';
  import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
  import { Button } from '$lib/components/ui/button';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '$lib/components/ui/dropdown-menu';
  import RoleBadge from '$lib/components/primitives/RoleBadge.svelte';
  import { highestTier } from '$lib/auth/permissions';
  import { ChevronDownIcon } from '@lucide/svelte';

  let user = $derived(page.data.user);
  let initials = $derived(
    user
      ? user.displayName
          .split(' ')
          .map((p: string) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : '?',
  );
  let tier = $derived(user ? highestTier(user) : 'T5');
</script>

{#if user}
  <DropdownMenu>
    <DropdownMenuTrigger>
      {#snippet child({ props })}
        <Button variant="ghost" class="flex items-center gap-2 h-9" {...props}>
          <Avatar class="h-7 w-7">
            <AvatarFallback class="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div class="hidden sm:flex items-center gap-2">
            <span class="text-sm font-medium">{user.displayName}</span>
            <RoleBadge {tier} />
          </div>
          <ChevronDownIcon class="h-4 w-4 text-muted-foreground" />
        </Button>
      {/snippet}
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel>
        <div class="flex flex-col">
          <span>{user.displayName}</span>
          <span class="text-xs font-normal text-muted-foreground">{user.email}</span>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        {#snippet child({ props })}
          <a href="/me" {...props}>Profile</a>
        {/snippet}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        {#snippet child({ props })}
          <a href="/logout" {...props}>Déconnexion</a>
        {/snippet}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
{/if}
```

- [ ] **Step 2: Create `web/src/lib/components/layout/AppBreadcrumbs.svelte`**

```svelte
<script lang="ts">
  import { page } from '$app/state';
  import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from '$lib/components/ui/breadcrumb';

  const LABELS: Record<string, string> = {
    armoires: 'Armoires',
    items: 'Items',
    stocks: 'Stocks',
    users: 'Users',
    roles: 'Roles',
    logs: 'Logs',
    me: 'Profile',
    treasury: 'Trésorerie',
  };

  let crumbs = $derived.by(() => {
    const segments = page.url.pathname.split('/').filter(Boolean);
    const acc: Array<{ href: string; label: string; isLast: boolean }> = [];
    segments.forEach((seg, i) => {
      const href = '/' + segments.slice(0, i + 1).join('/');
      const label = LABELS[seg] ?? seg;
      acc.push({ href, label, isLast: i === segments.length - 1 });
    });
    return acc;
  });
</script>

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
    </BreadcrumbItem>
    {#each crumbs as c}
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        {#if c.isLast}
          <BreadcrumbPage>{c.label}</BreadcrumbPage>
        {:else}
          <BreadcrumbLink href={c.href}>{c.label}</BreadcrumbLink>
        {/if}
      </BreadcrumbItem>
    {/each}
  </BreadcrumbList>
</Breadcrumb>
```

- [ ] **Step 3: Verify compile**

```bash
cd web && npm run check
```

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/components/layout/UserMenu.svelte web/src/lib/components/layout/AppBreadcrumbs.svelte
git commit -m "feat(web/layout): UserMenu (avatar + dropdown) + AppBreadcrumbs"
```

---

### Task 30: AppTopbar component

**Files:**
- Create: `web/src/lib/components/layout/AppTopbar.svelte`

- [ ] **Step 1: Create `web/src/lib/components/layout/AppTopbar.svelte`**

```svelte
<script lang="ts">
  import { SidebarTrigger } from '$lib/components/ui/sidebar';
  import { Separator } from '$lib/components/ui/separator';
  import AppBreadcrumbs from './AppBreadcrumbs.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import UserMenu from './UserMenu.svelte';
</script>

<header
  class="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4"
>
  <SidebarTrigger class="-ml-1" />
  <Separator orientation="vertical" class="mr-2 h-4" />
  <AppBreadcrumbs />
  <div class="ml-auto flex items-center gap-2">
    <ThemeToggle />
    <UserMenu />
  </div>
</header>
```

- [ ] **Step 2: Verify compile**

```bash
cd web && npm run check
```

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/components/layout/AppTopbar.svelte
git commit -m "feat(web/layout): AppTopbar with sidebar trigger + breadcrumbs + theme + user"
```

---

## Section K — Routes

### Task 31: Root layout (auth + sidebar + topbar + query provider)

**Files:**
- Create: `web/src/routes/+layout.server.ts`
- Create: `web/src/routes/+layout.svelte`

- [ ] **Step 1: Create `web/src/routes/+layout.server.ts`**

```typescript
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user,
  };
};
```

- [ ] **Step 2: Create `web/src/routes/+layout.svelte`**

```svelte
<script lang="ts">
  import '$lib/../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import { Toaster } from '$lib/components/ui/sonner';
  import {
    SidebarInset,
    SidebarProvider,
  } from '$lib/components/ui/sidebar';
  import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
  import AppTopbar from '$lib/components/layout/AppTopbar.svelte';
  import QueryProvider from '$lib/components/query/QueryProvider.svelte';
  import { page } from '$app/state';

  let { children } = $props();

  let isAuthRoute = $derived(
    page.url.pathname.startsWith('/login') || page.url.pathname.startsWith('/logout'),
  );
</script>

<ModeWatcher />
<Toaster />

<QueryProvider>
  {#if isAuthRoute || !page.data.user}
    {@render children?.()}
  {:else}
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <main class="flex-1 p-6">
          <div class="mx-auto max-w-7xl">
            {@render children?.()}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  {/if}
</QueryProvider>
```

Note the CSS import path — adjust if needed based on actual structure (it should be `../app.css` from `routes/`):

Actually the import should be `../app.css` relative path or absolute via SvelteKit's module-level CSS feature. Replace `import '$lib/../app.css';` with:

```svelte
<script lang="ts">
  import '../app.css';
  // ... rest
</script>
```

- [ ] **Step 3: Verify compile**

```bash
cd web && npm run check
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add web/src/routes/+layout.svelte web/src/routes/+layout.server.ts
git commit -m "feat(web/routes): root layout with sidebar/topbar shell + QueryProvider + ModeWatcher"
```

---

### Task 32: Root index redirect + error page

**Files:**
- Create: `web/src/routes/+page.server.ts`
- Create: `web/src/routes/+error.svelte`

- [ ] **Step 1: Create `web/src/routes/+page.server.ts`**

```typescript
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(303, '/login');
  throw redirect(303, '/armoires');
};
```

- [ ] **Step 2: Create `web/src/routes/+error.svelte`**

```svelte
<script lang="ts">
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button';
  import ErrorState from '$lib/components/primitives/ErrorState.svelte';

  let title = $derived(
    page.status === 404
      ? 'Page introuvable'
      : page.status === 403
        ? "Accès refusé"
        : 'Erreur',
  );
  let description = $derived(page.error?.message ?? '');
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center">
  <ErrorState {title} {description} />
  <Button variant="outline" onclick={() => window.history.back()} class="mt-2">Retour</Button>
</div>
```

- [ ] **Step 3: Verify compile**

```bash
cd web && npm run check
```

- [ ] **Step 4: Commit**

```bash
git add web/src/routes/+page.server.ts web/src/routes/+error.svelte
git commit -m "feat(web/routes): / redirect (login or armoires) + +error.svelte page"
```

---

### Task 33: /me stub + placeholder pages

**Files:**
- Create: `web/src/routes/me/+page.svelte`
- Create: `web/src/routes/armoires/+page.svelte`
- Create: `web/src/routes/users/+page.svelte`
- Create: `web/src/routes/roles/+page.svelte`
- Create: `web/src/routes/items/+page.svelte`
- Create: `web/src/routes/stocks/+page.svelte`
- Create: `web/src/routes/logs/+page.svelte`
- Create: `web/src/routes/treasury/+page.svelte`

- [ ] **Step 1: Create `web/src/routes/me/+page.svelte`**

```svelte
<script lang="ts">
  import { page } from '$app/state';
  import PageHeader from '$lib/components/primitives/PageHeader.svelte';
  import RoleBadge from '$lib/components/primitives/RoleBadge.svelte';

  let user = $derived(page.data.user);
</script>

<PageHeader title="Profile" description="Tes informations Keycloak (stub P0)." />

{#if user}
  <div class="mt-6 space-y-2 text-sm">
    <div><span class="font-medium">Nom :</span> {user.displayName}</div>
    <div><span class="font-medium">Email :</span> {user.email}</div>
    <div><span class="font-medium">Username :</span> <span class="font-mono">{user.username}</span></div>
    <div class="flex items-center gap-2">
      <span class="font-medium">Rôles :</span>
      {#each user.roles as r}
        <RoleBadge tier={r.tier} label={r.name} />
      {/each}
    </div>
  </div>
{/if}
```

- [ ] **Step 2: Create placeholder pages — same pattern for each of armoires, users, roles, items, stocks, logs**

Use this content for each (replacing `<NAME>` with the page name):

```svelte
<script lang="ts">
  import PageHeader from '$lib/components/primitives/PageHeader.svelte';
  import EmptyState from '$lib/components/primitives/EmptyState.svelte';
  import { ConstructionIcon } from '@lucide/svelte';
</script>

<PageHeader title="<NAME>" description="Cette page sera implémentée en phase suivante." />

<EmptyState
  icon={ConstructionIcon}
  title="Bientôt disponible"
  description="Le contenu de cette page sera ajouté lors de la phase correspondante du plan d'implémentation."
/>
```

Replace `<NAME>` with `Armoires`, `Users`, `Roles`, `Items`, `Stocks`, `Logs`, `Trésorerie` respectively in each file.

- [ ] **Step 3: Verify compile and dev boot**

```bash
cd web && npm run check
```

- [ ] **Step 4: Commit**

```bash
git add web/src/routes/me web/src/routes/armoires web/src/routes/users web/src/routes/roles web/src/routes/items web/src/routes/stocks web/src/routes/logs web/src/routes/treasury
git commit -m "feat(web/routes): /me stub + placeholder pages for armoires/users/roles/items/stocks/logs/treasury"
```

---

## Section L — Smoke test + documentation

### Task 34: Update smoke E2E test for shell

**Files:**
- Modify: `web/tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Replace `web/tests/e2e/smoke.spec.ts`**

```typescript
import { expect, test } from '@playwright/test';

test('unauthenticated user is redirected to /login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
});

test('placeholder pages also redirect to /login when unauthenticated', async ({ page }) => {
  await page.goto('/armoires');
  await expect(page).toHaveURL(/\/login/);
});
```

(The placeholder pages will redirect via hooks.server.ts when no session exists.)

- [ ] **Step 2: Run dev server in background and run E2E**

Note: this test will pass only if Keycloak isn't required for the redirect itself. The redirect happens before any Keycloak call. To test fully, Keycloak must be running. We accept this as a manual verification step. Skip the actual run for now if Keycloak isn't available:

```bash
cd web && npm run test:e2e -- --reporter=list 2>&1 | head -30 || echo "Skipped (Keycloak not running)"
```

- [ ] **Step 3: Commit**

```bash
git add web/tests/e2e/smoke.spec.ts
git commit -m "test(web/e2e): smoke test for unauthenticated redirect"
```

---

### Task 35: Write web/README.md

**Files:**
- Create: `web/README.md`

- [ ] **Step 1: Create `web/README.md`**

```markdown
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
├── app.css                          Global Tailwind tokens (zinc + indigo, light+dark)
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
```

- [ ] **Step 2: Commit**

```bash
git add web/README.md
git commit -m "docs(web): add README with setup, scripts, layout, references"
```

---

### Task 36: Final verification + push

- [ ] **Step 1: Run all checks**

```bash
cd web && npm run check && npm run lint && npm run test
```

Expected: all pass (test reports ~50 tests passing across schemas, auth helpers, api client).

- [ ] **Step 2: Start dev server and manually verify**

```bash
cd web && npm run dev
```

Open http://localhost:5173 in browser. Without Keycloak running, you'll see a 500 on the redirect (because `/login` tries to reach Keycloak). With Keycloak running and configured, you should be redirected to the Keycloak login page.

Acceptance criteria for P0:
- ✅ Unauthenticated request to `/` redirects to `/login`
- ✅ `/login` triggers Keycloak Authorization Code + PKCE flow
- ✅ Successful login lands on `/armoires` (placeholder)
- ✅ Sidebar shows "Travail" + Profile sections always; "Gouvernance" group appears only for users with appropriate flags/tier
- ✅ Theme toggle persists choice across reloads
- ✅ All placeholder pages render without errors
- ✅ Logout clears session and ends Keycloak session

- [ ] **Step 3: Final commit if any cleanup**

```bash
git status
# If any pending changes, commit them with a relevant message.
```

- [ ] **Step 4: Push branch**

```bash
git push origin draft-layout
```

---

## Post-P0

The next plan (`2026-05-14-mvp-dashboard-p1-governance.md` to be written) will cover Phase 1:
- `/users` list with search/filter/pagination
- `/users/[id]` detail with Roles/Activity/Sessions tabs
- `/roles` list (système vs custom)
- `/roles/[id]?tab=permissions` matrix
- `/roles/[id]?tab=users` reverse view
- `/roles/[id]?tab=settings` for custom roles
- Dialogs for assign role, create/edit role, revoke user, delete role
- E2E tests for the governance loop

Subsequent plans (P2, P3, P4) will follow the same single-phase, single-plan rhythm.

---

## Open points to resolve during P0 implementation

- **`audit_viewer` flag**: this plan assumes the API exposes it in JWT claims (`smartlock_roles[].audit_viewer`). If the API doesn't yet, the `can(_, view_logs)` check falls back to `requireTier T0`. Coordinate with the backend on whether to add this flag now or defer.
- **JWT enrichment**: the plan assumes Keycloak tokens contain `smartlock_roles` and `smartlock_armoire_permissions` claims, populated by an API-side token mapper. If absent, `userContextFromToken` falls back to plain `realm_access.roles` with default T5 tier. Confirm whether the API/Keycloak setup supports custom claim enrichment.
- **Indigo accent**: hex used is `hsl(238 84% 60%)` (Tailwind indigo-500-ish). Reconfirm if Devinci/Fablab has a brand color to override.
- **API base URL**: defaulted to `http://localhost:8000`. Production URL must be set in `.env`.
