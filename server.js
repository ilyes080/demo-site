const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Charger les données de démo
let demoData = null;
const demoDataPath = path.join(__dirname, 'demo-data.json');
if (fs.existsSync(demoDataPath)) {
  demoData = JSON.parse(fs.readFileSync(demoDataPath, 'utf8'));
  console.log('📊 Données de démo chargées');
}

// Routes de démo uniquement
const demoRoutes = require('./src/routes/demo');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS pour Vercel
app.use(cors({
  origin: true,
  credentials: true
}));

// Sécurité adaptée pour Vercel
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting léger pour démo
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use('/api/', limiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes API - Mode démo uniquement
console.log('🎯 Mode démo Vercel activé');
app.use('/api', demoRoutes);
app.use('/api/reporting', require('./src/routes/reporting'));

// Servir le frontend
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RestaurantPro Demo API is running',
    timestamp: new Date().toISOString(),
    mode: 'demo',
    accounts: {
      chain: 'chain@demo.com / demo123',
      gastro: 'gastro@demo.com / demo123'
    }
  });
});

// Catch-all handler pour SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: 'Internal server error'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 RestaurantPro Demo running on port ${PORT}`);
  console.log(`🎯 Mode: Démo IndieMarker`);
  console.log(`🌐 API Health: /api/health`);
  console.log('');
  console.log('🔑 Comptes de démonstration :');
  console.log('   Chaîne: chain@demo.com / demo123');
  console.log('   Gastro: gastro@demo.com / demo123');
});

module.exports = app;