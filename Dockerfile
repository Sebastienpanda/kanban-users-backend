# Étape 1: Build
FROM node:24-alpine AS builder

# Installer pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Build de l'application
RUN pnpm run build

FROM node:24-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/swagger.css ./swagger.css

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main"]
