# ============================================================================
# ENERGIALY - Frontend (Next.js) Dockerfile
# ============================================================================

FROM node:18-alpine AS base

# ── Dependencies Stage ──────────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# ── Builder Stage ───────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

# Build arguments
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_ENV_MODE=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_ENV_MODE=$NEXT_PUBLIC_ENV_MODE
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

RUN npm run build

# ── Runner Stage ────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
