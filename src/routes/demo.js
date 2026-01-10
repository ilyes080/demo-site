const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Charger les données de démo
const demoDataPath = path.join(__dirname, '..', '..', 'demo-data.json');
const customIngredientsPath = path.join(__dirname, '..', '..', 'custom-ingredients.json');

let demoData = {};
let customIngredientsData = { customIngredients: [] };

if (fs.existsSync(demoDataPath)) {
  demoData = JSON.parse(fs.readFileSync(demoDataPath, 'utf8'));
}

if (fs.existsSync(customIngredientsPath)) {
  customIngredientsData = JSON.parse(fs.readFileSync(customIngredientsPath, 'utf8'));
}

// Fonction pour sauvegarder les ingrédients personnalisés
const saveCustomIngredients = () => {
  try {
    fs.writeFileSync(customIngredientsPath, JSON.stringify(customIngredientsData, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des ingrédients personnalisés:', error);
  }
};

// Route de connexion démo
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Chercher l'utilisateur dans les données de démo
    const user = demoData.demoUsers?.find(u => u.email === email);
    
    if (!user || password !== user.password) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        restaurant: user.restaurant
      }
    });
  } catch (error) {
    console.error('Erreur login démo:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour obtenir les infos utilisateur
router.get('/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    const user = demoData.demoUsers?.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        restaurant: user.restaurant
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

// Route dashboard démo
router.get('/dashboard', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    const user = demoData.demoUsers?.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Calculer les vraies données basées sur les recettes et commandes simulées
    const recipes = demoData.demoRecipes || [];
    const orders = generateRealisticOrders(recipes, user.restaurant.type);
    const dashboardStats = calculateRealDashboardStats(recipes, orders, user.restaurant.type);

    const dashboardData = {
      stats: dashboardStats.stats,
      profitability: dashboardStats.profitability,
      recentActivities: dashboardStats.recentActivities,
      orders: orders.slice(0, 10), // 10 dernières commandes
      topRecipes: dashboardStats.topRecipes,
      salesByHour: dashboardStats.salesByHour
    };

    // Données spécialisées selon le type de restaurant
    if (user.restaurant.type === 'chain') {
      dashboardData.chainData = {
        totalSites: 12,
        bestPerformer: 'Paris Centre',
        avgScore: 85,
        totalRevenue: dashboardStats.stats.revenue * 12,
        avgRevenuePerSite: dashboardStats.stats.revenue
      };
    }

    if (user.restaurant.type === 'gastronomy') {
      dashboardData.gastronomyData = {
        mostProfitable: dashboardStats.profitability.topDish,
        avgFoodCost: dashboardStats.profitability.foodCostPercentage,
        seasonalIngredients: 8,
        avgTicket: Math.round(dashboardStats.stats.revenue / dashboardStats.stats.covers),
        michelin: true
      };
    }

    res.json(dashboardData);
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(401).json({ message: 'Token invalide' });
  }
});

// Fonction pour générer des commandes réalistes basées sur les recettes
function generateRealisticOrders(recipes, restaurantType) {
  const orders = [];
  const today = new Date();
  
  // Adapter le volume selon le type de restaurant
  const baseOrdersPerHour = restaurantType === 'chain' ? 15 : restaurantType === 'gastronomy' ? 4 : 8;
  
  // Générer des commandes pour aujourd'hui
  for (let hour = 11; hour <= 22; hour++) {
    let ordersThisHour = Math.floor(Math.random() * baseOrdersPerHour) + Math.floor(baseOrdersPerHour / 2);
    
    // Pics aux heures de repas
    if (hour >= 12 && hour <= 14) ordersThisHour *= 2; // Déjeuner
    if (hour >= 19 && hour <= 21) ordersThisHour *= 1.8; // Dîner
    
    for (let i = 0; i < ordersThisHour; i++) {
      const orderTime = new Date(today);
      orderTime.setHours(hour, Math.floor(Math.random() * 60));
      
      // Sélectionner 1-3 plats selon le type de restaurant
      const numItems = restaurantType === 'gastronomy' ? 
        Math.floor(Math.random() * 2) + 2 : // 2-3 plats gastro
        Math.floor(Math.random() * 3) + 1;   // 1-3 plats autres
      
      const orderItems = [];
      let orderTotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const recipe = recipes[Math.floor(Math.random() * recipes.length)];
        if (recipe) {
          const price = calculateRecipePrice(recipe, restaurantType);
          const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 portions
          
          orderItems.push({
            recipeName: recipe.name,
            quantity: quantity,
            unitPrice: price,
            total: price * quantity
          });
          
          orderTotal += price * quantity;
        }
      }
      
      orders.push({
        id: `order-${Date.now()}-${Math.random()}`,
        time: orderTime,
        items: orderItems,
        total: orderTotal,
        type: 'service', // Uniquement service en salle
        tableNumber: Math.floor(Math.random() * 30) + 1,
        covers: orderItems.reduce((sum, item) => sum + item.quantity, 0)
      });
    }
  }
  
  return orders.sort((a, b) => b.time - a.time);
}

