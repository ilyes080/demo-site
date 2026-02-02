# Multi-stage build pour optimiser la taille de l'image
FROM node:18-alpine AS builder

# Installer les dépendances système
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Installer les dépendances
RUN npm ci --only=production
RUN cd frontend && npm ci --only=production

# Copier le code source
COPY . .

# Build du frontend
RUN npm run build:frontend

# Image de production
FROM node:18-alpine AS production

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S restaurantpro -u 1001

WORKDIR /app

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder --chown=restaurantpro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=restaurantpro:nodejs /app/frontend/build ./frontend/build
COPY --from=builder --chown=restaurantpro:nodejs /app/src ./src
COPY --from=builder --chown=restaurantpro:nodejs /app/scripts ./scripts
COPY --from=builder --chown=restaurantpro:nodejs /app/server.js ./
COPY --from=builder --chown=restaurantpro:nodejs /app/package*.json ./

# Créer le dossier uploads
RUN mkdir -p uploads && chown restaurantpro:nodejs uploads

# Changer vers l'utilisateur non-root
USER restaurantpro

# Exposer le port
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Commande de démarrage
CMD ["npm", "start"]