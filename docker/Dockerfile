# syntax=docker/dockerfile:1.7
# Image de production — build SvelteKit servi par Node (adapter-node).
# Node 22 LTS — required by lint-staged 17+ (used in devDeps during the
# build stage). The runtime stage runs on the same base for consistency.

# ---- Stage 1 : build ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

# ---- Stage 2 : runtime ----
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 3000
USER node

CMD ["node", "build"]
