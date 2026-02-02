const express = require('express');
const router = express.Router();

// Routes pour les fonctionnalités gastronomiques
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Gastronomy dashboard' });
});

router.get('/seasonal-ingredients', (req, res) => {
  res.json({ message: 'Seasonal ingredients' });
});

router.get('/batch-tracking', (req, res) => {
  res.json({ message: 'Batch tracking' });
});

module.exports = router;