// Calculateur de pertes pour ingrédients périmés
export class LossCalculator {
  constructor() {
    this.lossHistory = JSON.parse(localStorage.getItem('lossHistory') || '[]');
  }

  // Calculer les pertes d'un ingrédient périmé
  calculateIngredientLoss(ingredient) {
    const currentStock = ingredient.currentStock || 0;
    const unitPrice = ingredient.unitPrice || 0;
    const expiryDate = new Date(ingredient.expiryDate);
    const today = new Date();
    
    // Si l'ingrédient est périmé
    if (expiryDate < today) {
      const totalLoss = currentStock * unitPrice;
      
      const loss = {
        id: Date.now(),
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        quantity: currentStock,
        unit: ingredient.unit,
        unitPrice: unitPrice,
        totalLoss: totalLoss,
        expiryDate: ingredient.expiryDate,
        lossDate: today.toISOString(),
        reason: 'Expiration',
        category: ingredient.category || 'Non catégorisé'
      };
      
      return loss;
    }
    
    return null;
  }

  // Enregistrer une perte
  recordLoss(loss) {
    this.lossHistory.push(loss);
    this.saveLossHistory();
    
    // Mettre à jour les métriques financières
    this.updateFinancialMetrics(loss);
  }

  // Calculer les pertes pour tous les ingrédients
  calculateAllLosses(inventory) {
    const losses = [];
    const today = new Date();
    
    inventory.forEach(ingredient => {
      const expiryDate = new Date(ingredient.expiryDate);
      
      // Vérifier si l'ingrédient est périmé
      if (expiryDate < today && ingredient.currentStock > 0) {
        const loss = this.calculateIngredientLoss(ingredient);
        if (loss) {
          losses.push(loss);
        }
      }
    });
    
    return losses;
  }

  // Calculer les pertes par période
  getLossesByPeriod(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.lossHistory.filter(loss => 
      new Date(loss.lossDate) >= cutoffDate
    );
  }

  // Calculer le total des pertes
  getTotalLosses(days = 30) {
    const losses = this.getLossesByPeriod(days);
    return losses.reduce((total, loss) => total + loss.totalLoss, 0);
  }

  // Calculer les pertes par catégorie
  getLossesByCategory(days = 30) {
    const losses = this.getLossesByPeriod(days);
    const categories = {};
    
    losses.forEach(loss => {
      if (!categories[loss.category]) {
        categories[loss.category] = {
          category: loss.category,
          totalLoss: 0,
          itemCount: 0,
          items: []
        };
      }
      
      categories[loss.category].totalLoss += loss.totalLoss;
      categories[loss.category].itemCount += 1;
      categories[loss.category].items.push(loss);
    });
    
    return Object.values(categories);
  }

  // Mettre à jour les métriques financières
  updateFinancialMetrics(loss) {
    const currentMetrics = JSON.parse(localStorage.getItem('financialMetrics') || '{}');
    
    // Déduire la perte du chiffre d'affaires
    currentMetrics.totalRevenue = (currentMetrics.totalRevenue || 125000) - loss.totalLoss;
    currentMetrics.totalLosses = (currentMetrics.totalLosses || 0) + loss.totalLoss;
    currentMetrics.lossPercentage = ((currentMetrics.totalLosses / (currentMetrics.totalRevenue + currentMetrics.totalLosses)) * 100).toFixed(2);
    
    // Calculer l'impact sur la marge
    const originalMargin = currentMetrics.grossMargin || 65;
    const lossImpact = (loss.totalLoss / currentMetrics.totalRevenue) * 100;
    currentMetrics.grossMargin = Math.max(0, originalMargin - lossImpact);
    
    localStorage.setItem('financialMetrics', JSON.stringify(currentMetrics));
  }

  // Obtenir les métriques financières actuelles
  getFinancialMetrics() {
    return JSON.parse(localStorage.getItem('financialMetrics') || '{}');
  }

  // Générer des alertes pour les ingrédients proches de l'expiration
  generateExpiryAlerts(inventory, daysThreshold = 3) {
    const alerts = [];
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);
    
    inventory.forEach(ingredient => {
      const expiryDate = new Date(ingredient.expiryDate);
      
      if (expiryDate <= thresholdDate && expiryDate > today && ingredient.currentStock > 0) {
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        const potentialLoss = ingredient.currentStock * ingredient.unitPrice;
        
        alerts.push({
          id: ingredient.id,
          name: ingredient.name,
          daysUntilExpiry,
          currentStock: ingredient.currentStock,
          unit: ingredient.unit,
          potentialLoss,
          priority: daysUntilExpiry <= 1 ? 'high' : daysUntilExpiry <= 2 ? 'medium' : 'low',
          expiryDate: ingredient.expiryDate
        });
      }
    });
    
    return alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  // Marquer un ingrédient comme périmé et calculer la perte
  markAsExpired(ingredient) {
    const loss = this.calculateIngredientLoss(ingredient);
    if (loss) {
      this.recordLoss(loss);
      
      // Mettre à jour le stock à 0
      ingredient.currentStock = 0;
      ingredient.status = 'expired';
      
      return loss;
    }
    return null;
  }

  // Sauvegarder l'historique des pertes
  saveLossHistory() {
    localStorage.setItem('lossHistory', JSON.stringify(this.lossHistory));
  }

  // Obtenir les statistiques de pertes
  getLossStatistics(days = 30) {
    const losses = this.getLossesByPeriod(days);
    const totalLoss = this.getTotalLosses(days);
    const categoriesLoss = this.getLossesByCategory(days);
    
    return {
      totalLoss,
      lossCount: losses.length,
      averageLossPerItem: losses.length > 0 ? totalLoss / losses.length : 0,
      categoriesLoss,
      period: days,
      lossPercentage: this.getFinancialMetrics().lossPercentage || 0
    };
  }

  // Réinitialiser les données de pertes
  resetLossData() {
    this.lossHistory = [];
    localStorage.removeItem('lossHistory');
    localStorage.removeItem('financialMetrics');
  }
}

// Instance globale
export const lossCalculator = new LossCalculator();