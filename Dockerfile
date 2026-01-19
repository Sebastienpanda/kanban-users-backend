# Étape 1: Build
FROM node:24-alpine AS builder

# Installer pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer TOUTES les dépendances (dev incluses pour le build)
RUN pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Build de l'application
RUN pnpm run build

# Étape 2: Production (image finale légère)
FROM node:24-alpine AS production

# Installer pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# ✅ 1. D'ABORD copier package.json
COPY package.json pnpm-lock.yaml ./

# ✅ 2. ENSUITE installer les dépendances
RUN pnpm install --prod --frozen-lockfile

# ✅ 3. Copier le build depuis l'étape builder
COPY --from=builder /app/dist ./dist

# ✅ Créer un user non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# ✅ Changer les permissions
RUN chown -R nestjs:nodejs /app

# ✅ Utiliser le user non-root
USER nestjs

# ✅ Exposer le port 3000
EXPOSE 3000

# ✅ Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# ✅ Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# ✅ Démarrer l'application
CMD ["node", "dist/src/main.js"]
