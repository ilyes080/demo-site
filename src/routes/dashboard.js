const express = require('express');
const { Op } = require('sequelize');
const { Restaurant, Inventory, Recipe, Ingredient, ChainGroup } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Dashboard principal
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'ID du restaurant requis' });
    }

    // Statistiques de base
    const [
      totalIngredients,
      totalRecipes,
      lowStockItems,
      expiringItems
    ] = await Promise.all([
      Ingredient.count({ where: { isActive: true } }),
      Recipe.count({ where: { restaurantId, isActive: true } }),
      Inventory.count({
        where: {
          restaurantId,
          quantity: { [Op.lt]: 10 } // Stock faible
        }
      }),
      Inventory.count({
        where: {
          restaurantId,
          expiryDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
          }
        }
      })
    ]);

    // Coûts récents
    const recentCosts = await Inventory.findAll({
      where: { restaurantId },
      include: [{ model: Ingredient, attributes: ['name', 'category'] }],
      order: [['updatedAt', 'DESC']],
      limit: 10,
      attributes: ['quantity', 'costPerUnit', 'updatedAt']
    });

    // Recettes populaires
    const popularRecipes = await Recipe.findAll({
      where: { restaurantId, isActive: true },
      order: [['updatedAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'category', 'portions']
    });

    res.json({
      stats: {
        totalIngredients,
        totalRecipes,
        lowStockItems,
        expiringItems
      },
      recentCosts: recentCosts.map(item => ({
        ingredient: item.Ingredient.name,
        category: item.Ingredient.category,
        quantity: item.quantity,
        cost: item.costPerUnit,
        total: (item.quantity * item.costPerUnit).toFixed(2),
        date: item.updatedAt
      })),
      popularRecipes
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement du dashboard' });
  }
});

// Dashboard chaînes
router.get('/chain/:chainId', authenticateToken, async (req, res) => {
  try {
    const { chainId } = req.params;

    // Vérifier que la chaîne existe
    const chain = await ChainGroup.findByPk(chainId);
    if (!chain) {
      return res.status(404).json({ error: 'Chaîne non trouvée' });
    }

    // Restaurants de la chaîne
    const restaurants = await Restaurant.findAll({
      where: { chainGroupId: chainId },
      attributes: ['id', 'name', 'address']
    });

    // Performance par restaurant
    const performanceData = await Promise.all(
      restaurants.map(async (restaurant) => {
        const [recipeCount, inventoryValue] = await Promise.all([
          Recipe.count({ where: { restaurantId: restaurant.id, isActive: true } }),
          Inventory.sum('costPerUnit', { where: { restaurantId: restaurant.id } }) || 0
        ]);

        return {
          restaurantId: restaurant.id,
          name: restaurant.name,
          recipeCount,
          inventoryValue: parseFloat(inventoryValue).toFixed(2)
        };
      })
    );

    res.json({
      chain: {
        id: chain.id,
        name: chain.name,
        description: chain.description
      },
      restaurants: restaurants.length,
      performance: performanceData,
      totalInventoryValue: performanceData.reduce((sum, item) => sum + parseFloat(item.inventoryValue), 0).toFixed(2)
    });
  } catch (error) {
    console.error('Chain dashboard error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement du dashboard chaîne' });
  }
});

// Analytics gastronomique
router.get('/gastronomy/:restaurantId', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Vérifier que le restaurant existe et est de type gastronomique
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant || restaurant.type !== 'gastronomy') {
      return res.status(404).json({ error: 'Restaurant gastronomique non trouvé' });
    }

    // Analyse des coûts par recette
    const recipes = await Recipe.findAll({
      where: { restaurantId, isActive: true },
      include: [{
        model: Ingredient,
        through: { attributes: ['quantity'] },
        include: [{
          model: Inventory,
          where: { restaurantId },
          required: false,
          attributes: ['costPerUnit']
        }]
      }]
    });

    // Calculer le coût par recette
    const recipeAnalysis = recipes.map(recipe => {
      let totalCost = 0;
      let hasAllCosts = true;

      recipe.Ingredients.forEach(ingredient => {
        const inventory = ingredient.Inventories[0];
        if (inventory && inventory.costPerUnit) {
          const quantity = ingredient.RecipeIngredient.quantity;
          totalCost += quantity * inventory.costPerUnit;
        } else {
          hasAllCosts = false;
        }
      });

      return {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        portions: recipe.portions,
        totalCost: hasAllCosts ? totalCost.toFixed(2) : 'N/A',
        costPerPortion: hasAllCosts ? (totalCost / recipe.portions).toFixed(2) : 'N/A',
        ingredientCount: recipe.Ingredients.length
      };
    });

    // Ingrédients premium (coût élevé)
    const premiumIngredients = await Inventory.findAll({
      where: {
        restaurantId,
        costPerUnit: { [Op.gt]: 20 } // Plus de 20€ par unité
      },
      include: [{ model: Ingredient, attributes: ['name', 'category'] }],
      order: [['costPerUnit', 'DESC']],
      limit: 10
    });

    res.json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        type: restaurant.type
      },
      recipeAnalysis: recipeAnalysis.sort((a, b) => parseFloat(b.totalCost) - parseFloat(a.totalCost)),
      premiumIngredients: premiumIngredients.map(item => ({
        name: item.Ingredient.name,
        category: item.Ingredient.category,
        costPerUnit: item.costPerUnit,
        quantity: item.quantity,
        totalValue: (item.quantity * item.costPerUnit).toFixed(2)
      })),
      averageCostPerRecipe: recipeAnalysis
        .filter(r => r.totalCost !== 'N/A')
        .reduce((sum, r, _, arr) => sum + parseFloat(r.totalCost) / arr.length, 0)
        .toFixed(2)
    });
  } catch (error) {
    console.error('Gastronomy dashboard error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement du dashboard gastronomique' });
  }
});

module.exports = router;