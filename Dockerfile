# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Install all deps (incl. dev) using the lockfile for reproducibility.
COPY package.json package-lock.json ./
RUN npm ci

# Build the Nest app -> dist/
COPY . .
RUN npm run build

# Prune dev dependencies so we can copy a lean node_modules into the runner.
RUN npm prune --omit=dev


# ---------- Runtime stage ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# tini as PID 1 -> proper signal forwarding for graceful shutdown.
RUN apk add --no-cache tini

# Only what the runtime needs: prod node_modules, compiled JS, SQL migrations.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/package.json ./package.json

# Run as the built-in non-root user.
USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null 2>&1 || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
# Migrations run as a SEPARATE step (see README): node dist/database/migrate.js
CMD ["node", "dist/main.js"]
