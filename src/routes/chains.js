const express = require('express');
const { body, validationResult } = require('express-validator');
const { ChainGroup, Restaurant, Recipe, Inventory } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Lister toutes les chaînes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const chains = await ChainGroup.findAll({
      include: [{
        model: Restaurant,
        attributes: ['id', 'name', 'address']
      }],
      order: [['name', 'ASC']]
    });

    const chainsWithStats = await Promise.all(
      chains.map(async (chain) => {
        const restaurantCount = chain.Restaurants.length;
        const totalRecipes = await Recipe.count({
          include: [{
            model: Restaurant,
            where: { chainGroupId: chain.id }
          }]
        });

        return {
          id: chain.id,
          name: chain.name,
          description: chain.description,
          restaurantCount,
          totalRecipes,
          restaurants: chain.Restaurants
        };
      })
    );

    res.json(chainsWithStats);
  } catch (error) {
    console.error('Get chains error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des chaînes' });
  }
});

// Créer une nouvelle chaîne
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'manager']),
  body('name').trim().isLength({ min: 2 }),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, settings = {} } = req.body;

    const chain = await ChainGroup.create({
      name,
      description,
      settings
    });

    res.status(201).json({
      message: 'Chaîne créée avec succès',
      chain
    });
  } catch (error) {
    console.error('Create chain error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la chaîne' });
  }
});

// Obtenir les détails d'une chaîne
router.get('/:chainId', authenticateToken, async (req, res) => {
  try {
    const { chainId } = req.params;

    const chain = await ChainGroup.findByPk(chainId, {
      include: [{
        model: Restaurant,
        attributes: ['id', 'name', 'address', 'phone', 'email']
      }]
    });

    if (!chain) {
      return res.status(404).json({ error: 'Chaîne non trouvée' });
    }

    // Statistiques détaillées par restaurant
    const restaurantStats = await Promise.all(
      chain.Restaurants.map(async (restaurant) => {
        const [recipeCount, inventoryValue, inventoryCount] = await Promise.all([
          Recipe.count({ where: { restaurantId: restaurant.id, isActive: true } }),
          Inventory.sum('costPerUnit', { where: { restaurantId: restaurant.id } }) || 0,
          Inventory.count({ where: { restaurantId: restaurant.id } })
        ]);

        return {
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
          email: restaurant.email,
          stats: {
            recipeCount,
            inventoryValue: parseFloat(inventoryValue).toFixed(2),
            inventoryCount
          }
        };
      })
    );

    res.json({
      id: chain.id,
      name: chain.name,
      description: chain.description,
      settings: chain.settings,
      restaurants: restaurantStats,
      totalStats: {
        restaurantCount: chain.Restaurants.length,
        totalRecipes: restaurantStats.reduce((sum, r) => sum + r.stats.recipeCount, 0),
        totalInventoryValue: restaurantStats.reduce((sum, r) => sum + parseFloat(r.stats.inventoryValue), 0).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get chain details error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails de la chaîne' });
  }
});

// Performance comparative entre restaurants d'une chaîne
router.get('/:chainId/performance', authenticateToken, async (req, res) => {
  try {
    const { chainId } = req.params;
    const { metric = 'inventory', period = '30' } = req.query;

    const chain = await ChainGroup.findByPk(chainId, {
      include: [{ model: Restaurant, attributes: ['id', 'name'] }]
    });

    if (!chain) {
      return res.status(404).json({ error: 'Chaîne non trouvée' });
    }

    const performanceData = await Promise.all(
      chain.Restaurants.map(async (restaurant) => {
        let value = 0;
        
        switch (metric) {
          case 'inventory':
            value = await Inventory.sum('costPerUnit', { 
              where: { restaurantId: restaurant.id } 
            }) || 0;
            break;
          case 'recipes':
            value = await Recipe.count({ 
              where: { restaurantId: restaurant.id, isActive: true } 
            });
            break;
          case 'items':
            value = await Inventory.count({ 
              where: { restaurantId: restaurant.id } 
            });
            break;
        }

        return {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          value: parseFloat(value).toFixed(2),
          metric
        };
      })
    );

    // Calculer les moyennes et classements
    const values = performanceData.map(p => parseFloat(p.value));
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    const rankedData = performanceData
      .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        percentageOfBest: max > 0 ? ((parseFloat(item.value) / max) * 100).toFixed(1) : 0
      }));

    res.json({
      chainId,
      chainName: chain.name,
      metric,
      period,
      performance: rankedData,
      summary: {
        average: average.toFixed(2),
        max: max.toFixed(2),
        min: min.toFixed(2),
        restaurantCount: chain.Restaurants.length
      }
    });
  } catch (error) {
    console.error('Get chain performance error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des performances' });
  }
});

