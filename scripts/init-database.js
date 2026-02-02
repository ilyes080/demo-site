const { sequelize } = require('../src/config/database');
const { 
  User, 
  Restaurant, 
  ChainGroup, 
  Ingredient, 
  Supplier, 
  Inventory, 
  Recipe, 
  RecipeIngredient 
} = require('../src/models');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  try {
    console.log('🔄 Initialisation de la base de données...');
    
    // Synchronisation des modèles
    await sequelize.sync({ force: true });
    console.log('✅ Modèles synchronisés');

    // Création des données de démonstration
    await createDemoData();
    
    console.log('🎉 Base de données initialisée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

async function createDemoData() {
  console.log('📊 Création des données de démonstration...');

  // Création des groupes de chaînes
  const chainGroup = await ChainGroup.create({
    name: 'Burger Express',
    description: 'Chaîne de restauration rapide',
    settings: {
      standardRecipes: true,
      centralizedPurchasing: true
    }
  });

  // Création des restaurants
  const chainRestaurant = await Restaurant.create({
    name: 'Burger Express Paris Centre',
    type: 'chain',
    address: '123 Rue de Rivoli, 75001 Paris',
    phone: '01 42 60 30 30',
    email: 'paris-centre@burger-express.fr',
    chainGroupId: chainGroup.id
  });

  const gastronomyRestaurant = await Restaurant.create({
    name: 'Le Petit Gourmet',
    type: 'gastronomy',
    address: '45 Rue Saint-Honoré, 75001 Paris',
    phone: '01 42 61 05 09',
    email: 'contact@petit-gourmet.fr'
  });

  // Création des utilisateurs
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const chainUser = await User.create({
    email: 'chain@demo.com',
    password: hashedPassword,
    firstName: 'Marie',
    lastName: 'Dupont',
    role: 'manager'
  });

  const gastronomyUser = await User.create({
    email: 'gastro@demo.com',
    password: hashedPassword,
    firstName: 'Pierre',
    lastName: 'Martin',
    role: 'manager'
  });

  // Association utilisateurs-restaurants
  await chainUser.addRestaurant(chainRestaurant);
  await gastronomyUser.addRestaurant(gastronomyRestaurant);

  // Création des fournisseurs
  const suppliers = await Supplier.bulkCreate([
    {
      name: 'Metro Cash & Carry',
      contact: { phone: '01 40 00 00 00', email: 'pro@metro.fr' },
      specialty: 'Produits frais et surgelés',
      rating: 4.2
    },
    {
      name: 'Rungis Marché',
      contact: { phone: '01 41 80 80 80', email: 'commandes@rungis.fr' },
      specialty: 'Fruits et légumes premium',
      rating: 4.8
    },
    {
      name: 'Boucherie Centrale',
      contact: { phone: '01 45 67 89 00', email: 'pro@boucherie-centrale.fr' },
      specialty: 'Viandes de qualité',
      rating: 4.5
    }
  ]);

  // Création des ingrédients
  const ingredients = await Ingredient.bulkCreate([
    // Viandes
    { name: 'Bœuf haché', category: 'Viandes', unit: 'kg', allergens: [] },
    { name: 'Poulet fermier', category: 'Viandes', unit: 'kg', allergens: [] },
    { name: 'Saumon frais', category: 'Poissons', unit: 'kg', allergens: ['poisson'] },
    
    // Légumes
    { name: 'Tomates', category: 'Légumes', unit: 'kg', allergens: [] },
    { name: 'Salade verte', category: 'Légumes', unit: 'pièce', allergens: [] },
    { name: 'Oignons', category: 'Légumes', unit: 'kg', allergens: [] },
    { name: 'Champignons de Paris', category: 'Légumes', unit: 'kg', allergens: [] },
    
    // Produits laitiers
    { name: 'Fromage cheddar', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'] },
    { name: 'Crème fraîche', category: 'Produits laitiers', unit: 'L', allergens: ['lait'] },
    { name: 'Beurre', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'] },
    
    // Féculents
    { name: 'Pain burger', category: 'Boulangerie', unit: 'pièce', allergens: ['gluten'] },
    { name: 'Pommes de terre', category: 'Légumes', unit: 'kg', allergens: [] },
    { name: 'Riz basmati', category: 'Féculents', unit: 'kg', allergens: [] },
    
    // Condiments
    { name: 'Huile d\'olive', category: 'Condiments', unit: 'L', allergens: [] },
    { name: 'Sel', category: 'Condiments', unit: 'kg', allergens: [] },
    { name: 'Poivre noir', category: 'Épices', unit: 'kg', allergens: [] }
  ]);

  // Création de l'inventaire pour le restaurant chaîne
  await Inventory.bulkCreate([
    { restaurantId: chainRestaurant.id, ingredientId: ingredients[0].id, supplierId: suppliers[2].id, quantity: 50, costPerUnit: 12.50, expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { restaurantId: chainRestaurant.id, ingredientId: ingredients[1].id, supplierId: suppliers[2].id, quantity: 30, costPerUnit: 8.90, expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    { restaurantId: chainRestaurant.id, ingredientId: ingredients[3].id, supplierId: suppliers[1].id, quantity: 25, costPerUnit: 3.20, expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { restaurantId: chainRestaurant.id, ingredientId: ingredients[4].id, supplierId: suppliers[1].id, quantity: 100, costPerUnit: 0.80, expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { restaurantId: chainRestaurant.id, ingredientId: ingredients[7].id, supplierId: suppliers[0].id, quantity: 15, costPerUnit: 6.50, expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    { restaurantId: chainRestaurant.id, ingredientId: ingredients[10].id, supplierId: suppliers[0].id, quantity: 200, costPerUnit: 0.45, expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) }
  ]);

  // Création de l'inventaire pour le restaurant gastronomique
  await Inventory.bulkCreate([
    { restaurantId: gastronomyRestaurant.id, ingredientId: ingredients[2].id, supplierId: suppliers[1].id, quantity: 8, costPerUnit: 28.50, expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { restaurantId: gastronomyRestaurant.id, ingredientId: ingredients[6].id, supplierId: suppliers[1].id, quantity: 5, costPerUnit: 12.80, expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
    { restaurantId: gastronomyRestaurant.id, ingredientId: ingredients[8].id, supplierId: suppliers[0].id, quantity: 3, costPerUnit: 4.20, expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
    { restaurantId: gastronomyRestaurant.id, ingredientId: ingredients[13].id, supplierId: suppliers[1].id, quantity: 2, costPerUnit: 15.90, expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
  ]);

  // Création des recettes
  const burgerRecipe = await Recipe.create({
    name: 'Burger Classic',
    description: 'Notre burger signature avec bœuf haché, fromage et légumes frais',
    category: 'Plats principaux',
    portions: 1,
    preparationTime: 15,
    difficulty: 'easy',
    instructions: '1. Faire griller le pain\n2. Cuire le steak haché\n3. Assembler avec fromage, tomate, salade\n4. Servir avec frites',
    restaurantId: chainRestaurant.id
  });

  const salmonRecipe = await Recipe.create({
    name: 'Saumon aux champignons',
    description: 'Filet de saumon poêlé avec champignons de Paris et crème fraîche',
    category: 'Poissons',
    portions: 1,
    preparationTime: 25,
    difficulty: 'medium',
    instructions: '1. Préparer les champignons\n2. Poêler le saumon\n3. Préparer la sauce à la crème\n4. Dresser et servir',
    restaurantId: gastronomyRestaurant.id
  });

  // Association des ingrédients aux recettes
  await RecipeIngredient.bulkCreate([
    // Burger Classic
    { recipeId: burgerRecipe.id, ingredientId: ingredients[0].id, quantity: 0.15, notes: 'Steak 150g' },
    { recipeId: burgerRecipe.id, ingredientId: ingredients[10].id, quantity: 1, notes: 'Pain burger' },
    { recipeId: burgerRecipe.id, ingredientId: ingredients[7].id, quantity: 0.03, notes: 'Tranche de fromage' },
    { recipeId: burgerRecipe.id, ingredientId: ingredients[3].id, quantity: 0.05, notes: 'Rondelles de tomate' },
    { recipeId: burgerRecipe.id, ingredientId: ingredients[4].id, quantity: 0.02, notes: 'Feuilles de salade' },
    
    // Saumon aux champignons
    { recipeId: salmonRecipe.id, ingredientId: ingredients[2].id, quantity: 0.18, notes: 'Filet 180g' },
    { recipeId: salmonRecipe.id, ingredientId: ingredients[6].id, quantity: 0.1, notes: 'Champignons émincés' },
    { recipeId: salmonRecipe.id, ingredientId: ingredients[8].id, quantity: 0.05, notes: 'Crème fraîche' },
    { recipeId: salmonRecipe.id, ingredientId: ingredients[9].id, quantity: 0.01, notes: 'Beurre pour la cuisson' }
  ]);

  // Association des ingrédients aux recettes (relations many-to-many)
  await burgerRecipe.addIngredients([ingredients[0], ingredients[10], ingredients[7], ingredients[3], ingredients[4]]);
  await salmonRecipe.addIngredients([ingredients[2], ingredients[6], ingredients[8], ingredients[9]]);

  console.log('✅ Données de démonstration créées');
  console.log('');
  console.log('🔑 Comptes de démonstration:');
  console.log('   Chaîne: chain@demo.com / demo123');
  console.log('   Gastro: gastro@demo.com / demo123');
  console.log('');
}

// Exécution du script
if (require.main === module) {
  initDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = { initDatabase };