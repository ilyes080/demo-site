import React, { useState, useEffect } from 'react';
import {
  CurrencyEuroIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const IngredientAnalyzer = ({ recipes = [], ingredients = [] }) => {
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientAnalysis, setIngredientAnalysis] = useState([]);
  const [sortBy, setSortBy] = useState('impact'); // 'impact', 'cost', 'usage'

  // Prix des ingrédients avec variations saisonnières
  const ingredientPrices = {
    'Bœuf haché': { current: 12.50, seasonal: 11.80, trend: 'up' },
    'Poulet fermier': { current: 8.50, seasonal: 8.20, trend: 'stable' },
    'Saumon frais': { current: 28.50, seasonal: 32.00, trend: 'up' },
    'Tomates': { current: 3.20, seasonal: 2.80, trend: 'down' },
    'Oignons': { current: 1.80, seasonal: 1.60, trend: 'stable' },
    'Champignons de Paris': { current: 12.00, seasonal: 15.00, trend: 'up' },
    'Fromage cheddar': { current: 18.00, seasonal: 17.50, trend: 'stable' },
    'Pâtes spaghetti': { current: 2.80, seasonal: 2.80, trend: 'stable' },
    'Riz basmati': { current: 4.50, seasonal: 4.20, trend: 'down' },
    'Huile d\'olive': { current: 8.50, seasonal: 9.20, trend: 'up' },
    'Truffe noire': { current: 1000.00, seasonal: 850.00, trend: 'down' },
    'Avocat': { current: 1.50, seasonal: 2.20, trend: 'up' }
  };

  useEffect(() => {
    if (recipes.length > 0 && ingredients.length > 0) {
      analyzeIngredients();
    }
  }, [recipes, ingredients, sortBy]);

  const analyzeIngredients = () => {
    const ingredientUsage = {};
    
    // Analyser l'usage de chaque ingrédient dans les recettes
    recipes.forEach(recipe => {
      if (recipe.ingredients) {
        recipe.ingredients.forEach(recipeIngredient => {
          const ingredient = ingredients.find(ing => ing.id === recipeIngredient.ingredientId);
          if (!ingredient) return;

          const quantity = parseFloat(recipeIngredient.quantity) || 0;
          const priceData = ingredientPrices[ingredient.name] || { current: 5.00, seasonal: 5.00, trend: 'stable' };
          const cost = quantity * priceData.current;

          if (!ingredientUsage[ingredient.name]) {
            ingredientUsage[ingredient.name] = {
              ingredient: ingredient,
              totalQuantity: 0,
              totalCost: 0,
              usedInRecipes: [],
              priceData: priceData,
              impact: 0
            };
          }

          ingredientUsage[ingredient.name].totalQuantity += quantity;
          ingredientUsage[ingredient.name].totalCost += cost;
          ingredientUsage[ingredient.name].usedInRecipes.push({
            recipeName: recipe.name,
            quantity: quantity,
            cost: cost
          });
        });
      }
    });

    // Calculer l'impact sur la rentabilité
    const analysis = Object.values(ingredientUsage).map(usage => {
      const avgCostPerRecipe = usage.totalCost / usage.usedInRecipes.length;
      const usageFrequency = usage.usedInRecipes.length;
      const priceVolatility = Math.abs(usage.priceData.current - usage.priceData.seasonal) / usage.priceData.current;
      
      // Score d'impact (coût × fréquence × volatilité)
      const impact = avgCostPerRecipe * usageFrequency * (1 + priceVolatility);
      
      return {
        ...usage,
        impact: impact,
        avgCostPerRecipe: avgCostPerRecipe,
        usageFrequency: usageFrequency,
        priceVolatility: priceVolatility,
        potentialSavings: calculatePotentialSavings(usage)
      };
    });

    // Trier selon le critère sélectionné
    const sortedAnalysis = analysis.sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return b.totalCost - a.totalCost;
        case 'usage':
          return b.usageFrequency - a.usageFrequency;
        case 'impact':
        default:
          return b.impact - a.impact;
      }
    });

    setIngredientAnalysis(sortedAnalysis);
  };

  const calculatePotentialSavings = (usage) => {
    const currentCost = usage.priceData.current;
    const seasonalCost = usage.priceData.seasonal;
    const savings = Math.abs(currentCost - seasonalCost) * usage.totalQuantity;
    return seasonalCost < currentCost ? savings : 0;
  };

  const getImpactLevel = (impact) => {
    if (impact > 50) return { level: 'Très élevé', color: 'red' };
    if (impact > 20) return { level: 'Élevé', color: 'orange' };
    if (impact > 10) return { level: 'Moyen', color: 'yellow' };
    return { level: 'Faible', color: 'green' };
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getSubstitutionSuggestions = (ingredient) => {
    const substitutions = {
      'Bœuf haché': [
        { name: 'Porc haché', savings: '15%', impact: 'Goût similaire' },
        { name: 'Dinde hachée', savings: '20%', impact: 'Plus léger' }
      ],
      'Saumon frais': [
        { name: 'Truite', savings: '30%', impact: 'Goût proche' },
        { name: 'Cabillaud', savings: '40%', impact: 'Texture différente' }
      ],
      'Truffe noire': [
        { name: 'Huile de truffe', savings: '80%', impact: 'Arôme conservé' },
        { name: 'Champignons shiitake', savings: '95%', impact: 'Umami similaire' }
      ],
      'Avocat': [
        { name: 'Courgette', savings: '60%', impact: 'Texture crémeuse' },
        { name: 'Concombre', savings: '70%', impact: 'Fraîcheur conservée' }
      ]
    };

    return substitutions[ingredient.name] || [];
  };

  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="card text-center py-8">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-gray-500">Ajoutez des ingrédients pour voir l'analyse</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec options de tri */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            🥕 Analyseur d'Ingrédients IA
          </h2>
          <p className="text-gray-600">
            Optimisez vos coûts ingrédient par ingrédient
          </p>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input w-48"
        >
          <option value="impact">Trier par Impact</option>
          <option value="cost">Trier par Coût</option>
          <option value="usage">Trier par Usage</option>
        </select>
      </div>

      {/* Vue d'ensemble des ingrédients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ingredientAnalysis.slice(0, 12).map((analysis, index) => {
          const impactInfo = getImpactLevel(analysis.impact);
          
          return (
            <div
              key={analysis.ingredient.id}
              className={`card cursor-pointer transition-all hover:shadow-md ${
                selectedIngredient?.ingredient.id === analysis.ingredient.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : ''
              }`}
              onClick={() => setSelectedIngredient(analysis)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 text-sm">
                  {analysis.ingredient.name}
                </h3>
                {getTrendIcon(analysis.priceData.trend)}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Coût total:</span>
                  <span className="font-medium">{formatCurrency(analysis.totalCost)}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium">{analysis.usageFrequency} recettes</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Impact:</span>
                  <span className={`font-medium text-${impactInfo.color}-600`}>
                    {impactInfo.level}
                  </span>
                </div>

                {analysis.potentialSavings > 0 && (
                  <div className="bg-green-100 p-2 rounded text-xs">
                    <p className="text-green-700 font-medium">
                      💰 Économie possible: {formatCurrency(analysis.potentialSavings)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analyse détaillée de l'ingrédient sélectionné */}
      {selectedIngredient && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📊 Analyse Détaillée : {selectedIngredient.ingredient.name}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métriques principales */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Prix actuel</p>
                  <p className="text-xl font-bold text-blue-900">
                    {formatCurrency(selectedIngredient.priceData.current)}
                  </p>
                  <p className="text-xs text-blue-600">par {selectedIngredient.ingredient.unit}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Coût total</p>
                  <p className="text-xl font-bold text-green-900">
                    {formatCurrency(selectedIngredient.totalCost)}
                  </p>
                  <p className="text-xs text-green-600">toutes recettes</p>
                </div>
              </div>

              {/* Usage dans les recettes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Utilisé dans :</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedIngredient.usedInRecipes.map((usage, index) => (
                    <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{usage.recipeName}</span>
                      <span className="font-medium">{formatCurrency(usage.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Optimisations et substitutions */}
            <div className="space-y-4">
              {/* Évolution des prix */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Évolution des Prix
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prix actuel:</span>
                    <span className="font-medium">{formatCurrency(selectedIngredient.priceData.current)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prix saisonnier:</span>
                    <span className={`font-medium ${
                      selectedIngredient.priceData.seasonal < selectedIngredient.priceData.current 
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(selectedIngredient.priceData.seasonal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tendance:</span>
                    <span className="flex items-center">
                      {getTrendIcon(selectedIngredient.priceData.trend)}
                      <span className="ml-1 capitalize">{selectedIngredient.priceData.trend}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Suggestions de substitution */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <LightBulbIcon className="h-4 w-4 mr-2" />
                  Substitutions Possibles
                </h4>
                <div className="space-y-2">
                  {getSubstitutionSuggestions(selectedIngredient.ingredient).map((sub, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-blue-900">{sub.name}</p>
                          <p className="text-xs text-blue-600">{sub.impact}</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          -{sub.savings}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {getSubstitutionSuggestions(selectedIngredient.ingredient).length === 0 && (
                    <p className="text-gray-500 text-sm italic">
                      Aucune substitution recommandée pour cet ingrédient
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommandations spécifiques */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              🤖 Recommandations IA pour {selectedIngredient.ingredient.name}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {selectedIngredient.potentialSavings > 0 && (
                <div className="bg-white p-3 rounded border-l-4 border-green-500">
                  <p className="font-medium text-green-700">💰 Optimisation saisonnière</p>
                  <p className="text-gray-600">
                    Économisez {formatCurrency(selectedIngredient.potentialSavings)} en achetant en saison
                  </p>
                </div>
              )}
              
              {selectedIngredient.usageFrequency > 3 && (
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <p className="font-medium text-blue-700">📦 Achat en gros</p>
                  <p className="text-gray-600">
                    Négociez un prix de gros (utilisé dans {selectedIngredient.usageFrequency} recettes)
                  </p>
                </div>
              )}
              
              {selectedIngredient.priceData.trend === 'up' && (
                <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                  <p className="font-medium text-orange-700">⚠️ Prix en hausse</p>
                  <p className="text-gray-600">
                    Considérez augmenter vos prix ou trouver des alternatives
                  </p>
                </div>
              )}
              
              <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                <p className="font-medium text-purple-700">📈 Impact mensuel</p>
                <p className="text-gray-600">
                  Cet ingrédient représente {formatCurrency(selectedIngredient.totalCost * 4)} par mois
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientAnalyzer;