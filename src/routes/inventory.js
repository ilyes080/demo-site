const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Inventory, Ingredient, Supplier, Restaurant } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les ingrédients disponibles
router.get('/ingredients', authenticateToken, async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'category', 'unit', 'allergens'],
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    res.json(ingredients);
  } catch (error) {
    console.error('Get ingredients error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des ingrédients' });
  }
});

// Créer un nouvel ingrédient personnalisé
router.post('/ingredients', [
  authenticateToken,
  body('name').trim().isLength({ min: 1 }).withMessage('Le nom est requis'),
  body('category').trim().isLength({ min: 1 }).withMessage('La catégorie est requise'),
  body('unit').trim().isLength({ min: 1 }).withMessage('L\'unité est requise'),
  body('allergens').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category, unit, allergens = [] } = req.body;

    // Vérifier si l'ingrédient existe déjà
    const existingIngredient = await Ingredient.findOne({
      where: { 
        name: { [Op.iLike]: name.trim() },
        category: category.trim()
      }
    });

    if (existingIngredient) {
      return res.status(409).json({ 
        error: 'Un ingrédient avec ce nom existe déjà dans cette catégorie' 
      });
    }

    const ingredient = await Ingredient.create({
      name: name.trim(),
      category: category.trim(),
      unit: unit.trim(),
      allergens: allergens.filter(a => a && a.trim()),
      isActive: true,
      isCustom: true
    });

    res.status(201).json({
      message: 'Ingrédient créé avec succès',
      data: ingredient
    });
  } catch (error) {
    console.error('Create ingredient error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'ingrédient' });
  }
});

// Lister l'inventaire d'un restaurant
router.get('/:restaurantId', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category, lowStock, expiring } = req.query;

    let whereClause = { restaurantId };
    
    if (lowStock === 'true') {
      whereClause.quantity = { [Op.lt]: 10 };
    }
    
    if (expiring === 'true') {
      whereClause.expiryDate = {
        [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      };
    }

    let ingredientWhere = {};
    if (category) {
      ingredientWhere.category = category;
    }

    const inventory = await Inventory.findAll({
      where: whereClause,
      include: [
        { 
          model: Ingredient, 
          where: ingredientWhere,
          attributes: ['name', 'category', 'unit', 'allergens'] 
        },
        { 
          model: Supplier, 
          attributes: ['name', 'contact'] 
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Calculer les statistiques
    const stats = {
      totalItems: inventory.length,
      totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0),
      lowStockCount: inventory.filter(item => item.quantity < 10).length,
      expiringCount: inventory.filter(item => {
        if (!item.expiryDate) return false;
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return new Date(item.expiryDate) <= weekFromNow;
      }).length
    };

    res.json({
      inventory: inventory.map(item => ({
        id: item.id,
        ingredient: item.Ingredient.name,
        category: item.Ingredient.category,
        unit: item.Ingredient.unit,
        quantity: item.quantity,
        costPerUnit: item.costPerUnit,
        totalValue: (item.quantity * item.costPerUnit).toFixed(2),
        expiryDate: item.expiryDate,
        batchNumber: item.batchNumber,
        supplier: item.Supplier?.name,
        allergens: item.Ingredient.allergens,
        updatedAt: item.updatedAt
      })),
      stats
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'inventaire' });
  }
});

// Ajouter un élément à l'inventaire
router.post('/:restaurantId', [
  authenticateToken,
  body('ingredientId').isUUID(),
  body('supplierId').optional().isUUID(),
  body('quantity').isFloat({ min: 0 }),
  body('costPerUnit').isFloat({ min: 0 }),
  body('expiryDate').optional().isISO8601(),
  body('batchNumber').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId } = req.params;
    const { ingredientId, supplierId, quantity, costPerUnit, expiryDate, batchNumber } = req.body;

    // Vérifier que le restaurant existe
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant non trouvé' });
    }

    // Vérifier que l'ingrédient existe
    const ingredient = await Ingredient.findByPk(ingredientId);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingrédient non trouvé' });
    }

    const inventoryItem = await Inventory.create({
      restaurantId,
      ingredientId,
      supplierId,
      quantity,
      costPerUnit,
      expiryDate: expiryDate || null,
      batchNumber
    });

    const itemWithDetails = await Inventory.findByPk(inventoryItem.id, {
      include: [
        { model: Ingredient, attributes: ['name', 'category', 'unit'] },
        { model: Supplier, attributes: ['name'] }
      ]
    });

    res.status(201).json({
      message: 'Élément ajouté à l\'inventaire avec succès',
      item: itemWithDetails
    });
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout à l\'inventaire' });
  }
});

