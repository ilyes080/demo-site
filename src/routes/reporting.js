const express = require('express');
const router = express.Router();

// Système de reporting basé sur les vraies données saisies
let realTransactions = [];
let realOrders = [];
let realInventoryMovements = [];

// Route pour enregistrer une vraie transaction
router.post('/transactions', (req, res) => {
  try {
    const { type, amount, description, recipeId, recipeName, quantity, timestamp } = req.body;
    
    const transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type, // 'sale', 'cost', 'inventory'
      amount: parseFloat(amount),
      description,
      recipeId,
      recipeName,
      quantity: parseInt(quantity) || 1,
      timestamp: timestamp || new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };
    
    realTransactions.push(transaction);
    
    res.json({
      success: true,
      message: 'Transaction enregistrée',
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement' });
  }
});

// Route pour enregistrer une vraie commande
router.post('/orders', (req, res) => {
  try {
    const { items, total, tableNumber, customerCount, paymentMethod } = req.body;
    
    const order = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      items: items || [],
      total: parseFloat(total),
      tableNumber: parseInt(tableNumber) || null,
      customerCount: parseInt(customerCount) || 1,
      paymentMethod: paymentMethod || 'cash',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    };
    
    realOrders.push(order);
    
    // Enregistrer automatiquement les transactions de vente
    items.forEach(item => {
      const transaction = {
        id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'sale',
        amount: parseFloat(item.price) * parseInt(item.quantity),
        description: `Vente: ${item.name}`,
        recipeId: item.recipeId,
        recipeName: item.name,
        quantity: parseInt(item.quantity),
        orderId: order.id,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };
      realTransactions.push(transaction);
    });
    
    res.json({
      success: true,
      message: 'Commande enregistrée',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la commande' });
  }
});

// Route pour obtenir le vrai chiffre d'affaires
router.get('/revenue', (req, res) => {
  try {
    const { period = 'today', startDate, endDate } = req.query;
    
    let filteredTransactions = realTransactions.filter(t => t.type === 'sale');
    
    // Filtrer par période
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (period) {
      case 'today':
        filteredTransactions = filteredTransactions.filter(t => t.date === today);
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= monthAgo);
        break;
      case 'custom':
        if (startDate && endDate) {
          filteredTransactions = filteredTransactions.filter(t => 
            t.date >= startDate && t.date <= endDate
          );
        }
        break;
    }
    
    // Calculer les métriques
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalOrders = new Set(filteredTransactions.map(t => t.orderId)).size;
    const totalItems = filteredTransactions.reduce((sum, t) => sum + t.quantity, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Top recettes par chiffre d'affaires
    const recipeRevenue = {};
    filteredTransactions.forEach(t => {
      if (!recipeRevenue[t.recipeName]) {
        recipeRevenue[t.recipeName] = { revenue: 0, quantity: 0 };
      }
      recipeRevenue[t.recipeName].revenue += t.amount;
      recipeRevenue[t.recipeName].quantity += t.quantity;
    });
    
    const topRecipes = Object.entries(recipeRevenue)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Évolution par jour
    const dailyRevenue = {};
    filteredTransactions.forEach(t => {
      if (!dailyRevenue[t.date]) {
        dailyRevenue[t.date] = 0;
      }
      dailyRevenue[t.date] += t.amount;
    });
    
    // Évolution par heure (pour aujourd'hui)
    const hourlyRevenue = {};
    const todayTransactions = filteredTransactions.filter(t => t.date === today);
    todayTransactions.forEach(t => {
      const hour = new Date(t.timestamp).getHours();
      if (!hourlyRevenue[hour]) {
        hourlyRevenue[hour] = 0;
      }
      hourlyRevenue[hour] += t.amount;
    });
    
    res.json({
      success: true,
      period,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalItems,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        topRecipes,
        dailyRevenue,
        hourlyRevenue,
        transactionCount: filteredTransactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du calcul du chiffre d\'affaires' });
  }
});

// Route pour obtenir les vraies commandes
router.get('/orders', (req, res) => {
  try {
    const { limit = 50, status, date } = req.query;
    
    let filteredOrders = [...realOrders];
    
    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status);
    }
    
    if (date) {
      filteredOrders = filteredOrders.filter(o => o.date === date);
    }
    
    // Trier par date décroissante
    filteredOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Limiter les résultats
    filteredOrders = filteredOrders.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      orders: filteredOrders,
      total: realOrders.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
  }
});

