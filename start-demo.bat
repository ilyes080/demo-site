@echo off
echo ========================================
echo    RestaurantPro - Mode Demonstration
echo ========================================
echo.

REM Arreter les processus Node existants
echo Arret des processus existants...
taskkill /F /IM node.exe >nul 2>&1

echo Verification des dependances...
if not exist "node_modules" (
    echo Installation des dependances backend...
    call npm install
    if errorlevel 1 (
        echo ERREUR: Installation backend echouee
        pause
        exit /b 1
    )
)

if not exist "frontend\node_modules" (
    echo Installation des dependances frontend...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo ERREUR: Installation frontend echouee
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo Compilation du frontend...
call npm run build:frontend
if errorlevel 1 (
    echo ERREUR: Compilation frontend echouee
    pause
    exit /b 1
)

echo.
echo Verification des fichiers requis...
if not exist "demo-data.json" (
    echo ERREUR: Fichier demo-data.json manquant
    pause
    exit /b 1
)

if not exist ".env" (
    echo Creation du fichier .env...
    echo NODE_ENV=development > .env
    echo PORT=3001 >> .env
    echo JWT_SECRET=demo-secret-key-for-development-only >> .env
    echo FRONTEND_URL=http://localhost:3000 >> .env
)

echo.
echo ========================================
echo    Demarrage du serveur de demonstration
echo ========================================
echo.
echo Comptes de demonstration :
echo   Chaine: chain@demo.com / demo123
echo   Gastro: gastro@demo.com / demo123
echo.
echo Application disponible sur: http://localhost:3001
echo API Health Check: http://localhost:3001/api/health
echo Test complet: http://localhost:3001/test-complete.html
echo.

set NODE_ENV=development

REM Demarrer le serveur en arriere-plan et ouvrir le navigateur
start /B node server.js
timeout /t 3 /nobreak >nul
start http://localhost:3001

echo.
echo Serveur demarre ! Appuyez sur Ctrl+C pour arreter.
echo.

REM Attendre que l'utilisateur arrete le serveur
:wait
timeout /t 1 /nobreak >nul
goto wait