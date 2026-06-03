# syntax=docker/dockerfile:1.7
# Image de production — build SvelteKit servi par Node (adapter-node).
# Node 22 LTS — required by lint-staged 17+ (used in devDeps during the
# build stage). The runtime stage runs on the same base for consistency.

# ---- Stage 1 : build ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
# --no-audit / --no-fund skip remote calls during the install + cut noise.
# Cache clean keeps the (discarded) layer leaner during local builds.
RUN npm ci --no-audit --no-fund && npm cache clean --force

COPY . .
RUN npm run build && npm prune --omit=dev

# ---- Stage 2 : runtime ----
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy with non-root ownership so a `read_only: true` container can still
# read its own files (and so nothing accidentally runs as root via stale
# defaults if the image is consumed outside compose).
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./

EXPOSE 3000
USER node

# Liveness probe baked into the image so any runtime (compose, k8s, plain
# `docker run`) gets it for free. busybox wget is already in node:alpine.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD wget -q -O- http://127.0.0.1:3000/health || exit 1

CMD ["node", "build"]