// Route pour obtenir les statistiques avancées
router.get('/analytics', (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Transactions d'aujourd'hui et d'hier
    const todayTransactions = realTransactions.filter(t => t.date === today && t.type === 'sale');
    const yesterdayTransactions = realTransactions.filter(t => t.date === yesterday && t.type === 'sale');
    
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const yesterdayRevenue = yesterdayTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const revenueTrend = yesterdayRevenue > 0 ? 
      ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
    
    // Commandes d'aujourd'hui et d'hier
    const todayOrders = realOrders.filter(o => o.date === today);
    const yesterdayOrders = realOrders.filter(o => o.date === yesterday);
    
    const ordersTrend = yesterdayOrders.length > 0 ? 
      ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100 : 0;
    
    // Analyse des créneaux horaires
    const peakHours = {};
    todayTransactions.forEach(t => {
      const hour = new Date(t.timestamp).getHours();
      if (!peakHours[hour]) {
        peakHours[hour] = { revenue: 0, orders: 0 };
      }
      peakHours[hour].revenue += t.amount;
    });
    
    todayOrders.forEach(o => {
      const hour = new Date(o.timestamp).getHours();
      if (peakHours[hour]) {
        peakHours[hour].orders += 1;
      }
    });
    
    // Trouver l'heure de pointe
    const peakHour = Object.entries(peakHours)
      .sort((a, b) => b[1].revenue - a[1].revenue)[0];
    
    // Analyse des méthodes de paiement
    const paymentMethods = {};
    todayOrders.forEach(o => {
      if (!paymentMethods[o.paymentMethod]) {
        paymentMethods[o.paymentMethod] = { count: 0, revenue: 0 };
      }
      paymentMethods[o.paymentMethod].count += 1;
      paymentMethods[o.paymentMethod].revenue += o.total;
    });
    
    res.json({
      success: true,
      analytics: {
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        yesterdayRevenue: Math.round(yesterdayRevenue * 100) / 100,
        revenueTrend: Math.round(revenueTrend * 100) / 100,
        todayOrders: todayOrders.length,
        yesterdayOrders: yesterdayOrders.length,
        ordersTrend: Math.round(ordersTrend * 100) / 100,
        peakHour: peakHour ? {
          hour: parseInt(peakHour[0]),
          revenue: Math.round(peakHour[1].revenue * 100) / 100,
          orders: peakHour[1].orders
        } : null,
        paymentMethods,
        totalTransactions: realTransactions.length,
        totalRevenue: Math.round(realTransactions
          .filter(t => t.type === 'sale')
          .reduce((sum, t) => sum + t.amount, 0) * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du calcul des analytics' });
  }
});

// Route pour réinitialiser les données (utile pour les tests)
router.delete('/reset', (req, res) => {
  realTransactions = [];
  realOrders = [];
  realInventoryMovements = [];
  
  res.json({
    success: true,
    message: 'Données réinitialisées'
  });
});

// Route pour obtenir un résumé des données
router.get('/summary', (req, res) => {
  res.json({
    success: true,
    summary: {
      totalTransactions: realTransactions.length,
      totalOrders: realOrders.length,
      totalRevenue: Math.round(realTransactions
        .filter(t => t.type === 'sale')
        .reduce((sum, t) => sum + t.amount, 0) * 100) / 100,
      dataSource: 'real_user_input',
      lastUpdate: realTransactions.length > 0 ? 
        realTransactions[realTransactions.length - 1].timestamp : null
    }
  });
});

module.exports = router;