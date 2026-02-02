const express = require('express');
const { body, validationResult } = require('express-validator');
const { Recipe, Ingredient, RecipeIngredient, Inventory } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Lister les recettes d'un restaurant
router.get('/:restaurantId', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category, difficulty } = req.query;

    let whereClause = { restaurantId, isActive: true };
    
    if (category) whereClause.category = category;
    if (difficulty) whereClause.difficulty = difficulty;

    const recipes = await Recipe.findAll({
      where: whereClause,
      include: [{
        model: Ingredient,
        through: { 
          attributes: ['quantity', 'notes'] 
        },
        attributes: ['name', 'unit', 'category']
      }],
      order: [['name', 'ASC']]
    });

    // Calculer le coût de chaque recette
    const recipesWithCosts = await Promise.all(
      recipes.map(async (recipe) => {
        let totalCost = 0;
        let hasAllCosts = true;

        for (const ingredient of recipe.Ingredients) {
          const inventory = await Inventory.findOne({
            where: { 
              restaurantId, 
              ingredientId: ingredient.id 
            },
            order: [['updatedAt', 'DESC']]
          });

          if (inventory) {
            const quantity = ingredient.RecipeIngredient.quantity;
            totalCost += quantity * inventory.costPerUnit;
          } else {
            hasAllCosts = false;
          }
        }

        return {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          category: recipe.category,
          portions: recipe.portions,
          preparationTime: recipe.preparationTime,
          difficulty: recipe.difficulty,
          ingredientCount: recipe.Ingredients.length,
          totalCost: hasAllCosts ? totalCost.toFixed(2) : null,
          costPerPortion: hasAllCosts ? (totalCost / recipe.portions).toFixed(2) : null,
          updatedAt: recipe.updatedAt
        };
      })
    );

    res.json(recipesWithCosts);
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des recettes' });
  }
});

// Créer une nouvelle recette
router.post('/:restaurantId', [
  authenticateToken,
  body('name').trim().isLength({ min: 2 }),
  body('category').trim().isLength({ min: 2 }),
  body('portions').isInt({ min: 1 }),
  body('preparationTime').optional().isInt({ min: 1 }),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('instructions').optional().trim(),
  body('ingredients').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId } = req.params;
    const { name, description, category, portions, preparationTime, difficulty, instructions, ingredients } = req.body;

    // Créer la recette
    const recipe = await Recipe.create({
      restaurantId,
      name,
      description,
      category,
      portions,
      preparationTime,
      difficulty: difficulty || 'medium',
      instructions
    });

    // Ajouter les ingrédients
    for (const ing of ingredients) {
      await RecipeIngredient.create({
        RecipeId: recipe.id,
        IngredientId: ing.ingredientId,
        quantity: ing.quantity,
        notes: ing.notes || null
      });
    }

    // Récupérer la recette complète
    const completeRecipe = await Recipe.findByPk(recipe.id, {
      include: [{
        model: Ingredient,
        through: { attributes: ['quantity', 'notes'] },
        attributes: ['name', 'unit', 'category']
      }]
    });

    res.status(201).json({
      message: 'Recette créée avec succès',
      recipe: completeRecipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la recette' });
  }
});

// Obtenir une recette spécifique avec détails complets
router.get('/:restaurantId/:recipeId', authenticateToken, async (req, res) => {
  try {
    const { restaurantId, recipeId } = req.params;

    const recipe = await Recipe.findOne({
      where: { id: recipeId, restaurantId },
      include: [{
        model: Ingredient,
        through: { attributes: ['quantity', 'notes'] },
        attributes: ['id', 'name', 'unit', 'category', 'allergens']
      }]
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    // Calculer le coût détaillé
    let totalCost = 0;
    let hasAllCosts = true;
    const ingredientDetails = [];

    for (const ingredient of recipe.Ingredients) {
      const inventory = await Inventory.findOne({
        where: { 
          restaurantId, 
          ingredientId: ingredient.id 
        },
        order: [['updatedAt', 'DESC']]
      });

      const quantity = ingredient.RecipeIngredient.quantity;
      let cost = null;

      if (inventory) {
        cost = (quantity * inventory.costPerUnit).toFixed(2);
        totalCost += parseFloat(cost);
      } else {
        hasAllCosts = false;
      }

      ingredientDetails.push({
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
        category: ingredient.category,
        allergens: ingredient.allergens,
        quantity,
        notes: ingredient.RecipeIngredient.notes,
        costPerUnit: inventory?.costPerUnit || null,
        totalCost: cost
      });
    }

    res.json({
      ...recipe.toJSON(),
      ingredientDetails,
      costAnalysis: {
        totalCost: hasAllCosts ? totalCost.toFixed(2) : null,
        costPerPortion: hasAllCosts ? (totalCost / recipe.portions).toFixed(2) : null,
        hasAllCosts
      }
    });
  } catch (error) {
    console.error('Get recipe details error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la recette' });
  }
});

// Mettre à jour une recette
router.put('/:restaurantId/:recipeId', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 2 }),
  body('category').optional().trim().isLength({ min: 2 }),
  body('portions').optional().isInt({ min: 1 }),
  body('preparationTime').optional().isInt({ min: 1 }),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('instructions').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId, recipeId } = req.params;

    const recipe = await Recipe.findOne({
      where: { id: recipeId, restaurantId }
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    await recipe.update(req.body);

    const updatedRecipe = await Recipe.findByPk(recipe.id, {
      include: [{
        model: Ingredient,
        through: { attributes: ['quantity', 'notes'] },
        attributes: ['name', 'unit', 'category']
      }]
    });

    res.json({
      message: 'Recette mise à jour avec succès',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la recette' });
  }
});

// Supprimer une recette (soft delete)
router.delete('/:restaurantId/:recipeId', authenticateToken, async (req, res) => {
  try {
    const { restaurantId, recipeId } = req.params;

    const recipe = await Recipe.findOne({
      where: { id: recipeId, restaurantId }
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    await recipe.update({ isActive: false });
    res.json({ message: 'Recette supprimée avec succès' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la recette' });
  }
});

// Obtenir les catégories de recettes
router.get('/:restaurantId/categories', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const categories = await Recipe.findAll({
      where: { restaurantId, isActive: true },
      attributes: ['category'],
      group: ['category'],
      raw: true
    });

    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Get recipe categories error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
});

module.exports = router;