// Fonction pour calculer le prix d'une recette selon le type de restaurant
function calculateRecipePrice(recipe, restaurantType) {
  const ingredients = recipe.ingredients || recipe.Ingredients || [];
  let cost = 0;
  
  // Prix moyens des ingrédients (€/kg)
  const prices = {
    'Bœuf haché': 12.50, 'Poulet fermier': 8.50, 'Saumon frais': 28.50,
    'Tomates': 3.20, 'Oignons': 1.80, 'Fromage cheddar': 18.00,
    'Pâtes spaghetti': 2.80, 'Riz basmati': 4.50, 'Huile d\'olive': 8.50,
    'Champignons de Paris': 5.50, 'Crème fraîche': 4.50, 'Parmesan': 35.00,
    'Avocat': 6.00, 'Quinoa': 8.50, 'Épinards': 6.00
  };
  
  ingredients.forEach(ingredient => {
    const name = ingredient.name || ingredient.ingredientName;
    const quantity = parseFloat(ingredient.quantity) || 100; // 100g par défaut
    const price = prices[name] || 5.00;
    cost += (quantity / 1000) * price; // Conversion g -> kg
  });
  
  const portions = parseInt(recipe.portions) || 1;
  const costPerPortion = cost / portions;
  
  // Coefficient multiplicateur selon le type de restaurant
  let multiplier;
  switch (restaurantType) {
    case 'gastronomy':
      multiplier = 4.5; // Marge 78%
      break;
    case 'chain':
      multiplier = 3.2; // Marge 69%
      break;
    default:
      multiplier = 3.8; // Marge 74%
  }
  
  return Math.round(costPerPortion * multiplier * 100) / 100;
}

// Fonction pour calculer les vraies statistiques du dashboard
function calculateRealDashboardStats(recipes, orders, restaurantType) {
  const today = new Date();
  const todayOrders = orders.filter(order => 
    order.time.toDateString() === today.toDateString()
  );
  
  // Calcul du chiffre d'affaires réel
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const yesterdayRevenue = todayRevenue * (0.85 + Math.random() * 0.3); // Simulation hier
  const revenueTrend = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
  
  // Calcul des coûts réels basés sur les recettes
  const totalCost = todayOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => {
      const recipe = recipes.find(r => r.name === item.recipeName);
      const recipeCost = calculateRecipeCost(recipe) * item.quantity;
      return itemSum + recipeCost;
    }, 0);
  }, 0);
  
  const todayProfit = todayRevenue - totalCost;
  const avgMargin = todayRevenue > 0 ? (todayProfit / todayRevenue) * 100 : 0;
  
  // Calcul des couverts réels
  const todayCovers = todayOrders.reduce((sum, order) => sum + order.covers, 0);
  
  // Top recettes par chiffre d'affaires
  const recipeStats = {};
  todayOrders.forEach(order => {
    order.items.forEach(item => {
      if (!recipeStats[item.recipeName]) {
        recipeStats[item.recipeName] = { quantity: 0, revenue: 0 };
      }
      recipeStats[item.recipeName].quantity += item.quantity;
      recipeStats[item.recipeName].revenue += item.total;
    });
  });
  
  const topRecipes = Object.entries(recipeStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, stats]) => ({ name, ...stats }));
  
  // Ventes par heure
  const salesByHour = {};
  for (let hour = 11; hour <= 22; hour++) {
    salesByHour[hour] = todayOrders
      .filter(order => order.time.getHours() === hour)
      .reduce((sum, order) => sum + order.total, 0);
  }
  
  // Activités récentes basées sur les vraies données
  const recentActivities = [
    { message: `${todayOrders.length} commandes traitées aujourd'hui`, time: '1h' },
    { message: `"${topRecipes[0]?.name || 'Plat du jour'}" génère ${Math.round(topRecipes[0]?.revenue || 0)}€`, time: '2h' },
    { message: `${todayCovers} couverts servis`, time: '3h' },
    { message: `Marge réalisée: ${Math.round(avgMargin)}%`, time: '4h' }
  ];
  
  return {
    stats: {
      revenue: Math.round(todayRevenue),
      revenueTrend: Math.round(revenueTrend),
      profit: Math.round(todayProfit),
      profitTrend: Math.round(Math.random() * 20 - 5), // -5% à +15%
      avgMargin: Math.round(avgMargin),
      covers: todayCovers,
      coversTrend: Math.round(Math.random() * 20 - 5),
      savings: Math.round(todayProfit * 0.18), // 18% du profit en économies
      savingsTrend: Math.round(Math.random() * 25 + 5) // 5% à 30%
    },
    profitability: {
      foodCostPercentage: Math.round((totalCost / todayRevenue) * 100),
      grossMargin: Math.round(avgMargin),
      topDish: topRecipes[0]?.name || 'Plat du jour',
      topDishProfit: topRecipes[0] ? Math.round((topRecipes[0].revenue * avgMargin / 100) / topRecipes[0].quantity * 100) / 100 : 0,
      monthlySavings: Math.round(todayProfit * 30 * 0.18), // Projection mensuelle
      savingsIncrease: Math.round(Math.random() * 20 + 5),
      wastefulDish: recipes[Math.floor(Math.random() * recipes.length)]?.name || 'Salade',
      potentialSaving: Math.round(Math.random() * 300 + 100),
      revenueOpportunity: Math.round(topRecipes[0]?.revenue * 1.2 || 500)
    },
    recentActivities,
    topRecipes,
    salesByHour
  };
}

