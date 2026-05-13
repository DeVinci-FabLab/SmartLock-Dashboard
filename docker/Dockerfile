# syntax=docker/dockerfile:1.7
# Image de production — build SvelteKit servi par Node.
#
# Prérequis : svelte.config.js doit utiliser @sveltejs/adapter-node.
#   npm install -D @sveltejs/adapter-node
#   puis dans svelte.config.js :
#     import adapter from '@sveltejs/adapter-node';

# ---- Stage 1 : build ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

# ---- Stage 2 : runtime ----
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 3000
USER node

CMD ["node", "build"]
