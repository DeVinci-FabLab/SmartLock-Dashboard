# SmartLock Dashboard — build & run.
# Run `just` (no args) for the recipe menu.

# --- Build-time tuning ---------------------------------------------------
# Pick the native Docker platform: skip emulation on M-series Macs.
arch              := `uname -m`
docker_platform   := if arch == "arm64" { "linux/arm64" } else { "linux/amd64" }

# BuildKit + skip SBOM/provenance generation (≈ 20 s saved per build).
export DOCKER_BUILDKIT                := "1"
export COMPOSE_DOCKER_CLI_BUILD       := "1"
export BUILDX_NO_DEFAULT_ATTESTATIONS := "1"
export DOCKER_DEFAULT_PLATFORM        := docker_platform

# Compose aliases — dev and prod each have their own stack.
dc_dev  := "docker compose -f docker/compose.yaml"
dc_prod := "docker compose -f docker/compose.prod.yaml"

# --- Recipes -------------------------------------------------------------

# Default: print the recipe menu.
_default:
    @just --list --unsorted

# Shared helper: tear down + rebuild + start a single compose service.
# Unconditional teardown makes every public recipe an idempotent restart —
# no `restart-*` variants needed.
_restart dc service:
    @echo "→ Tearing down existing containers + volumes"
    {{dc}} down -v --remove-orphans
    @echo "→ Building and starting {{service}}"
    {{dc}} up -d --build {{service}}

# --- Repo housekeeping ---------------------------------------------------

# Pull the latest changes from origin.
update:
    git pull --rebase

# Install host dependencies (web/node_modules).
install:
    npm --prefix web install

# --- Local dev (no Docker) -----------------------------------------------

# Run Vite dev server on the host (http://localhost:5173).
dev-local:
    npm --prefix web run dev

# Build the SvelteKit production output (web/build).
build:
    npm --prefix web run build

# Serve the built output locally.
preview:
    npm --prefix web run preview

# --- Quality gates -------------------------------------------------------

# svelte-check (types).
check:
    npm --prefix web run check

# ESLint.
lint:
    npm --prefix web run lint

# Vitest unit tests.
test:
    npm --prefix web test

# Playwright + axe E2E.
test-e2e:
    npm --prefix web run test:e2e

# Run every gate, sequential. Fail-fast.
ci: check lint test test-e2e

# --- Docker dev stack ----------------------------------------------------

# Start the dev container (HMR bind mount, http://localhost:5173).
dev: (_restart dc_dev "smartlock-dashboard-dev")
    @echo "✓ http://localhost:5173 — Vite reloads on file changes."

# Tail dev container logs.
dev-logs:
    {{dc_dev}} logs -f

# --- Docker prod stack ---------------------------------------------------

# Build + start the hardened prod container (loopback :3000).
prod: (_restart dc_prod "smartlock-dashboard")
    @echo "✓ http://127.0.0.1:3000 — production image, healthcheck active."

# Tail prod container logs.
prod-logs:
    {{dc_prod}} logs -f

# --- Stop / clean --------------------------------------------------------

# Stop both stacks (volumes kept).
stop:
    -{{dc_dev}} down
    -{{dc_prod}} down
    @echo "✓ Stopped."

# Hard reset — containers, volumes, BuildKit caches, and local artefacts.
clean:
    @echo "→ Cleaning all containers, volumes, and local artefacts"
    -{{dc_dev}} down -v --remove-orphans
    -{{dc_prod}} down -v --remove-orphans
    docker image prune -f
    docker buildx prune -f
    rm -rf web/node_modules web/.svelte-kit web/build web/.output
    @echo "✓ Cleaned. Re-run 'just dev' or 'just prod' to rebuild from scratch."
