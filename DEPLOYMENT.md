# Guide de Déploiement RestaurantPro

## Prérequis

### Serveur
- Node.js 18+ 
- PostgreSQL 13+
- Redis (optionnel, pour le cache)
- Nginx (recommandé pour la production)

### Services Cloud (Recommandés)
- **Base de données**: AWS RDS PostgreSQL ou Azure Database
- **Stockage**: AWS S3 ou Azure Blob Storage
- **Monitoring**: New Relic, DataDog ou Sentry
- **Email**: SendGrid, Mailgun ou AWS SES

## Installation

### 1. Cloner le projet
```bash
git clone <repository-url>
cd restaurantpro
```

### 2. Installation des dépendances
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 3. Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

### Variables d'environnement importantes
```env
NODE_ENV=production
PORT=3001
DB_HOST=your-db-host
DB_NAME=restaurantpro_prod
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
JWT_SECRET=your-very-secure-jwt-secret-256-bits
```

### 4. Base de données
```bash
# Initialiser la base de données
npm run init:db

# Ou manuellement
node scripts/init-database.js
```

### 5. Build du frontend
```bash
npm run build
```

## Déploiement

### Option 1: Serveur VPS/Dédié

#### Avec PM2 (Recommandé)
```bash
# Installer PM2 globalement
npm install -g pm2

# Créer le fichier ecosystem
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'restaurantpro',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Démarrer l'application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Configuration Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # Certificats SSL
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend statique
    location / {
        root /path/to/restaurantpro/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Uploads
    location /uploads {
        proxy_pass http://localhost:3001;
    }
}
```

### Option 2: Docker

#### Dockerfile
```dockerfile
# Backend + Frontend
FROM node:18-alpine

WORKDIR /app

# Copier package.json
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Installer les dépendances
RUN npm ci --only=production
RUN cd frontend && npm ci --only=production

# Copier le code source
COPY . .

# Build du frontend
RUN npm run build:frontend

# Exposer le port
EXPOSE 3001

# Commande de démarrage
CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_NAME=restaurantpro
      - DB_USER=postgres
      - DB_PASSWORD=secure_password
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=restaurantpro
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
```

### Option 3: Cloud (Heroku, Railway, etc.)

#### Heroku
```bash
# Installer Heroku CLI
# Créer l'application
heroku create restaurantpro-prod

# Ajouter PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configurer les variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret

# Déployer
git push heroku main

# Initialiser la base de données
heroku run npm run init:db
```

## Monitoring et Maintenance

### Logs
```bash
# PM2
pm2 logs restaurantpro

# Docker
docker-compose logs -f app

# Heroku
heroku logs --tail
```

### Monitoring de santé
```bash
# Endpoint de santé
curl https://your-domain.com/api/health
```

### Sauvegardes
```bash
# PostgreSQL
pg_dump -h localhost -U postgres restaurantpro > backup_$(date +%Y%m%d).sql

# Avec Docker
docker exec postgres_container pg_dump -U postgres restaurantpro > backup.sql
```

### Mise à jour
```bash
# Arrêter l'application
pm2 stop restaurantpro

# Mettre à jour le code
git pull origin main

# Installer les nouvelles dépendances
npm install
cd frontend && npm install && cd ..

# Rebuild le frontend
npm run build

# Redémarrer
pm2 start restaurantpro
```

## Sécurité

### Checklist de sécurité
- [ ] HTTPS activé avec certificats valides
- [ ] Variables d'environnement sécurisées
- [ ] Base de données avec mot de passe fort
- [ ] Firewall configuré (ports 22, 80, 443 uniquement)
- [ ] Sauvegardes automatiques
- [ ] Monitoring des erreurs
- [ ] Rate limiting activé
- [ ] Headers de sécurité (Helmet.js)

### Variables sensibles
```env
# Générer un JWT secret sécurisé
JWT_SECRET=$(openssl rand -base64 64)

# Mot de passe base de données fort
DB_PASSWORD=$(openssl rand -base64 32)
```

## Performance

### Optimisations recommandées
- Utiliser un CDN pour les assets statiques
- Activer la compression gzip
- Configurer le cache Redis
- Optimiser les requêtes SQL
- Monitoring des performances (APM)

### Configuration Redis (cache)
```javascript
// Dans src/config/redis.js
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache des requêtes fréquentes
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

## Support

### Contacts
- **Technique**: tech@restaurantpro.com
- **Support**: support@restaurantpro.com
- **Documentation**: https://docs.restaurantpro.com

### Ressources
- [Guide utilisateur](./USER_GUIDE.md)
- [API Documentation](./API_DOCS.md)
- [FAQ](./FAQ.md)