# 🎯 Guide de Démarrage - Mode Démonstration

## 🚀 Démarrage Rapide

### Option 1: Script Automatique (Recommandé)
```bash
# Windows
.\start-demo.bat

# Linux/macOS
chmod +x start-demo.sh
./start-demo.sh
```

### Option 2: Démarrage Manuel
```bash
# 1. Installation des dépendances (si nécessaire)
npm install
cd frontend && npm install && cd ..

# 2. Compilation du frontend
npm run build:frontend

# 3. Démarrage du serveur
node server.js
```

## 🔑 Comptes de Démonstration

### Restaurant Chaîne
- **Email:** `chain@demo.com`
- **Mot de passe:** `demo123`
- **Fonctionnalités:** Gestion multi-sites, audits, standards

### Restaurant Gastronomique
- **Email:** `gastro@demo.com`
- **Mot de passe:** `demo123`
- **Fonctionnalités:** Costing précis, traçabilité, saisonnalité

## 🌐 Accès à l'Application

Une fois le serveur démarré :
- **Application complète:** http://localhost:3001
- **API Health Check:** http://localhost:3001/api/health

## 🔧 Dépannage

### Problème: "Cannot connect to server"
**Solutions:**
1. Vérifiez que le serveur est démarré : `node server.js`
2. Vérifiez que le port 3001 est libre
3. Arrêtez les processus existants : `taskkill /F /IM node.exe`
4. Redémarrez avec le script : `.\start-demo.bat`

### Problème: "Login failed" ou "Je n'arrive pas à me connecter"
**Vérifications étape par étape :**

1. **Vérifiez l'API :**
   - Ouvrez http://localhost:3001/api/health
   - Vous devez voir : `{"status":"OK","message":"RestaurantPro API is running"}`

2. **Testez la connexion manuellement :**
   ```powershell
   $body = @{email="chain@demo.com"; password="demo123"} | ConvertTo-Json
   Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $body -ContentType "application/json"
   ```

3. **Vérifiez les identifiants exacts :**
   - **Chaîne :** `chain@demo.com` / `demo123`
   - **Gastro :** `gastro@demo.com` / `demo123`
   - ⚠️ **Attention aux majuscules/minuscules !**

4. **Vérifiez le frontend :**
   - Ouvrez http://localhost:3001
   - La page de connexion doit s'afficher
   - Les comptes de démo doivent être visibles en bas

### Problème: "Frontend not loading" ou page blanche
**Solutions :**
1. Recompilez le frontend : `npm run build:frontend`
2. Vérifiez que le dossier `frontend/build` existe
3. Redémarrez le serveur complètement
4. Videz le cache du navigateur (Ctrl+F5)

### Problème: "Port already in use"
**Solutions :**
1. Arrêtez tous les processus Node : `taskkill /F /IM node.exe`
2. Ou changez le port dans `.env` : `PORT=3002`
3. Redémarrez avec le nouveau port

### Problème: Erreur "Module not found" ou dépendances manquantes
**Solutions :**
1. Réinstallez les dépendances :
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```
2. Supprimez node_modules et réinstallez :
   ```bash
   rmdir /s node_modules
   rmdir /s frontend\node_modules
   npm install
   cd frontend && npm install && cd ..
   ```

## ✅ Vérification du Fonctionnement

### Test API
```bash
# Health check
curl http://localhost:3001/api/health

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"chain@demo.com","password":"demo123"}'
```

### Test Frontend
1. Ouvrez http://localhost:3001
2. Connectez-vous avec un compte de démo
3. Vérifiez que le dashboard s'affiche

## 📊 Données de Démonstration

La démo inclut :
- ✅ **2 comptes utilisateurs** (chaîne + gastro)
- ✅ **90+ ingrédients prédéfinis** organisés par catégories
- ✅ **Recettes d'exemple** avec coûts calculés
- ✅ **Données de performance** simulées
- ✅ **Historique d'activité** généré automatiquement

## 🎯 Fonctionnalités Disponibles

### Mode Chaîne (`chain@demo.com`)
- Dashboard multi-sites
- Gestion des standards
- Audits et conformité
- Analyses comparatives
- Rapports consolidés

### Mode Gastronomique (`gastro@demo.com`)
- Costing précis au gramme
- Traçabilité des lots
- Gestion saisonnière
- Analyse de rentabilité
- Optimisation des marges

## 🔄 Réinitialisation

Pour remettre la démo à zéro :
1. Connectez-vous à l'application
2. Allez dans Paramètres (avatar utilisateur)
3. Cliquez sur "Réinitialiser les données"
4. Confirmez l'action

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez ce guide de dépannage
2. Consultez les logs du serveur
3. Testez l'API manuellement
4. Redémarrez l'application complètement

---

**RestaurantPro - Démo fonctionnelle prête à l'emploi ! 🚀**