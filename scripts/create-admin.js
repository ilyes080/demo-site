#!/usr/bin/env node

const readline = require('readline');
const bcrypt = require('bcryptjs');
const { User, Restaurant } = require('../src/models');
const { sequelize } = require('../src/config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('\n🔧 Création du compte administrateur RestaurantPro\n');

    // Vérifier la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Synchroniser les modèles
    await sequelize.sync();
    console.log('✅ Modèles de base de données synchronisés');

    // Demander les informations de l'administrateur
    const email = await question('📧 Email de l\'administrateur : ');
    const password = await question('🔐 Mot de passe : ');
    const firstName = await question('👤 Prénom : ');
    const lastName = await question('👤 Nom : ');
    const restaurantName = await question('🏪 Nom du restaurant/chaîne : ');
    const restaurantType = await question('🍽️  Type (chain/gastronomy) : ');

    // Valider le type de restaurant
    if (!['chain', 'gastronomy'].includes(restaurantType)) {
      console.log('❌ Type de restaurant invalide. Utilisez "chain" ou "gastronomy"');
      process.exit(1);
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('❌ Un utilisateur avec cet email existe déjà');
      process.exit(1);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer le restaurant
    const restaurant = await Restaurant.create({
      name: restaurantName,
      type: restaurantType,
      address: 'À configurer',
      phone: 'À configurer',
      email: email,
      settings: {
        currency: 'EUR',
        timezone: 'Europe/Paris',
        language: 'fr'
      }
    });

    // Créer l'utilisateur administrateur
    const admin = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'admin',
      restaurantId: restaurant.id,
      isActive: true
    });

    console.log('\n🎉 Compte administrateur créé avec succès !');
    console.log(`📧 Email : ${email}`);
    console.log(`🏪 Restaurant : ${restaurantName} (${restaurantType})`);
    console.log(`🆔 ID Restaurant : ${restaurant.id}`);
    console.log(`🆔 ID Utilisateur : ${admin.id}`);

    console.log('\n✅ Vous pouvez maintenant vous connecter à RestaurantPro');
    console.log('🌐 Démarrez le serveur avec : npm start');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur :', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin;