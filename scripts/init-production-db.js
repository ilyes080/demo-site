#!/usr/bin/env node

const { sequelize } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function initProductionDatabase() {
  try {
    console.log('\n🔧 Initialisation de la base de données production\n');

    // Vérifier la configuration
    if (!process.env.DB_HOST || !process.env.DB_NAME) {
      console.log('❌ Configuration de base de données manquante');
      console.log('   Vérifiez votre fichier .env :');
      console.log('   - DB_HOST');
      console.log('   - DB_NAME');
      console.log('   - DB_USER');
      console.log('   - DB_PASSWORD');
      process.exit(1);
    }

    console.log('📊 Configuration détectée :');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}`);

    // Tester la connexion
    console.log('\n🔌 Test de connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion établie avec succès');

    // Créer les tables
    console.log('\n📋 Création des tables...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Tables créées/mises à jour');

    // Charger les ingrédients de base
    console.log('\n🥕 Chargement des ingrédients de base...');
    const ingredientsPath = path.join(__dirname, '..', 'demo-data.json');
    
    if (fs.existsSync(ingredientsPath)) {
      const demoData = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'));
      
      if (demoData.ingredients && demoData.ingredients.length > 0) {
        // Ici vous pourriez insérer les ingrédients de base
        // Pour l'instant, on les laisse dans le système de démo
        console.log(`✅ ${demoData.ingredients.length} ingrédients de référence disponibles`);
      }
    }

    // Créer les dossiers nécessaires
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Dossier uploads créé');
    }

    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      console.log('✅ Dossier logs créé');
    }

    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('\n📋 Prochaines étapes :');
    console.log('   1. Créer votre compte administrateur : npm run create:admin');
    console.log('   2. Démarrer l\'application : npm start');
    console.log('   3. Accéder à l\'interface : http://localhost:3001');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error.message);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('\n💡 Conseils de dépannage :');
      console.log('   - Vérifiez que PostgreSQL est démarré');
      console.log('   - Vérifiez les paramètres de connexion dans .env');
      console.log('   - Vérifiez que la base de données existe');
      console.log('   - Vérifiez les permissions utilisateur');
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  initProductionDatabase();
}

module.exports = initProductionDatabase;