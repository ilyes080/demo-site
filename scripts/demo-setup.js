#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎯 Configuration du mode démonstration...');

// Vérifier que les données de démo existent
const demoDataPath = path.join(__dirname, '..', 'demo-data.json');
if (!fs.existsSync(demoDataPath)) {
  console.error('❌ Fichier demo-data.json non trouvé');
  process.exit(1);
}

// Créer le fichier .env pour la démo si il n'existe pas
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `NODE_ENV=development
PORT=3001
JWT_SECRET=demo-secret-key-for-development-only
FRONTEND_URL=http://localhost:3000
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Fichier .env créé pour la démonstration');
}

console.log('✅ Mode démonstration configuré');
console.log('');
console.log('🔑 Comptes de démonstration :');
console.log('   Chaîne: chain@demo.com / demo123');
console.log('   Gastro: gastro@demo.com / demo123');
console.log('');