// Générer un rapport consolidé pour la chaîne
router.get('/:chainId/consolidated-report', authenticateToken, async (req, res) => {
  try {
    const { chainId } = req.params;

    const chain = await ChainGroup.findByPk(chainId, {
      include: [{ model: Restaurant, attributes: ['id', 'name', 'address'] }]
    });

    if (!chain) {
      return res.status(404).json({ error: 'Chaîne non trouvée' });
    }

    // Données de démonstration pour le rapport consolidé
    const reportData = {
      chainInfo: {
        id: chain.id,
        name: chain.name,
        description: chain.description,
        totalSites: chain.Restaurants.length
      },
      kpis: {
        totalSites: chain.Restaurants.length,
        totalRevenue: 125000,
        averageScore: 85,
        compliance: 95,
        growth: 12
      },
      sitePerformance: [
        { site: 'Paris Centre', revenue: 75000, score: 92, status: 'Excellent' },
        { site: 'Lyon Part-Dieu', revenue: 54000, score: 88, status: 'Très Bon' },
        { site: 'Toulouse Centre', revenue: 45000, score: 85, status: 'Bon' },
        { site: 'Nice Promenade', revenue: 33000, score: 82, status: 'Moyen' },
        { site: 'Marseille V.Port', revenue: 36000, score: 78, status: 'À Améliorer' }
      ],
      recommendations: [
        'Améliorer les performances du site de Marseille (score 78%)',
        'Optimiser les processus pour atteindre 98% de conformité',
        'Capitaliser sur le succès du site de Paris pour les autres',
        'Former les équipes sur les standards de qualité',
        'Mettre en place un suivi hebdomadaire des KPIs'
      ],
      generatedAt: new Date().toISOString()
    };

    res.json(reportData);
  } catch (error) {
    console.error('Generate consolidated report error:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du rapport consolidé' });
  }
});

// Obtenir les données du dashboard pour les chaînes
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Données de démonstration pour le dashboard des chaînes
    const dashboardData = {
      sites: [
        { id: 1, name: 'Paris Centre', location: 'Paris', dailyRevenue: '2,450', score: 92 },
        { id: 2, name: 'Lyon Part-Dieu', location: 'Lyon', dailyRevenue: '1,800', score: 88 },
        { id: 3, name: 'Toulouse Centre', location: 'Toulouse', dailyRevenue: '1,500', score: 85 },
        { id: 4, name: 'Nice Promenade', location: 'Nice', dailyRevenue: '1,100', score: 82 },
        { id: 5, name: 'Marseille V.Port', location: 'Marseille', dailyRevenue: '1,200', score: 78 }
      ],
      performance: {
        totalRevenue: 125000,
        avgScore: 85,
        compliance: 95,
        growth: 12
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Get chain dashboard error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du dashboard' });
  }
});

// Standardiser une recette pour toute la chaîne
router.post('/:chainId/standardize-recipe', [
  authenticateToken,
  requireRole(['admin', 'manager']),
  body('recipeId').isUUID(),
  body('sourceRestaurantId').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chainId } = req.params;
    const { recipeId, sourceRestaurantId } = req.body;

    // Vérifier que la chaîne existe
    const chain = await ChainGroup.findByPk(chainId, {
      include: [{ model: Restaurant }]
    });

    if (!chain) {
      return res.status(404).json({ error: 'Chaîne non trouvée' });
    }

    // Récupérer la recette source
    const sourceRecipe = await Recipe.findOne({
      where: { id: recipeId, restaurantId: sourceRestaurantId },
      include: [{ model: Ingredient, through: { attributes: ['quantity', 'notes'] } }]
    });

    if (!sourceRecipe) {
      return res.status(404).json({ error: 'Recette source non trouvée' });
    }

    // Dupliquer la recette pour tous les autres restaurants de la chaîne
    const results = [];
    for (const restaurant of chain.Restaurants) {
      if (restaurant.id !== sourceRestaurantId) {
        // Vérifier si la recette existe déjà
        const existingRecipe = await Recipe.findOne({
          where: { 
            restaurantId: restaurant.id, 
            name: sourceRecipe.name 
          }
        });

        if (!existingRecipe) {
          // Créer la nouvelle recette
          const newRecipe = await Recipe.create({
            restaurantId: restaurant.id,
            name: sourceRecipe.name,
            description: sourceRecipe.description,
            category: sourceRecipe.category,
            portions: sourceRecipe.portions,
            preparationTime: sourceRecipe.preparationTime,
            difficulty: sourceRecipe.difficulty,
            instructions: sourceRecipe.instructions
          });

          // Copier les ingrédients
          for (const ingredient of sourceRecipe.Ingredients) {
            await RecipeIngredient.create({
              RecipeId: newRecipe.id,
              IngredientId: ingredient.id,
              quantity: ingredient.RecipeIngredient.quantity,
              notes: ingredient.RecipeIngredient.notes
            });
          }

          results.push({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            recipeId: newRecipe.id,
            status: 'created'
          });
        } else {
          results.push({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            recipeId: existingRecipe.id,
            status: 'already_exists'
          });
        }
      }
    }

    res.json({
      message: 'Recette standardisée avec succès',
      sourceRecipe: {
        id: sourceRecipe.id,
        name: sourceRecipe.name,
        restaurantId: sourceRestaurantId
      },
      results
    });
  } catch (error) {
    console.error('Standardize recipe error:', error);
    res.status(500).json({ error: 'Erreur lors de la standardisation de la recette' });
  }
});

module.exports = router;