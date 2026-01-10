import React, { useState, useEffect } from 'react';
import {
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ProfitAnalyzer = ({ recipes = [], inventory = [] }) => {
  const [analysis, setAnalysis] = useState({
    totalProfit: 0,
    bestPerformers: [],
    worstPerformers: [],
    recommendations: [],
    trends: []
  });

  const [timeframe, setTimeframe] = useState('today'); // today, week, month

  useEffect(() => {
    analyzeProfit();
  }, [recipes, inventory, timeframe]);

  const analyzeProfit = () => {
    if (!recipes || recipes.length === 0) return;

    // Simuler des données de vente pour la démo
    const salesData = generateSalesData(recipes, timeframe);
    
    let totalProfit = 0;
    const dishAnalysis = [];

    recipes.forEach(recipe => {
      const sales = salesData[recipe.id] || { quantity: 0, revenue: 0 };
      const cost = calculateRecipeCost(recipe);
      const profit = (sales.revenue - (cost * sales.quantity));
      const margin = sales.revenue > 0 ? ((profit / sales.revenue) * 100) : 0;

      totalProfit += profit;

      dishAnalysis.push({
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        cost: cost,
        revenue: sales.revenue,
        profit: profit,
        margin: margin,
        quantity: sales.quantity,
        profitPerUnit: sales.quantity > 0 ? (profit / sales.quantity) : 0
      });
    });

    // Trier par rentabilité
    const sortedByProfit = [...dishAnalysis].sort((a, b) => b.profit - a.profit);
    const bestPerformers = sortedByProfit.slice(0, 3);
    const worstPerformers = sortedByProfit.slice(-3).reverse();

    // Générer des recommandations intelligentes
    const recommendations = generateRecommendations(dishAnalysis, inventory);

    setAnalysis({
      totalProfit,
      bestPerformers,
      worstPerformers,
      recommendations,
      allDishes: dishAnalysis
    });
  };

  const calculateRecipeCost = (recipe) => {
    // Prix moyens des ingrédients (base de données simplifiée)
    const ingredientPrices = {
      'Bœuf haché': 12.50,
      'Poulet fermier': 8.50,
      'Saumon frais': 28.50,
      'Tomates': 3.20,
      'Oignons': 1.80,
      'Fromage cheddar': 18.00,
      'Pâtes spaghetti': 2.80,
      'Riz basmati': 4.50,
      'Huile d\'olive': 8.50
    };

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return 5.00; // Coût par défaut
    }

    let totalCost = 0;
    recipe.ingredients.forEach(ingredient => {
      const price = ingredientPrices[ingredient.name] || 5.00;
      const quantity = parseFloat(ingredient.quantity) || 0.1;
      totalCost += price * quantity;
    });

    // Ajouter 25% pour main d'œuvre et frais généraux
    return totalCost * 1.25;
  };

  const generateSalesData = (recipes, timeframe) => {
    const multiplier = {
      today: 1,
      week: 7,
      month: 30
    }[timeframe];

    const salesData = {};
    
    recipes.forEach(recipe => {
      // Simuler des ventes basées sur la popularité estimée
      const baseQuantity = Math.floor(Math.random() * 20) + 5; // 5-25 portions
      const quantity = baseQuantity * multiplier;
      
      // Prix de vente estimé (coût × 2.5 à 3.5)
      const cost = calculateRecipeCost(recipe);
      const priceMultiplier = 2.5 + (Math.random() * 1); // 2.5x à 3.5x le coût
      const unitPrice = cost * priceMultiplier;
      
      salesData[recipe.id] = {
        quantity: quantity,
        revenue: quantity * unitPrice,
        unitPrice: unitPrice
      };
    });

    return salesData;
  };

  const generateRecommendations = (dishes, inventory) => {
    const recommendations = [];

    // Recommandation 1: Plats les plus rentables à promouvoir
    const topProfitable = dishes
      .filter(dish => dish.profitPerUnit > 5)
      .sort((a, b) => b.profitPerUnit - a.profitPerUnit)[0];

    if (topProfitable) {
      recommendations.push({
        type: 'promote',
        icon: ArrowTrendingUpIcon,
        color: 'green',
        title: 'Promouvoir le plat star',
        description: `"${topProfitable.name}" génère ${topProfitable.profitPerUnit.toFixed(2)}€ de bénéfice par portion`,
        action: `+20% de ventes = +${(topProfitable.profitPerUnit * topProfitable.quantity * 0.2).toFixed(0)}€/période`,
        priority: 'high'
      });
    }

    // Recommandation 2: Plats peu rentables à optimiser
    const leastProfitable = dishes
      .filter(dish => dish.margin < 40 && dish.quantity > 0)
      .sort((a, b) => a.margin - b.margin)[0];

    if (leastProfitable) {
      recommendations.push({
        type: 'optimize',
        icon: ExclamationTriangleIcon,
        color: 'yellow',
        title: 'Optimiser la rentabilité',
        description: `"${leastProfitable.name}" n'a que ${leastProfitable.margin.toFixed(1)}% de marge`,
        action: `Réduire les coûts de 10% = +${(leastProfitable.revenue * 0.1).toFixed(0)}€ de bénéfice`,
        priority: 'medium'
      });
    }

    // Recommandation 3: Nouveau plat potentiel
    recommendations.push({
      type: 'create',
      icon: LightBulbIcon,
      color: 'blue',
      title: 'Créer un nouveau plat',
      description: 'Opportunité détectée: plat végétarien premium',
      action: 'Marge estimée: 70% | Potentiel: +450€/mois',
      priority: 'low'
    });

    // Recommandation 4: Gestion des stocks
    const lowStock = inventory.filter(item => item.quantity < 10).length;
    if (lowStock > 0) {
      recommendations.push({
        type: 'stock',
        icon: ExclamationTriangleIcon,
        color: 'red',
        title: 'Attention aux stocks',
        description: `${lowStock} ingrédients en stock critique`,
        action: 'Risque de rupture = perte de revenus potentielle',
        priority: 'high'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'today': return "Aujourd'hui";
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      default: return "Aujourd'hui";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur de période */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            💰 Analyseur de Bénéfices
          </h2>
          <p className="text-gray-600">
            Intelligence artificielle pour maximiser vos profits
          </p>
        </div>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="input w-40"
        >
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center">
            <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Bénéfice total</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(analysis.totalProfit)}
              </p>
              <p className="text-xs text-green-600">{getTimeframeLabel()}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Marge moyenne</p>
              <p className="text-2xl font-bold text-blue-900">
                {analysis.allDishes?.length > 0 
                  ? (analysis.allDishes.reduce((sum, dish) => sum + dish.margin, 0) / analysis.allDishes.length).toFixed(1)
                  : 0}%
              </p>
              <p className="text-xs text-blue-600">Sur tous les plats</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Potentiel d'optimisation</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(analysis.totalProfit * 0.15)}
              </p>
              <p className="text-xs text-purple-600">+15% possible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top et Flop performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meilleurs performers */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
            🏆 Top Performers
          </h3>
          
          <div className="space-y-3">
            {analysis.bestPerformers.map((dish, index) => (
              <div key={dish.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    #{index + 1} {dish.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {dish.quantity} portions vendues
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatCurrency(dish.profit)}
                  </p>
                  <p className="text-xs text-green-600">
                    {dish.margin.toFixed(1)}% marge
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pires performers */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ArrowTrendingDownIcon className="h-5 w-5 text-red-600 mr-2" />
            ⚠️ À Optimiser
          </h3>
          
          <div className="space-y-3">
            {analysis.worstPerformers.map((dish, index) => (
              <div key={dish.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{dish.name}</p>
                  <p className="text-sm text-gray-600">
                    {dish.quantity} portions vendues
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">
                    {formatCurrency(dish.profit)}
                  </p>
                  <p className="text-xs text-red-600">
                    {dish.margin.toFixed(1)}% marge
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommandations IA */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
          🤖 Recommandations IA
        </h3>
        
        <div className="space-y-4">
          {analysis.recommendations.map((rec, index) => {
            const colorClasses = {
              green: 'border-green-200 bg-green-50',
              yellow: 'border-yellow-200 bg-yellow-50',
              blue: 'border-blue-200 bg-blue-50',
              red: 'border-red-200 bg-red-50'
            };

            const priorityBadges = {
              high: 'bg-red-100 text-red-800',
              medium: 'bg-yellow-100 text-yellow-800',
              low: 'bg-blue-100 text-blue-800'
            };

            return (
              <div key={index} className={`border rounded-lg p-4 ${colorClasses[rec.color]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <rec.icon className={`h-6 w-6 text-${rec.color}-600 mt-1`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        💡 {rec.action}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityBadges[rec.priority]}`}>
                    {rec.priority === 'high' ? 'Urgent' : rec.priority === 'medium' ? 'Important' : 'Suggestion'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graphique de tendance simplifié */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          📈 Évolution des Bénéfices
        </h3>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
            const height = Math.random() * 60 + 20; // Hauteur aléatoire pour la démo
            const profit = Math.random() * 500 + 200; // Bénéfice aléatoire
            
            return (
              <div key={day} className="text-center">
                <div 
                  className="bg-gradient-to-t from-green-400 to-green-600 rounded-t mx-auto mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ height: `${height}px`, width: '100%' }}
                  title={`${day}: ${formatCurrency(profit)}`}
                ></div>
                <p className="text-xs text-gray-500">{day}</p>
                <p className="text-xs font-medium text-gray-700">
                  {formatCurrency(profit)}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="text-center text-sm text-gray-600">
          <p>Bénéfices quotidiens - {getTimeframeLabel()}</p>
          <p className="text-green-600 font-medium mt-1">
            Tendance: +12.5% vs période précédente 📈
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfitAnalyzer;