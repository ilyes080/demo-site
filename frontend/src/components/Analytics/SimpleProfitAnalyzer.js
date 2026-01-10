import React, { useState, useEffect } from 'react';
import {
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const SimpleProfitAnalyzer = ({ recipes = [] }) => {
  const [analysis, setAnalysis] = useState({
    totalProfit: 0,
    bestPerformers: [],
    worstPerformers: [],
    recommendations: []
  });
  
  const [selectedDish, setSelectedDish] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('auto'); // 'auto' ou 'manual'

  useEffect(() => {
    if (recipes && recipes.length > 0) {
      analyzeProfit();
    }
  }, [recipes]);

  const calculateRecipeCost = (recipe) => {
    // Prix moyens simplifiés
    const ingredientPrices = {
      'Bœuf haché': 12.50,
      'Poulet fermier': 8.50,
      'Saumon frais': 28.50,
      'Tomates': 3.20,
      'Oignons': 1.80,
      'Fromage cheddar': 18.00,
      'Pâtes spaghetti': 2.80,
      'Riz basmati': 4.50
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

    return totalCost * 1.25; // Ajouter 25% pour charges
  };

  const analyzeProfit = () => {
    let totalProfit = 0;
    const dishAnalysis = [];

    recipes.forEach(recipe => {
      // Simuler des ventes pour la démo
      const salesQuantity = Math.floor(Math.random() * 50) + 10; // 10-60 portions
      const cost = calculateRecipeCost(recipe);
      const unitPrice = cost * 2.8; // Marge de 65% environ
      const revenue = salesQuantity * unitPrice;
      const profit = revenue - (cost * salesQuantity);
      const margin = ((profit / revenue) * 100);

      totalProfit += profit;

      dishAnalysis.push({
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        cost: cost,
        revenue: revenue,
        profit: profit,
        margin: margin,
        quantity: salesQuantity,
        profitPerUnit: profit / salesQuantity
      });
    });

    // Trier par rentabilité
    const sortedByProfit = [...dishAnalysis].sort((a, b) => b.profit - a.profit);
    const bestPerformers = sortedByProfit.slice(0, 3);
    const worstPerformers = sortedByProfit.slice(-3).reverse();

    // Générer des recommandations
    const recommendations = [
      {
        type: 'promote',
        icon: ArrowTrendingUpIcon,
        color: 'green',
        title: 'Promouvoir le plat star',
        description: `"${bestPerformers[0]?.name || 'Plat principal'}" génère le plus de bénéfices`,
        action: `+20% de ventes = +${Math.round((bestPerformers[0]?.profit || 0) * 0.2)}€/période`
      },
      {
        type: 'optimize',
        icon: LightBulbIcon,
        color: 'blue',
        title: 'Optimiser les coûts',
        description: 'Négocier avec les fournisseurs pour réduire les coûts',
        action: `-5% sur les achats = +${Math.round(totalProfit * 0.05)}€ de bénéfice`
      },
      {
        type: 'create',
        icon: ChartBarIcon,
        color: 'purple',
        title: 'Nouveau plat suggéré',
        description: 'Plat végétarien avec marge élevée détecté',
        action: 'Potentiel: +450€/mois avec 70% de marge'
      }
    ];

    setAnalysis({
      totalProfit,
      bestPerformers,
      worstPerformers,
      recommendations,
      allDishes: dishAnalysis
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (!recipes || recipes.length === 0) {
    return (
      <div className="card text-center py-8">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-gray-500">Créez des recettes pour voir l'analyse de rentabilité</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec mode de sélection */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Analyseur de Bénéfices IA
          </h2>
          <p className="text-gray-600">
            Intelligence artificielle pour maximiser vos profits
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setAnalysisMode('auto')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              analysisMode === 'auto' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mode IA
          </button>
          <button
            onClick={() => setAnalysisMode('manual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              analysisMode === 'manual' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mode Exploration
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center">
            <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Bénéfice estimé</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(analysis.totalProfit)}
              </p>
              <p className="text-xs text-green-600">Cette semaine</p>
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

      {/* Mode IA : Top et Flop performers */}
      {analysisMode === 'auto' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meilleurs performers */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
              Top Performers (IA)
            </h3>
            
            <div className="space-y-3">
              {analysis.bestPerformers.map((dish, index) => (
                <div 
                  key={dish.id} 
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => {
                    setSelectedDish(dish);
                    setAnalysisMode('manual');
                  }}
                >
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
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Cliquez sur un plat pour l'analyser en détail
            </p>
          </div>

          {/* Recommandations IA */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Recommandations IA
            </h3>
            
            <div className="space-y-4">
              {analysis.recommendations.map((rec, index) => {
                const colorClasses = {
                  green: 'border-green-200 bg-green-50',
                  blue: 'border-blue-200 bg-blue-50',
                  purple: 'border-purple-200 bg-purple-50'
                };

                return (
                  <div key={index} className={`border rounded-lg p-4 ${colorClasses[rec.color]}`}>
                    <div className="flex items-start space-x-3">
                      <rec.icon className={`h-6 w-6 text-${rec.color}-600 mt-1`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        <p className="text-sm font-medium text-gray-900 mt-2">
                          {rec.action}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mode Exploration : Sélection manuelle */}
      {analysisMode === 'manual' && (
        <div className="space-y-6">
          {/* Sélecteur de plat */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              Analyser un Plat Spécifique
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.allDishes?.map((dish) => (
                <div
                  key={dish.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedDish?.id === dish.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDish(dish)}
                >
                  <h4 className="font-medium text-gray-900">{dish.name}</h4>
                  <p className="text-sm text-gray-600">{dish.category}</p>
                  <div className="mt-2 flex justify-between">
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(dish.profitPerUnit)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {dish.margin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analyse détaillée du plat sélectionné */}
          {selectedDish && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Analyse Détaillée : {selectedDish.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-lg mb-2">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(selectedDish.cost)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Coût par portion</p>
                </div>

                <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-lg mb-2">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedDish.profitPerUnit)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Bénéfice par portion</p>
                </div>

                <div className="text-center">
                  <div className="bg-purple-100 p-4 rounded-lg mb-2">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedDish.margin.toFixed(1)}%
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Marge</p>
                </div>

                <div className="text-center">
                  <div className="bg-orange-100 p-4 rounded-lg mb-2">
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedDish.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Portions vendues</p>
                </div>
              </div>

              {/* Simulations interactives */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Simulations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-green-700">Si vous vendez +10 portions :</p>
                    <p className="text-green-600">+{formatCurrency(selectedDish.profitPerUnit * 10)} de bénéfice</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-blue-700">Si vous réduisez les coûts de 5% :</p>
                    <p className="text-blue-600">+{formatCurrency(selectedDish.cost * 0.05 * selectedDish.quantity)} d'économies</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-purple-700">Si vous augmentez le prix de 1€ :</p>
                    <p className="text-purple-600">+{formatCurrency(selectedDish.quantity)} de revenus</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-orange-700">Bénéfice mensuel estimé :</p>
                    <p className="text-orange-600">{formatCurrency(selectedDish.profit * 4)} (×4 semaines)</p>
                  </div>
                </div>
              </div>

              {/* Recommandations spécifiques */}
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Recommandations pour ce plat</h4>
                <div className="space-y-2 text-sm text-yellow-700">
                  {selectedDish.margin > 60 && (
                    <p><strong>Excellent !</strong> Ce plat a une marge exceptionnelle. Mettez-le en avant sur votre carte.</p>
                  )}
                  {selectedDish.margin >= 40 && selectedDish.margin <= 60 && (
                    <p><strong>Bon plat.</strong> Vous pouvez optimiser en négociant avec vos fournisseurs.</p>
                  )}
                  {selectedDish.margin < 40 && (
                    <p><strong>Attention !</strong> Marge faible. Considérez augmenter le prix ou réduire les coûts.</p>
                  )}
                  <p><strong>Potentiel :</strong> En optimisant ce plat, vous pourriez gagner jusqu'à {formatCurrency(selectedDish.profit * 0.2)} supplémentaires par période.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Graphique de tendance simplifié */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Évolution des Bénéfices
        </h3>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
            const height = Math.random() * 60 + 20;
            const profit = Math.random() * 500 + 200;
            
            return (
              <div key={day} className="text-center">
                <div 
                  className="bg-gradient-to-t from-green-400 to-green-600 rounded-t mx-auto mb-2"
                  style={{ height: `${height}px`, width: '100%' }}
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
          <p className="text-green-600 font-medium">
            Tendance: +12.5% vs semaine précédente
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleProfitAnalyzer;