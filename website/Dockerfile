# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# --- install all deps (incl. dev) for the build ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- build the standalone server ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- prod-only deps for a lean runtime image ---
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# --- runtime ---
FROM base AS runtime
ENV NODE_ENV=production
# Astro's node adapter defaults to localhost; bind all interfaces so Coolify's
# proxy can reach the container.
ENV HOST=0.0.0.0
ENV PORT=4321
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
