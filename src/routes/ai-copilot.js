const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Données de benchmark simulées (en production, cela viendrait d'une vraie base de données)
const benchmarkDatabase = {
  'paris-centre': {
    'française': {
      'économique': { avgPrice: 12.5, avgMargin: 45, sampleSize: 23 },
      'moyen': { avgPrice: 18.0, avgMargin: 58, sampleSize: 31 },
      'haut-de-gamme': { avgPrice: 28.5, avgMargin: 68, sampleSize: 18 },
      'luxe': { avgPrice: 45.0, avgMargin: 75, sampleSize: 8 }
    },
    'italienne': {
      'économique': { avgPrice: 11.0, avgMargin: 48, sampleSize: 28 },
      'moyen': { avgPrice: 16.5, avgMargin: 60, sampleSize: 35 },
      'haut-de-gamme': { avgPrice: 25.0, avgMargin: 65, sampleSize: 15 }
    },
    'asiatique': {
      'économique': { avgPrice: 10.5, avgMargin: 52, sampleSize: 42 },
      'moyen': { avgPrice: 15.0, avgMargin: 62, sampleSize: 38 },
      'haut-de-gamme': { avgPrice: 22.0, avgMargin: 68, sampleSize: 12 }
    }
  },
  'lyon': {
    'française': {
      'économique': { avgPrice: 10.5, avgMargin: 42, sampleSize: 19 },
      'moyen': { avgPrice: 15.5, avgMargin: 55, sampleSize: 26 },
      'haut-de-gamme': { avgPrice: 24.0, avgMargin: 65, sampleSize: 14 }
    }
  }
};

// Données de tendances marché
const marketTrends = {
  'healthy': { growth: 35, popularity: 88, seasonality: [70, 85, 95, 75] },
  'vegan': { growth: 40, popularity: 76, seasonality: [65, 90, 85, 70] },
  'fusion': { growth: 25, popularity: 82, seasonality: [80, 80, 80, 80] },
  'comfort': { growth: 15, popularity: 85, seasonality: [90, 70, 60, 85] }
};

// Route pour l'analyse benchmark
router.post('/benchmark', auth, async (req, res) => {
  try {
    const { zone, cuisineType, priceRange, recipes } = req.body;

    // Récupérer les données benchmark
    const benchmarkData = benchmarkDatabase[zone]?.[cuisineType]?.[priceRange];
    
    if (!benchmarkData) {
      return res.status(404).json({
        message: 'Données benchmark non disponibles pour cette combinaison',
        suggestion: 'Essayez une zone ou un type de cuisine différent'
      });
    }

    // Analyser chaque recette par rapport au benchmark
    const recipeAnalysis = recipes.map(recipe => {
      const recipeCost = calculateRecipeCost(recipe);
      const recipePrice = recipe.price || recipeCost * 2.8;
      const recipeMargin = ((recipePrice - recipeCost) / recipePrice) * 100;

      const priceComparison = ((recipePrice - benchmarkData.avgPrice) / benchmarkData.avgPrice) * 100;
      const marginComparison = recipeMargin - benchmarkData.avgMargin;

      return {
        ...recipe,
        cost: recipeCost,
        price: recipePrice,
        margin: recipeMargin,
        benchmark: {
          avgPrice: benchmarkData.avgPrice,
          avgMargin: benchmarkData.avgMargin,
          priceComparison,
          marginComparison,
          recommendation: generateBenchmarkRecommendation(priceComparison, marginComparison)
        }
      };
    });

    // Statistiques globales
    const globalStats = {
      avgPriceDifference: recipeAnalysis.reduce((sum, r) => sum + r.benchmark.priceComparison, 0) / recipeAnalysis.length,
      avgMarginDifference: recipeAnalysis.reduce((sum, r) => sum + r.benchmark.marginComparison, 0) / recipeAnalysis.length,
      competitiveAdvantage: recipeAnalysis.filter(r => r.benchmark.marginComparison > 5).length / recipeAnalysis.length * 100,
      sampleSize: benchmarkData.sampleSize
    };

    res.json({
      success: true,
      data: {
        recipes: recipeAnalysis,
        globalStats,
        benchmarkInfo: {
          zone,
          cuisineType,
          priceRange,
          sampleSize: benchmarkData.sampleSize
        },
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Erreur analyse benchmark:', error);
    res.status(500).json({ message: 'Erreur lors de l\'analyse benchmark' });
  }
});

// Route pour les suggestions de plats
router.post('/dish-suggestions', auth, async (req, res) => {
  try {
    const { ingredients, restaurantProfile, existingRecipes } = req.body;

    // Générer des suggestions basées sur les ingrédients disponibles
    const suggestions = generateDishSuggestions(ingredients, restaurantProfile, existingRecipes);

    res.json({
      success: true,
      data: {
        suggestions,
        totalSuggestions: suggestions.length,
        basedOn: {
          ingredientsCount: ingredients.length,
          profile: restaurantProfile,
          existingRecipesCount: existingRecipes.length
        },
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Erreur génération suggestions:', error);
    res.status(500).json({ message: 'Erreur lors de la génération de suggestions' });
  }
});

// Route pour les alertes intelligentes
router.post('/intelligent-alerts', auth, async (req, res) => {
  try {
    const { recipes, restaurantProfile } = req.body;

    const alerts = generateIntelligentAlerts(recipes, restaurantProfile);

    res.json({
      success: true,
      data: {
        alerts,
        totalAlerts: alerts.length,
        priorityBreakdown: {
          high: alerts.filter(a => a.priority === 'high').length,
          medium: alerts.filter(a => a.priority === 'medium').length,
          low: alerts.filter(a => a.priority === 'low').length
        },
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Erreur génération alertes:', error);
    res.status(500).json({ message: 'Erreur lors de la génération d\'alertes' });
  }
});

// Route pour l'analyse de rentabilité avancée
router.post('/profitability-analysis', auth, async (req, res) => {
  try {
    const { recipes, ingredients, restaurantProfile } = req.body;

    const analysis = performAdvancedProfitabilityAnalysis(recipes, ingredients, restaurantProfile);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Erreur analyse rentabilité:', error);
    res.status(500).json({ message: 'Erreur lors de l\'analyse de rentabilité' });
  }
});

// Fonctions utilitaires

function calculateRecipeCost(recipe) {
  // Simulation du calcul de coût (à adapter selon votre logique)
  const ingredients = recipe.ingredients || recipe.Ingredients || [];
  let totalCost = 0;

  // Prix moyens simplifiés
  const prices = {
    'Bœuf haché': 12.50, 'Poulet fermier': 8.50, 'Saumon frais': 28.50,
    'Tomates': 3.20, 'Oignons': 1.80, 'Fromage cheddar': 18.00,
    'Pâtes spaghetti': 2.80, 'Riz basmati': 4.50, 'Huile d\'olive': 8.50
  };

  ingredients.forEach(ingredient => {
    const name = ingredient.name || ingredient.ingredientName;
    const quantity = parseFloat(ingredient.quantity) || 0;
    const price = prices[name] || 5.00;
    totalCost += (quantity / 1000) * price; // Conversion g -> kg
  });

  return totalCost / (parseInt(recipe.portions) || 1);
}

function generateBenchmarkRecommendation(priceComparison, marginComparison) {
  if (priceComparison < -15) {
    return {
      type: 'price-increase',
      message: 'Prix significativement sous la moyenne du marché',
      action: `Augmentez de ${Math.abs(priceComparison).toFixed(1)}% pour aligner sur la concurrence`,
      impact: 'high',
      potentialRevenue: Math.abs(priceComparison) * 10 // Estimation simplifiée
    };
  } else if (priceComparison > 20) {
    return {
      type: 'price-justify',
      message: 'Prix au-dessus de la moyenne',
      action: 'Justifiez la valeur ajoutée ou considérez une réduction',
      impact: 'medium',
      riskLevel: 'medium'
    };
  } else if (marginComparison < -10) {
    return {
      type: 'margin-improve',
      message: 'Marge inférieure à la moyenne du secteur',
      action: 'Optimisez les coûts ou ajustez le prix de vente',
      impact: 'high',
      potentialSavings: Math.abs(marginComparison) * 5
    };
  } else {
    return {
      type: 'optimal',
      message: 'Positionnement concurrentiel optimal',
      action: 'Maintenez cette stratégie tarifaire',
      impact: 'low'
    };
  }
}

function generateDishSuggestions(ingredients, profile, existingRecipes) {
  // Base de suggestions (version simplifiée)
  const suggestionTemplates = [
    {
      name: 'Bowl Buddha Quinoa',
      category: 'healthy',
      requiredIngredients: ['Quinoa', 'Tomates', 'Avocat'],
      estimatedCost: 4.20,
      suggestedPrice: 14.50,
      margin: 71,
      popularity: 85,
      trend: 'rising'
    },
    {
      name: 'Risotto Champignons',
      category: 'gastronomic',
      requiredIngredients: ['Riz arborio', 'Champignons', 'Parmesan'],
      estimatedCost: 6.80,
      suggestedPrice: 22.00,
      margin: 69,
      popularity: 78,
      trend: 'stable'
    }
  ];

  const availableIngredients = ingredients.map(ing => ing.name);
  const existingNames = existingRecipes.map(r => r.name.toLowerCase());

  return suggestionTemplates.filter(suggestion => {
    // Éviter les doublons
    if (existingNames.includes(suggestion.name.toLowerCase())) {
      return false;
    }

    // Vérifier la disponibilité des ingrédients
    const availableRequired = suggestion.requiredIngredients.filter(req =>
      availableIngredients.some(available =>
        available.toLowerCase().includes(req.toLowerCase())
      )
    );

    return availableRequired.length >= suggestion.requiredIngredients.length * 0.7;
  }).map(suggestion => ({
    ...suggestion,
    id: `suggestion-${Date.now()}-${Math.random()}`,
    marketFit: calculateMarketFit(suggestion, profile),
    competitorAnalysis: {
      avgPrice: suggestion.suggestedPrice * (0.9 + Math.random() * 0.2),
      marketGap: Math.random() > 0.6
    }
  }));
}

function calculateMarketFit(suggestion, profile) {
  let score = 70;
  
  if (profile.cuisineType === 'française' && suggestion.category === 'gastronomic') score += 20;
  if (profile.priceRange === 'haut-de-gamme' && suggestion.margin > 65) score += 15;
  
  return Math.min(score, 100);
}

function generateIntelligentAlerts(recipes, profile) {
  const alerts = [];
  const now = new Date();

  recipes.forEach(recipe => {
    const cost = calculateRecipeCost(recipe);
    const margin = recipe.price ? ((recipe.price - cost) / recipe.price) * 100 : 0;

    // Alerte marge faible
    if (margin < 30) {
      alerts.push({
        id: `low-margin-${recipe.id}`,
        type: 'warning',
        priority: 'high',
        title: 'Marge critique détectée',
        message: `${recipe.name} a une marge de seulement ${margin.toFixed(1)}%`,
        recommendation: 'Augmentez le prix de 15% ou réduisez les coûts',
        impact: `+${(cost * 0.15).toFixed(2)}€ de bénéfice par plat`,
        timestamp: now,
        category: 'profitability'
      });
    }

    // Alerte coût élevé
    if (cost > 8) {
      alerts.push({
        id: `high-cost-${recipe.id}`,
        type: 'info',
        priority: 'medium',
        title: 'Coût ingrédients élevé',
        message: `${recipe.name} coûte ${cost.toFixed(2)}€ en matières premières`,
        recommendation: 'Considérez des substitutions d\'ingrédients moins chers',
        impact: 'Économies potentielles de 20-30%',
        timestamp: now,
        category: 'cost-optimization'
      });
    }
  });

  // Alertes saisonnières et de marché
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) { // Printemps
    alerts.push({
      id: 'seasonal-spring',
      type: 'success',
      priority: 'medium',
      title: 'Opportunité saisonnière',
      message: 'Les légumes de printemps sont maintenant moins chers',
      recommendation: 'Ajoutez des plats avec asperges, petits pois, radis',
      impact: 'Réduction des coûts de 15% sur les légumes',
      timestamp: now,
      category: 'seasonal'
    });
  }

  return alerts;
}

function performAdvancedProfitabilityAnalysis(recipes, ingredients, profile) {
  // Analyse avancée avec IA simulée
  const analyzedRecipes = recipes.map(recipe => {
    const cost = calculateRecipeCost(recipe);
    const price = recipe.price || cost * 2.8;
    const margin = ((price - cost) / price) * 100;
    const popularity = Math.random() * 100;
    const profitability = margin * (popularity / 100);

    return {
      ...recipe,
      cost,
      price,
      margin,
      popularity,
      profitability,
      aiInsights: generateAIInsights(recipe, cost, margin, popularity)
    };
  });

  return {
    recipes: analyzedRecipes,
    globalMetrics: {
      avgMargin: analyzedRecipes.reduce((sum, r) => sum + r.margin, 0) / analyzedRecipes.length,
      totalPotentialRevenue: analyzedRecipes.reduce((sum, r) => sum + (r.price * r.popularity), 0),
      optimizationOpportunities: analyzedRecipes.filter(r => r.margin < 50).length
    },
    recommendations: generateGlobalRecommendations(analyzedRecipes, profile)
  };
}

function generateAIInsights(recipe, cost, margin, popularity) {
  const insights = [];

  if (margin > 70) {
    insights.push('Excellente rentabilité - Plat star à promouvoir');
  } else if (margin < 40) {
    insights.push('Marge faible - Optimisation requise');
  }

  if (popularity > 80) {
    insights.push('Très populaire - Opportunité d\'augmentation de prix');
  } else if (popularity < 30) {
    insights.push('Peu populaire - Considérer le retrait ou la refonte');
  }

  if (cost > 8) {
    insights.push('Coût élevé - Rechercher des substitutions d\'ingrédients');
  }

  return insights;
}

function generateGlobalRecommendations(recipes, profile) {
  const recommendations = [];

  const lowMarginRecipes = recipes.filter(r => r.margin < 40);
  if (lowMarginRecipes.length > 0) {
    recommendations.push({
      type: 'margin-optimization',
      title: 'Optimisation des marges',
      description: `${lowMarginRecipes.length} recettes ont des marges inférieures à 40%`,
      action: 'Réviser les prix ou optimiser les coûts',
      impact: 'Potentiel +15% de rentabilité globale'
    });
  }

  const unpopularRecipes = recipes.filter(r => r.popularity < 30);
  if (unpopularRecipes.length > 0) {
    recommendations.push({
      type: 'menu-simplification',
      title: 'Simplification de la carte',
      description: `${unpopularRecipes.length} plats sont peu commandés`,
      action: 'Retirer ou relancer avec promotion',
      impact: 'Réduction des coûts opérationnels'
    });
  }

  return recommendations;
}

module.exports = router;