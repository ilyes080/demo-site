@echo off
echo.
echo ========================================
echo   RestaurantPro - Configuration Production
echo ========================================
echo.

echo Vérification des prérequis...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé
    echo    Téléchargez Node.js depuis https://nodejs.org
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm n'est pas disponible
    pause
    exit /b 1
)

echo ✅ Node.js et npm détectés

echo.
echo 1. Installation des dépendances...
call npm install
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)
echo ✅ Dépendances installées

echo.
echo 2. Installation du frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation du frontend
    pause
    exit /b 1
)
echo ✅ Frontend installé

echo.
echo 3. Build du frontend...
call npm run build
if errorlevel 1 (
    echo ❌ Erreur lors du build du frontend
    pause
    exit /b 1
)
echo ✅ Frontend compilé
cd ..

echo.
echo 4. Configuration de l'environnement...
if not exist .env (
    copy .env.production .env
    echo ✅ Fichier .env créé depuis .env.production
) else (
    echo ⚠️  Fichier .env existant conservé
)

echo.
echo 5. Test de l'application...
echo Démarrage du serveur de test...
timeout /t 2 /nobreak >nul
start /b node server.js
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   🎉 Installation Terminée !
echo ========================================
echo.
echo ✅ RestaurantPro est prêt à fonctionner
echo.
echo 📋 Prochaines étapes :
echo    1. Configurez votre base de données PostgreSQL
echo    2. Éditez le fichier .env avec vos paramètres
echo    3. Exécutez : npm run init:db
echo    4. Créez votre admin : npm run create:admin
echo    5. Démarrez : npm start
echo.
echo 🌐 L'application sera accessible sur :
echo    http://localhost:3001
echo.
echo 📚 Documentation complète dans README_CLIENT.md
echo.
pause