// Fonction pour calculer le coût réel d'une recette
function calculateRecipeCost(recipe) {
  if (!recipe) return 0;
  
  const ingredients = recipe.ingredients || recipe.Ingredients || [];
  let cost = 0;
  
  const prices = {
    'Bœuf haché': 12.50, 'Poulet fermier': 8.50, 'Saumon frais': 28.50,
    'Tomates': 3.20, 'Oignons': 1.80, 'Fromage cheddar': 18.00,
    'Pâtes spaghetti': 2.80, 'Riz basmati': 4.50, 'Huile d\'olive': 8.50,
    'Champignons de Paris': 5.50, 'Crème fraîche': 4.50, 'Parmesan': 35.00,
    'Avocat': 6.00, 'Quinoa': 8.50, 'Épinards': 6.00
  };
  
  ingredients.forEach(ingredient => {
    const name = ingredient.name || ingredient.ingredientName;
    const quantity = parseFloat(ingredient.quantity) || 100;
    const price = prices[name] || 5.00;
    cost += (quantity / 1000) * price;
  });
  
  const portions = parseInt(recipe.portions) || 1;
  return cost / portions;
}

// Route inventaire démo
router.get('/inventory', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    const user = demoData.demoUsers?.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Filtrer l'inventaire par restaurant avec structure complète
    const inventory = demoData.demoInventory?.filter(item => 
      item.restaurantId === user.restaurant.id
    ).map(item => ({
      ...item,
      Ingredient: item.ingredient,
      Supplier: { id: '1', name: 'Fournisseur Demo' }
    })) || [];

    res.json({ inventory });
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

// Route pour obtenir la liste des ingrédients disponibles
router.get('/inventory/ingredients', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    
    // Base complète d'ingrédients pour restaurants et fast-foods
    const ingredients = [
      // === VIANDES ===
      { id: '1', name: 'Bœuf haché', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '2', name: 'Steak de bœuf', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '3', name: 'Poulet fermier', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '4', name: 'Blanc de poulet', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '5', name: 'Cuisses de poulet', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '6', name: 'Porc échine', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '7', name: 'Bacon', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '8', name: 'Saucisses', category: 'Viandes', unit: 'kg', allergens: ['gluten'], isActive: true },
      { id: '9', name: 'Agneau gigot', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '10', name: 'Dinde', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },

      // === POISSONS & FRUITS DE MER ===
      { id: '11', name: 'Saumon frais', category: 'Poissons', unit: 'kg', allergens: ['poisson'], isActive: true },
      { id: '12', name: 'Cabillaud', category: 'Poissons', unit: 'kg', allergens: ['poisson'], isActive: true },
      { id: '13', name: 'Thon rouge', category: 'Poissons', unit: 'kg', allergens: ['poisson'], isActive: true },
      { id: '14', name: 'Crevettes', category: 'Poissons', unit: 'kg', allergens: ['crustacés'], isActive: true },
      { id: '15', name: 'Moules', category: 'Poissons', unit: 'kg', allergens: ['mollusques'], isActive: true },
      { id: '16', name: 'Sole', category: 'Poissons', unit: 'kg', allergens: ['poisson'], isActive: true },
      { id: '17', name: 'Sardines', category: 'Poissons', unit: 'kg', allergens: ['poisson'], isActive: true },

      // === LÉGUMES ===
      { id: '18', name: 'Tomates', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '19', name: 'Salade verte', category: 'Légumes', unit: 'pièce', allergens: [], isActive: true },
      { id: '20', name: 'Oignons', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '21', name: 'Oignons rouges', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '22', name: 'Champignons de Paris', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '23', name: 'Courgettes', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '24', name: 'Aubergines', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '25', name: 'Poivrons rouges', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '26', name: 'Poivrons verts', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '27', name: 'Carottes', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '28', name: 'Pommes de terre', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '29', name: 'Concombres', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '30', name: 'Avocat', category: 'Légumes', unit: 'pièce', allergens: [], isActive: true },
      { id: '31', name: 'Épinards', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '32', name: 'Brocolis', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },

      // === FÉCULENTS ===
      { id: '33', name: 'Riz basmati', category: 'Féculents', unit: 'kg', allergens: [], isActive: true },
      { id: '34', name: 'Riz blanc', category: 'Féculents', unit: 'kg', allergens: [], isActive: true },
      { id: '35', name: 'Riz complet', category: 'Féculents', unit: 'kg', allergens: [], isActive: true },
      { id: '36', name: 'Pâtes spaghetti', category: 'Féculents', unit: 'kg', allergens: ['gluten'], isActive: true },
      { id: '37', name: 'Pâtes penne', category: 'Féculents', unit: 'kg', allergens: ['gluten'], isActive: true },
      { id: '38', name: 'Pâtes fraîches', category: 'Féculents', unit: 'kg', allergens: ['gluten', 'œufs'], isActive: true },
      { id: '39', name: 'Quinoa', category: 'Féculents', unit: 'kg', allergens: [], isActive: true },
      { id: '40', name: 'Couscous', category: 'Féculents', unit: 'kg', allergens: ['gluten'], isActive: true },
      { id: '41', name: 'Boulgour', category: 'Féculents', unit: 'kg', allergens: ['gluten'], isActive: true },
      { id: '42', name: 'Lentilles', category: 'Féculents', unit: 'kg', allergens: [], isActive: true },
      { id: '43', name: 'Haricots rouges', category: 'Féculents', unit: 'kg', allergens: [], isActive: true },

      // === BOULANGERIE ===
      { id: '44', name: 'Pain burger', category: 'Boulangerie', unit: 'pièce', allergens: ['gluten'], isActive: true },
      { id: '45', name: 'Pain de mie', category: 'Boulangerie', unit: 'pièce', allergens: ['gluten'], isActive: true },
      { id: '46', name: 'Baguette', category: 'Boulangerie', unit: 'pièce', allergens: ['gluten'], isActive: true },
      { id: '47', name: 'Pain pita', category: 'Boulangerie', unit: 'pièce', allergens: ['gluten'], isActive: true },
      { id: '48', name: 'Tortillas', category: 'Boulangerie', unit: 'pièce', allergens: ['gluten'], isActive: true },
      { id: '49', name: 'Pain sans gluten', category: 'Boulangerie', unit: 'pièce', allergens: [], isActive: true },

      // === PRODUITS LAITIERS ===
      { id: '50', name: 'Fromage cheddar', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'], isActive: true },
      { id: '51', name: 'Mozzarella', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'], isActive: true },
      { id: '52', name: 'Parmesan', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'], isActive: true },
      { id: '53', name: 'Fromage de chèvre', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'], isActive: true },
      { id: '54', name: 'Crème fraîche', category: 'Produits laitiers', unit: 'L', allergens: ['lait'], isActive: true },
      { id: '55', name: 'Beurre', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'], isActive: true },
      { id: '56', name: 'Lait', category: 'Produits laitiers', unit: 'L', allergens: ['lait'], isActive: true },
      { id: '57', name: 'Yaourt nature', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'], isActive: true },

      // === CONDIMENTS & SAUCES ===
      { id: '58', name: 'Huile d\'olive', category: 'Condiments', unit: 'L', allergens: [], isActive: true },
      { id: '59', name: 'Huile de tournesol', category: 'Condiments', unit: 'L', allergens: [], isActive: true },
      { id: '60', name: 'Vinaigre balsamique', category: 'Condiments', unit: 'L', allergens: [], isActive: true },
      { id: '61', name: 'Mayonnaise', category: 'Condiments', unit: 'kg', allergens: ['œufs'], isActive: true },
      { id: '62', name: 'Ketchup', category: 'Condiments', unit: 'kg', allergens: [], isActive: true },
      { id: '63', name: 'Moutarde', category: 'Condiments', unit: 'kg', allergens: ['moutarde'], isActive: true },
      { id: '64', name: 'Sauce soja', category: 'Condiments', unit: 'L', allergens: ['soja', 'gluten'], isActive: true },
      { id: '65', name: 'Sel', category: 'Condiments', unit: 'kg', allergens: [], isActive: true },
      { id: '66', name: 'Sucre', category: 'Condiments', unit: 'kg', allergens: [], isActive: true },

      // === ÉPICES & HERBES ===
      { id: '67', name: 'Poivre noir', category: 'Épices', unit: 'kg', allergens: [], isActive: true },
      { id: '68', name: 'Paprika', category: 'Épices', unit: 'kg', allergens: [], isActive: true },
      { id: '69', name: 'Cumin', category: 'Épices', unit: 'kg', allergens: [], isActive: true },
      { id: '70', name: 'Curry', category: 'Épices', unit: 'kg', allergens: [], isActive: true },
      { id: '71', name: 'Origan', category: 'Épices', unit: 'kg', allergens: [], isActive: true },
      { id: '72', name: 'Basilic frais', category: 'Herbes', unit: 'botte', allergens: [], isActive: true },
      { id: '73', name: 'Persil', category: 'Herbes', unit: 'botte', allergens: [], isActive: true },
      { id: '74', name: 'Coriandre', category: 'Herbes', unit: 'botte', allergens: [], isActive: true },
      { id: '75', name: 'Thym', category: 'Herbes', unit: 'botte', allergens: [], isActive: true },
      { id: '76', name: 'Romarin', category: 'Herbes', unit: 'botte', allergens: [], isActive: true },

      // === FRUITS ===
      { id: '77', name: 'Citrons', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '78', name: 'Citrons verts', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '79', name: 'Pommes', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '80', name: 'Bananes', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '81', name: 'Fraises', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '82', name: 'Mangues', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '83', name: 'Ananas', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '84', name: 'Oranges', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },

      // === BOISSONS ===
      { id: '85', name: 'Eau', category: 'Boissons', unit: 'L', allergens: [], isActive: true },
      { id: '86', name: 'Coca-Cola', category: 'Boissons', unit: 'L', allergens: [], isActive: true },
      { id: '87', name: 'Jus d\'orange', category: 'Boissons', unit: 'L', allergens: [], isActive: true },
      { id: '88', name: 'Bière', category: 'Boissons', unit: 'L', allergens: ['gluten'], isActive: true },
      { id: '89', name: 'Vin rouge', category: 'Boissons', unit: 'L', allergens: ['sulfites'], isActive: true },
      { id: '90', name: 'Café', category: 'Boissons', unit: 'kg', allergens: [], isActive: true }
    ];

    // Combiner les ingrédients prédéfinis avec les ingrédients personnalisés
    const allIngredients = [...ingredients, ...customIngredientsData.customIngredients];
    
    // Organiser par catégories
    const categorizedIngredients = {};
    allIngredients.forEach(ingredient => {
      if (!categorizedIngredients[ingredient.category]) {
        categorizedIngredients[ingredient.category] = [];
      }
      categorizedIngredients[ingredient.category].push(ingredient);
    });

    // Trier les catégories et les ingrédients dans chaque catégorie
    const sortedCategories = Object.keys(categorizedIngredients).sort();
    const organizedIngredients = {};
    
    sortedCategories.forEach(category => {
      organizedIngredients[category] = categorizedIngredients[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    res.json({
      ingredients: allIngredients,
      categorized: organizedIngredients,
      categories: sortedCategories
    });
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

// Route pour créer un nouvel ingrédient
router.post('/inventory/ingredients', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  

  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    
    const { name, category, unit, allergens = [] } = req.body;
    
    if (!name || !category || !unit) {
      return res.status(400).json({ message: 'Nom, catégorie et unité sont requis' });
    }

    // Récupérer la liste des ingrédients prédéfinis (même liste que dans la route GET)
    const predefinedIngredients = [
      // === VIANDES ===
      { id: '1', name: 'Bœuf haché', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '2', name: 'Steak de bœuf', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '3', name: 'Poulet fermier', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '4', name: 'Blanc de poulet', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '5', name: 'Cuisses de poulet', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '6', name: 'Porc échine', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '7', name: 'Bacon', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '8', name: 'Saucisses', category: 'Viandes', unit: 'kg', allergens: ['gluten'], isActive: true },
      { id: '9', name: 'Agneau gigot', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      { id: '10', name: 'Dinde', category: 'Viandes', unit: 'kg', allergens: [], isActive: true },
      // === POISSONS & FRUITS DE MER ===
      { id: '11', name: 'Saumon frais', category: 'Poissons', unit: 'kg', allergens: ['poisson'], isActive: true },
      { id: '12', name: 'Cabillaud', category: 'Poissons', unit: 'kg', allergens: ['poisson'], isActive: true },
      { id: '13', name: 'Thon rouge', category: 'Poissons', unit: 'kg', allergens: ['poisson'], isActive: true },
      { id: '14', name: 'Crevettes', category: 'Poissons', unit: 'kg', allergens: ['crustacés'], isActive: true },
      { id: '15', name: 'Moules', category: 'Poissons', unit: 'kg', allergens: ['mollusques'], isActive: true },
      { id: '16', name: 'Sole', category: 'Poissons', unit: 'kg', allergens: ['poisson'], isActive: true },
      { id: '17', name: 'Sardines', category: 'Poissons', unit: 'kg', allergens: ['poisson'], isActive: true },
      // === LÉGUMES ===
      { id: '18', name: 'Tomates', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '19', name: 'Salade verte', category: 'Légumes', unit: 'pièce', allergens: [], isActive: true },
      { id: '20', name: 'Oignons', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '21', name: 'Oignons rouges', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '22', name: 'Champignons de Paris', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '23', name: 'Courgettes', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '24', name: 'Aubergines', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '25', name: 'Poivrons rouges', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '26', name: 'Poivrons verts', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '27', name: 'Carottes', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '28', name: 'Pommes de terre', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '29', name: 'Concombres', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '30', name: 'Avocat', category: 'Légumes', unit: 'pièce', allergens: [], isActive: true },
      { id: '31', name: 'Épinards', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      { id: '32', name: 'Brocolis', category: 'Légumes', unit: 'kg', allergens: [], isActive: true },
      // === FÉCULENTS ===
      { id: '33', name: 'Riz basmati', category: 'Féculents', unit: 'kg', allergens: [], isActive: true },
      { id: '34', name: 'Riz blanc', category: 'Féculents', unit: 'kg', allergens: [], isActive: true },
      { id: '35', name: 'Riz complet', category: 'Féculents', unit: 'kg', allergens: [], isActive: true },
      { id: '36', name: 'Pâtes spaghetti', category: 'Féculents', unit: 'kg', allergens: ['gluten'], isActive: true },
      { id: '37', name: 'Pâtes penne', category: 'Féculents', unit: 'kg', allergens: ['gluten'], isActive: true },
      { id: '38', name: 'Pâtes fraîches', category: 'Féculents', unit: 'kg', allergens: ['gluten', 'œufs'], isActive: true },
      { id: '39', name: 'Quinoa', category: 'Féculents', unit: 'kg', allergens: [], isActive: true },
      { id: '40', name: 'Couscous', category: 'Féculents', unit: 'kg', allergens: ['gluten'], isActive: true },
      { id: '41', name: 'Boulgour', category: 'Féculents', unit: 'kg', allergens: ['gluten'], isActive: true },
      { id: '42', name: 'Lentilles', category: 'Féculents', unit: 'kg', allergens: [], isActive: true },
      { id: '43', name: 'Haricots rouges', category: 'Féculents', unit: 'kg', allergens: [], isActive: true },
      // === BOULANGERIE ===
      { id: '44', name: 'Pain burger', category: 'Boulangerie', unit: 'pièce', allergens: ['gluten'], isActive: true },
      { id: '45', name: 'Pain de mie', category: 'Boulangerie', unit: 'pièce', allergens: ['gluten'], isActive: true },
      { id: '46', name: 'Baguette', category: 'Boulangerie', unit: 'pièce', allergens: ['gluten'], isActive: true },
      { id: '47', name: 'Pain pita', category: 'Boulangerie', unit: 'pièce', allergens: ['gluten'], isActive: true },
      { id: '48', name: 'Tortillas', category: 'Boulangerie', unit: 'pièce', allergens: ['gluten'], isActive: true },
      { id: '49', name: 'Pain sans gluten', category: 'Boulangerie', unit: 'pièce', allergens: [], isActive: true },
      // === PRODUITS LAITIERS ===
      { id: '50', name: 'Fromage cheddar', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'], isActive: true },
      { id: '51', name: 'Mozzarella', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'], isActive: true },
      { id: '52', name: 'Parmesan', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'], isActive: true },
      { id: '53', name: 'Fromage de chèvre', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'], isActive: true },
      { id: '54', name: 'Crème fraîche', category: 'Produits laitiers', unit: 'L', allergens: ['lait'], isActive: true },
      { id: '55', name: 'Beurre', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'], isActive: true },
      { id: '56', name: 'Lait', category: 'Produits laitiers', unit: 'L', allergens: ['lait'], isActive: true },
      { id: '57', name: 'Yaourt nature', category: 'Produits laitiers', unit: 'kg', allergens: ['lait'], isActive: true },
      // === CONDIMENTS & SAUCES ===
      { id: '58', name: 'Huile d\'olive', category: 'Condiments', unit: 'L', allergens: [], isActive: true },
      { id: '59', name: 'Huile de tournesol', category: 'Condiments', unit: 'L', allergens: [], isActive: true },
      { id: '60', name: 'Vinaigre balsamique', category: 'Condiments', unit: 'L', allergens: [], isActive: true },
      { id: '61', name: 'Mayonnaise', category: 'Condiments', unit: 'kg', allergens: ['œufs'], isActive: true },
      { id: '62', name: 'Ketchup', category: 'Condiments', unit: 'kg', allergens: [], isActive: true },
      { id: '63', name: 'Moutarde', category: 'Condiments', unit: 'kg', allergens: ['moutarde'], isActive: true },
      { id: '64', name: 'Sauce soja', category: 'Condiments', unit: 'L', allergens: ['soja', 'gluten'], isActive: true },
      { id: '65', name: 'Sel', category: 'Condiments', unit: 'kg', allergens: [], isActive: true },
      { id: '66', name: 'Sucre', category: 'Condiments', unit: 'kg', allergens: [], isActive: true },
      // === ÉPICES & HERBES ===
      { id: '67', name: 'Poivre noir', category: 'Épices', unit: 'kg', allergens: [], isActive: true },
      { id: '68', name: 'Paprika', category: 'Épices', unit: 'kg', allergens: [], isActive: true },
      { id: '69', name: 'Cumin', category: 'Épices', unit: 'kg', allergens: [], isActive: true },
      { id: '70', name: 'Curry', category: 'Épices', unit: 'kg', allergens: [], isActive: true },
      { id: '71', name: 'Origan', category: 'Épices', unit: 'kg', allergens: [], isActive: true },
      { id: '72', name: 'Basilic frais', category: 'Herbes', unit: 'botte', allergens: [], isActive: true },
      { id: '73', name: 'Persil', category: 'Herbes', unit: 'botte', allergens: [], isActive: true },
      { id: '74', name: 'Coriandre', category: 'Herbes', unit: 'botte', allergens: [], isActive: true },
      { id: '75', name: 'Thym', category: 'Herbes', unit: 'botte', allergens: [], isActive: true },
      { id: '76', name: 'Romarin', category: 'Herbes', unit: 'botte', allergens: [], isActive: true },
      // === FRUITS ===
      { id: '77', name: 'Citrons', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '78', name: 'Citrons verts', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '79', name: 'Pommes', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '80', name: 'Bananes', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '81', name: 'Fraises', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '82', name: 'Mangues', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '83', name: 'Ananas', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      { id: '84', name: 'Oranges', category: 'Fruits', unit: 'kg', allergens: [], isActive: true },
      // === BOISSONS ===
      { id: '85', name: 'Eau', category: 'Boissons', unit: 'L', allergens: [], isActive: true },
      { id: '86', name: 'Coca-Cola', category: 'Boissons', unit: 'L', allergens: [], isActive: true },
      { id: '87', name: 'Jus d\'orange', category: 'Boissons', unit: 'L', allergens: [], isActive: true },
      { id: '88', name: 'Bière', category: 'Boissons', unit: 'L', allergens: ['gluten'], isActive: true },
      { id: '89', name: 'Vin rouge', category: 'Boissons', unit: 'L', allergens: ['sulfites'], isActive: true },
      { id: '90', name: 'Café', category: 'Boissons', unit: 'kg', allergens: [], isActive: true }
    ];

    // Vérifier si l'ingrédient existe déjà
    const allIngredients = [...predefinedIngredients, ...customIngredientsData.customIngredients];
    const existingIngredient = allIngredients.find(ing => 
      ing.name.toLowerCase() === name.trim().toLowerCase() && 
      ing.category.toLowerCase() === category.trim().toLowerCase()
    );

    if (existingIngredient) {
      return res.status(409).json({ 
        message: 'Un ingrédient avec ce nom existe déjà dans cette catégorie' 
      });
    }

    // Créer un nouvel ingrédient
    const newIngredient = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      unit: unit.trim(),
      allergens: Array.isArray(allergens) ? allergens.filter(a => a && a.trim()) : [],
      isActive: true,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    // Ajouter à la liste des ingrédients personnalisés
    customIngredientsData.customIngredients.push(newIngredient);
    
    // Sauvegarder de manière persistante
    saveCustomIngredients();

    res.status(201).json({
      success: true,
      message: 'Ingrédient créé avec succès et sauvegardé',
      data: newIngredient
    });
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

// Route pour ajouter du stock
router.post('/inventory', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    const user = demoData.demoUsers?.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    const { ingredientId, quantity, costPerUnit, expiryDate, batchNumber } = req.body;
    
    // Simuler l'ajout (en réalité, on ne sauvegarde pas en démo)
    res.status(201).json({
      success: true,
      message: 'Stock ajouté avec succès (mode démo)',
      inventory: {
        id: Date.now().toString(),
        restaurantId: user.restaurant.id,
        ingredientId,
        quantity,
        costPerUnit,
        expiryDate,
        batchNumber
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

// Route recettes démo
router.get('/recipes', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    const user = demoData.demoUsers?.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Pour la saisie de commandes, retourner TOUTES les recettes
    const { all } = req.query;
    let recipes;
    
    if (all === 'true') {
      // Retourner toutes les recettes disponibles
      recipes = demoData.demoRecipes || [];
    } else {
      // Filtrer les recettes par restaurant (comportement normal)
      recipes = demoData.demoRecipes?.filter(recipe => 
        recipe.restaurantId === user.restaurant.id
      ) || [];
    }

    res.json({ recipes });
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

// Route restaurants démo
router.get('/restaurants', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    const user = demoData.demoUsers?.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Retourner le restaurant de l'utilisateur
    res.json([{
      ...user.restaurant,
      createdAt: new Date().toISOString()
    }]);
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

// Routes spécialisées Chaînes
router.get('/chains/dashboard', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    const user = demoData.demoUsers?.find(u => u.id === decoded.userId);
    
    if (!user || user.restaurant.type !== 'chain') {
      return res.status(403).json({ message: 'Accès réservé aux chaînes' });
    }

    const chainData = {
      sites: [
        { id: '1', name: 'Paris Centre', location: 'Paris, France', manager: 'Marie Dupont', dailyRevenue: 2500, score: 92, status: 'active' },
        { id: '2', name: 'Lyon Part-Dieu', location: 'Lyon, France', manager: 'Pierre Martin', dailyRevenue: 1800, score: 88, status: 'active' },
        { id: '3', name: 'Marseille Vieux Port', location: 'Marseille, France', manager: 'Sophie Durand', dailyRevenue: 1200, score: 78, status: 'active' },
        { id: '4', name: 'Toulouse Centre', location: 'Toulouse, France', manager: 'Jean Moreau', dailyRevenue: 1500, score: 85, status: 'active' },
        { id: '5', name: 'Nice Promenade', location: 'Nice, France', manager: 'Claire Petit', dailyRevenue: 1100, score: 82, status: 'active' }
      ],
      performance: {
        totalRevenue: 125000,
        avgScore: 85,
        compliance: 95
      }
    };

    res.json(chainData);
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

// Routes spécialisées Gastronomie
router.get('/gastronomy/dashboard', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    const user = demoData.demoUsers?.find(u => u.id === decoded.userId);
    
    if (!user || user.restaurant.type !== 'gastronomy') {
      return res.status(403).json({ message: 'Accès réservé aux restaurants gastronomiques' });
    }

    const gastronomyData = {
      recipes: [
        {
          id: '1',
          name: 'Saumon aux champignons',
          costPerPortion: 12.50,
          totalCost: 12.50,
          suggestedPrice: 28.00,
          margin: 55,
          portions: 1,
          ingredients: [
            { name: 'Saumon frais', quantity: 0.18, unit: 'kg', cost: 5.13, costPerUnit: 28.50 },
            { name: 'Champignons', quantity: 0.1, unit: 'kg', cost: 1.20, costPerUnit: 12.00 },
            { name: 'Crème fraîche', quantity: 0.05, unit: 'L', cost: 0.85, costPerUnit: 17.00 },
            { name: 'Beurre', quantity: 0.01, unit: 'kg', cost: 0.27, costPerUnit: 27.00 }
          ]
        },
        {
          id: '2',
          name: 'Risotto aux truffes',
          costPerPortion: 18.20,
          totalCost: 18.20,
          suggestedPrice: 45.00,
          margin: 60,
          portions: 1,
          ingredients: [
            { name: 'Riz arborio', quantity: 0.08, unit: 'kg', cost: 0.80, costPerUnit: 10.00 },
            { name: 'Truffe noire', quantity: 0.015, unit: 'kg', cost: 15.00, costPerUnit: 1000.00 },
            { name: 'Parmesan', quantity: 0.03, unit: 'kg', cost: 1.20, costPerUnit: 40.00 },
            { name: 'Beurre', quantity: 0.02, unit: 'kg', cost: 0.54, costPerUnit: 27.00 }
          ]
        }
      ],
      seasonalIngredients: [
        { name: 'Champignons de saison', price: 8.50, discount: 15 },
        { name: 'Truffes d\'hiver', price: 950.00, discount: 5 },
        { name: 'Légumes racines', price: 4.20, discount: 20 },
        { name: 'Agrumes de saison', price: 3.80, discount: 10 }
      ],
      currentSeason: 'Hiver',
      batches: [
        {
          id: '1',
          ingredient: 'Saumon frais',
          batchNumber: 'SAU-2024-001',
          supplier: 'Poissonnerie Premium',
          receivedDate: '2024-12-10',
          expiryDate: '2024-12-16',
          certifications: ['Bio', 'Label Rouge', 'MSC'],
          usage: [
            { recipe: 'Saumon aux champignons', quantity: 1.8, unit: 'kg' },
            { recipe: 'Tartare de saumon', quantity: 0.5, unit: 'kg' }
          ]
        },
        {
          id: '2',
          ingredient: 'Truffe noire',
          batchNumber: 'TRU-2024-003',
          supplier: 'Truffes du Périgord',
          receivedDate: '2024-12-08',
          expiryDate: '2024-12-22',
          certifications: ['IGP', 'Origine France'],
          usage: [
            { recipe: 'Risotto aux truffes', quantity: 0.045, unit: 'kg' }
          ]
        }
      ],
      dishes: [
        { id: '1', name: 'Saumon aux champignons', category: 'Poissons', margin: 55, profit: 15.50 },
        { id: '2', name: 'Risotto aux truffes', category: 'Plats', margin: 60, profit: 26.80 },
        { id: '3', name: 'Foie gras poêlé', category: 'Entrées', margin: 65, profit: 22.10 },
        { id: '4', name: 'Soufflé au chocolat', category: 'Desserts', margin: 70, profit: 8.40 },
        { id: '5', name: 'Homard thermidor', category: 'Poissons', margin: 50, profit: 35.00 }
      ]
    };

    res.json(gastronomyData);
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

// Routes IA Copilot pour le mode démo
router.post('/ai-copilot/benchmark', (req, res) => {
  try {
    const { zone, cuisineType, priceRange, recipes } = req.body;

    // Données benchmark simulées pour la démo
    const benchmarkData = {
      avgPrice: 16.5,
      avgMargin: 58,
      sampleSize: 28
    };

    const recipeAnalysis = recipes.map(recipe => {
      const recipeCost = 4.5 + Math.random() * 3;
      const recipePrice = recipe.price || recipeCost * 2.8;
      const recipeMargin = ((recipePrice - recipeCost) / recipePrice) * 100;
      const priceComparison = ((recipePrice - benchmarkData.avgPrice) / benchmarkData.avgPrice) * 100;

      return {
        ...recipe,
        cost: recipeCost,
        price: recipePrice,
        margin: recipeMargin,
        benchmark: {
          avgPrice: benchmarkData.avgPrice,
          avgMargin: benchmarkData.avgMargin,
          priceComparison,
          marginComparison: recipeMargin - benchmarkData.avgMargin,
          recommendation: {
            type: priceComparison < -10 ? 'price-increase' : 'optimal',
            message: priceComparison < -10 ? 'Prix sous la moyenne' : 'Positionnement optimal',
            action: priceComparison < -10 ? 'Augmentez le prix de 10-15%' : 'Maintenez cette stratégie'
          }
        }
      };
    });

    res.json({
      success: true,
      data: {
        recipes: recipeAnalysis,
        globalStats: {
          avgPriceDifference: -8.5,
          competitiveAdvantage: 65,
          sampleSize: benchmarkData.sampleSize
        },
        benchmarkInfo: { zone, cuisineType, priceRange }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur benchmark démo' });
  }
});

router.post('/ai-copilot/dish-suggestions', (req, res) => {
  try {
    const suggestions = [
      {
        id: 'demo-1',
        name: 'Bowl Buddha Quinoa',
        category: 'healthy',
        description: 'Bowl nutritif avec quinoa, légumes de saison et sauce tahini',
        estimatedCost: 4.20,
        suggestedPrice: 14.50,
        margin: 71,
        popularity: 85,
        trend: 'rising',
        marketFit: 88,
        implementationEase: 92,
        reasons: [
          'Tendance healthy en forte croissance (+35%)',
          'Marge excellente de 71%',
          'Ingrédients disponibles en stock'
        ]
      },
      {
        id: 'demo-2',
        name: 'Tacos Végétariens',
        category: 'fusion',
        description: 'Tacos aux légumes grillés et guacamole maison',
        estimatedCost: 3.50,
        suggestedPrice: 12.00,
        margin: 71,
        popularity: 92,
        trend: 'rising',
        marketFit: 85,
        implementationEase: 95,
        reasons: [
          'Très populaire chez les jeunes',
          'Coût très bas, marge excellente',
          'Tendance végétarienne'
        ]
      }
    ];

    res.json({
      success: true,
      data: {
        suggestions,
        totalSuggestions: suggestions.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suggestions démo' });
  }
});

router.post('/ai-copilot/intelligent-alerts', (req, res) => {
  try {
    const alerts = [
      {
        id: 'demo-alert-1',
        type: 'warning',
        priority: 'high',
        title: 'Marge critique détectée',
        message: 'Salade César a une marge de seulement 28%',
        recommendation: 'Augmentez le prix de 15% ou réduisez les coûts',
        impact: '+2.50€ de bénéfice par plat',
        category: 'profitability'
      },
      {
        id: 'demo-alert-2',
        type: 'success',
        priority: 'medium',
        title: 'Opportunité saisonnière',
        message: 'Les légumes de printemps sont maintenant moins chers',
        recommendation: 'Ajoutez des plats avec asperges, petits pois',
        impact: 'Réduction des coûts de 15%',
        category: 'seasonal'
      },
      {
        id: 'demo-alert-3',
        type: 'info',
        priority: 'medium',
        title: 'Tendance marché détectée',
        message: 'La demande pour les plats végans augmente de 25%',
        recommendation: 'Développez 2-3 options véganes rentables',
        impact: '+200€/mois de CA supplémentaire',
        category: 'market-trends'
      }
    ];

    res.json({
      success: true,
      data: {
        alerts,
        totalAlerts: alerts.length,
        priorityBreakdown: {
          high: 1,
          medium: 2,
          low: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur alertes démo' });
  }
});

// Route pour réinitialiser les données de démo
router.post('/reset-data', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    
    // Réinitialiser les ingrédients personnalisés
    customIngredientsData.customIngredients = [];
    saveCustomIngredients();
    
    // Recharger les données de démo depuis le fichier
    if (fs.existsSync(demoDataPath)) {
      const originalData = JSON.parse(fs.readFileSync(demoDataPath, 'utf8'));
      demoData = { ...originalData };
    }
    
    console.log('Données de démo réinitialisées');
    
    res.json({
      success: true,
      message: 'Données réinitialisées avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation des données' });
  }
});

module.exports = router;