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

# Nettoyer les dev dependencies
RUN pnpm prune --prod

# Étape 2: Production
FROM node:24-alpine AS runner

# Installer pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# Copier les dépendances de production
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copier le build
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copier les fichiers nécessaires
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/swagger.css ./

# Changer d'utilisateur (sécurité)
USER nestjs

# Exposer le port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application
CMD ["node", "dist/main.js"]