// Mettre à jour un élément de l'inventaire
router.put('/:restaurantId/:itemId', [
  authenticateToken,
  body('quantity').optional().isFloat({ min: 0 }),
  body('costPerUnit').optional().isFloat({ min: 0 }),
  body('expiryDate').optional().isISO8601(),
  body('batchNumber').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId, itemId } = req.params;

    const inventoryItem = await Inventory.findOne({
      where: { id: itemId, restaurantId }
    });

    if (!inventoryItem) {
      return res.status(404).json({ error: 'Élément d\'inventaire non trouvé' });
    }

    await inventoryItem.update(req.body);

    const updatedItem = await Inventory.findByPk(inventoryItem.id, {
      include: [
        { model: Ingredient, attributes: ['name', 'category', 'unit'] },
        { model: Supplier, attributes: ['name'] }
      ]
    });

    res.json({
      message: 'Inventaire mis à jour avec succès',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'inventaire' });
  }
});

// Supprimer un élément de l'inventaire
router.delete('/:restaurantId/:itemId', authenticateToken, async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;

    const inventoryItem = await Inventory.findOne({
      where: { id: itemId, restaurantId }
    });

    if (!inventoryItem) {
      return res.status(404).json({ error: 'Élément d\'inventaire non trouvé' });
    }

    await inventoryItem.destroy();
    res.json({ message: 'Élément supprimé de l\'inventaire avec succès' });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'inventaire' });
  }
});

// Obtenir les catégories d'ingrédients
router.get('/:restaurantId/categories', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const categories = await Ingredient.findAll({
      include: [{
        model: Inventory,
        where: { restaurantId },
        attributes: []
      }],
      attributes: ['category'],
      group: ['category'],
      raw: true
    });

    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
});

// Consommer des ingrédients de l'inventaire (pour les commandes)
router.put('/consume', [
  authenticateToken,
  body('ingredientId').notEmpty().withMessage('ID ingrédient requis'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantité invalide'),
  body('unit').notEmpty().withMessage('Unité requise'),
  body('orderId').optional().trim(),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ingredientId, quantity, unit, orderId, reason } = req.body;
    const restaurantId = req.user.restaurantId;

    // Trouver l'élément d'inventaire correspondant
    const inventoryItem = await Inventory.findOne({
      where: { 
        ingredientId: ingredientId,
        restaurantId: restaurantId 
      },
      include: [{ model: Ingredient, attributes: ['name', 'unit'] }]
    });

    if (!inventoryItem) {
      return res.status(404).json({ 
        error: 'Ingrédient non trouvé dans l\'inventaire',
        ingredientId,
        restaurantId 
      });
    }

    // Convertir les unités si nécessaire
    let quantityToConsume = quantity;
    const inventoryUnit = inventoryItem.Ingredient.unit;
    
    // Conversion simple des unités (g/kg, ml/cl/l)
    if (unit !== inventoryUnit) {
      if (unit === 'g' && inventoryUnit === 'kg') {
        quantityToConsume = quantity / 1000;
      } else if (unit === 'kg' && inventoryUnit === 'g') {
        quantityToConsume = quantity * 1000;
      } else if (unit === 'ml' && inventoryUnit === 'l') {
        quantityToConsume = quantity / 1000;
      } else if (unit === 'cl' && inventoryUnit === 'l') {
        quantityToConsume = quantity / 100;
      } else if (unit === 'l' && inventoryUnit === 'ml') {
        quantityToConsume = quantity * 1000;
      } else if (unit === 'l' && inventoryUnit === 'cl') {
        quantityToConsume = quantity * 100;
      }
    }

    // Vérifier si on a assez de stock
    if (inventoryItem.quantity < quantityToConsume) {
      return res.status(400).json({ 
        error: 'Stock insuffisant',
        available: inventoryItem.quantity,
        requested: quantityToConsume,
        unit: inventoryUnit,
        ingredient: inventoryItem.Ingredient.name
      });
    }

    // Mettre à jour la quantité
    const newQuantity = Math.max(0, inventoryItem.quantity - quantityToConsume);
    await inventoryItem.update({ 
      quantity: newQuantity,
      lastUpdated: new Date()
    });

    // Log de l'opération
    console.log(`Inventaire consommé: ${inventoryItem.Ingredient.name} -${quantityToConsume}${inventoryUnit} (${reason || orderId || 'Commande'})`);

    res.json({
      message: 'Inventaire mis à jour avec succès',
      ingredient: inventoryItem.Ingredient.name,
      consumed: quantityToConsume,
      unit: inventoryUnit,
      remaining: newQuantity,
      orderId,
      reason
    });

  } catch (error) {
    console.error('Consume inventory error:', error);
    res.status(500).json({ error: 'Erreur lors de la consommation de l\'inventaire' });
  }
});

module.exports = router;