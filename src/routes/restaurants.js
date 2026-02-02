const express = require('express');
const { body, validationResult } = require('express-validator');
const { Restaurant, ChainGroup, User } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Lister les restaurants
router.get('/', authenticateToken, async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      include: [
        { model: ChainGroup, attributes: ['name'] },
        { model: User, attributes: ['firstName', 'lastName', 'email'], through: { attributes: [] } }
      ],
      order: [['name', 'ASC']]
    });

    res.json(restaurants);
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des restaurants' });
  }
});

// Créer un restaurant
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'manager']),
  body('name').trim().isLength({ min: 2 }),
  body('type').isIn(['chain', 'gastronomy', 'standard']),
  body('address').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, address, phone, email, chainGroupId } = req.body;

    const restaurant = await Restaurant.create({
      name,
      type,
      address,
      phone,
      email,
      chainGroupId: chainGroupId || null
    });

    // Associer l'utilisateur créateur au restaurant
    await restaurant.addUser(req.user.id);

    const restaurantWithDetails = await Restaurant.findByPk(restaurant.id, {
      include: [{ model: ChainGroup, attributes: ['name'] }]
    });

    res.status(201).json({
      message: 'Restaurant créé avec succès',
      restaurant: restaurantWithDetails
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du restaurant' });
  }
});

// Obtenir un restaurant spécifique
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [
        { model: ChainGroup, attributes: ['name'] },
        { model: User, attributes: ['firstName', 'lastName', 'email', 'role'], through: { attributes: [] } }
      ]
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant non trouvé' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du restaurant' });
  }
});

// Mettre à jour un restaurant
router.put('/:id', [
  authenticateToken,
  requireRole(['admin', 'manager']),
  body('name').optional().trim().isLength({ min: 2 }),
  body('type').optional().isIn(['chain', 'gastronomy', 'standard']),
  body('address').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant non trouvé' });
    }

    await restaurant.update(req.body);

    const updatedRestaurant = await Restaurant.findByPk(restaurant.id, {
      include: [{ model: ChainGroup, attributes: ['name'] }]
    });

    res.json({
      message: 'Restaurant mis à jour avec succès',
      restaurant: updatedRestaurant
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du restaurant' });
  }
});

// Supprimer un restaurant
router.delete('/:id', [
  authenticateToken,
  requireRole(['admin'])
], async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant non trouvé' });
    }

    await restaurant.destroy();
    res.json({ message: 'Restaurant supprimé avec succès' });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du restaurant' });
  }
});

module.exports = router;