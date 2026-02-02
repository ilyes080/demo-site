# 🚀 Guide d'Installation RestaurantPro - Client

## 📋 Prérequis Système

### Obligatoire
- **Node.js 18+** : [Télécharger ici](https://nodejs.org)
- **PostgreSQL 12+** : [Télécharger ici](https://www.postgresql.org/download/)
- **Windows 10+** ou **Linux/macOS**

### Recommandé
- **4 GB RAM minimum** (8 GB recommandé)
- **2 GB d'espace disque libre**
- **Connexion Internet** (pour l'installation initiale)

## 🎯 Installation Rapide (Recommandée)

### Étape 1 : Téléchargement
1. Décompressez le fichier `RestaurantPro.zip`
2. Ouvrez un terminal dans le dossier `Application/`

### Étape 2 : Installation Automatique
```bash
# Windows
./setup-production.bat

# Linux/macOS
chmod +x setup-production.sh
./setup-production.sh
```

**Cette commande va :**
- ✅ Installer toutes les dépendances
- ✅ Compiler le frontend
- ✅ Configurer l'environnement
- ✅ Tester l'installation

## 🔧 Installation Manuelle (Avancée)

### Étape 1 : Installation des Dépendances
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
npm run build
cd ..
```

### Étape 2 : Configuration Base de Données
```bash
# Créer la base de données PostgreSQL
createdb restaurantpro_prod

# Configurer l'environnement
cp .env.production .env
```

### Étape 3 : Éditer la Configuration
Ouvrez le fichier `.env` et configurez :

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurantpro_prod
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

# JWT (générer une clé forte)
JWT_SECRET=votre-cle-jwt-super-secrete-256-bits

# URL de votre domaine
FRONTEND_URL=https://votre-domaine.com
```

### Étape 4 : Initialisation
```bash
# Initialiser la base de données
npm run init:prod

# Créer le compte administrateur
npm run create:admin
```

### Étape 5 : Démarrage
```bash
# Mode production
npm run start:prod

# Ou mode développement
npm start
```

## 🎮 Mode Démonstration

Pour tester rapidement sans configuration :

```bash
# Démarrage immédiat (aucune config requise)
./start-demo.bat
```

**Comptes de test :**
- **Chaîne** : `chain@demo.com` / `demo123`
- **Gastronomie** : `gastro@demo.com` / `demo123`

## 🌐 Accès à l'Application

Une fois démarrée, l'application est accessible sur :
- **URL locale** : http://localhost:3001
- **URL production** : https://votre-domaine.com

## 🔍 Vérification de l'Installation

### Test de Santé de l'API
```bash
curl http://localhost:3001/api/health
```

**Réponse attendue :**
```json
{
  "status": "OK",
  "message": "RestaurantPro API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test de Connexion
1. Ouvrez http://localhost:3001
2. Connectez-vous avec votre compte admin
3. Vérifiez que le dashboard s'affiche

## 🚨 Dépannage

### Erreur : "Node.js not found"
```bash
# Vérifier l'installation
node --version
npm --version

# Si non installé, télécharger depuis nodejs.org
```

### Erreur : "Database connection failed"
```bash
# Vérifier PostgreSQL
pg_isready

# Vérifier la configuration dans .env
# Vérifier que la base de données existe
```

### Erreur : "Port 3001 already in use"
```bash
# Changer le port dans .env
PORT=3002

# Ou arrêter le processus existant
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Erreur : "Permission denied"
```bash
# Windows : Exécuter en tant qu'administrateur
# Linux/macOS : Utiliser sudo si nécessaire
sudo npm install
```

## 📞 Support

### Documentation Complète
- `README_CLIENT.md` - Guide utilisateur
- `API_DOCS.md` - Documentation API
- `PRODUCTION_SETUP.md` - Configuration avancée

### Logs de Débogage
```bash
# Voir les logs en temps réel
tail -f logs/app.log

# Niveau de debug
LOG_LEVEL=debug npm start
```

### Contact Support
- **Email** : support@restaurantpro.com
- **Documentation** : Consultez les fichiers .md inclus
- **Logs** : Consultez le dossier `logs/`

## ✅ Checklist Post-Installation

- [ ] Node.js et npm installés
- [ ] PostgreSQL configuré et démarré
- [ ] Base de données créée
- [ ] Fichier .env configuré
- [ ] Dépendances installées
- [ ] Base de données initialisée
- [ ] Compte administrateur créé
- [ ] Application démarrée
- [ ] Test de connexion réussi
- [ ] Dashboard accessible

## 🎉 Félicitations !

RestaurantPro est maintenant installé et prêt à l'emploi.

**Prochaines étapes :**
1. **Configurer vos restaurants** dans l'interface
2. **Ajouter vos utilisateurs** (employés, managers)
3. **Importer votre inventaire** existant
4. **Créer vos premières recettes**
5. **Commencer à utiliser** les fonctionnalités avancées

**Bon usage de RestaurantPro ! 🍽️**