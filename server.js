const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Charger les données de démo si disponibles
let demoData = null;
const demoDataPath = path.join(__dirname, 'demo-data.json');
if (fs.existsSync(demoDataPath)) {
  demoData = JSON.parse(fs.readFileSync(demoDataPath, 'utf8'));
  console.log('📊 Données de démo chargées');
}

const { sequelize } = require('./src/config/database');
// Routes
const authRoutes = require('./src/routes/auth');
const restaurantRoutes = require('./src/routes/restaurants');
const inventoryRoutes = require('./src/routes/inventory');
const recipeRoutes = require('./src/routes/recipes');
const chainRoutes = require('./src/routes/chains');
const gastronomyRoutes = require('./src/routes/gastronomy');
const dashboardRoutes = require('./src/routes/dashboard');

// Routes de démo (si données de démo disponibles)
let demoRoutes = null;
if (demoData) {
  demoRoutes = require('./src/routes/demo');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par windowMs
});
app.use('/api/', limiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
if (demoData && process.env.NODE_ENV === 'development') {
  // Utiliser les routes de démo en développement
  console.log('🎯 Mode démo activé - Utilisation des données de test');
  app.use('/api', demoRoutes);
  // Ajouter les routes de reporting même en mode démo
  app.use('/api/reporting', require('./src/routes/reporting'));
} else {
  // Routes normales avec base de données
  app.use('/api/auth', authRoutes);
  app.use('/api/restaurants', restaurantRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/recipes', recipeRoutes);
  app.use('/api/chains', chainRoutes);
  app.use('/api/gastronomy', gastronomyRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/ai-copilot', require('./src/routes/ai-copilot'));
  app.use('/api/reporting', require('./src/routes/reporting'));
}

// Servir le frontend (en production et en mode démo)
if (process.env.NODE_ENV === 'production' || demoData) {
  app.use(express.static(path.join(__dirname, 'frontend/build')));
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RestaurantPro API is running',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Démarrage du serveur
async function startServer() {
  try {
    if (demoData && process.env.NODE_ENV === 'development') {
      // Mode démo - pas de base de données requise
      console.log('🎯 Mode démo - Base de données non requise');
    } else {
      // Mode normal - connexion base de données
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
      
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synchronized.');
      }
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 RestaurantPro server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 API Health: http://localhost:${PORT}/api/health`);
      
      if (demoData) {
        console.log('');
        console.log('🔑 Comptes de démonstration :');
        console.log('   Chaîne: chain@demo.com / demo123');
        console.log('   Gastro: gastro@demo.com / demo123');
        console.log('');
        console.log('🌐 Frontend: http://localhost:3000');
      }
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    if (!demoData) {
      process.exit(1);
    }
  }
}

startServer();