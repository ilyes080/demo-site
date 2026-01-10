import { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LightBulbIcon,
  ChartBarIcon,
  BellIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import IntelligentAlerts from './IntelligentAlerts';
import BenchmarkAnalyzer from './BenchmarkAnalyzer';
import DishSuggestions from './DishSuggestions';

const ProfitabilityCopilot = ({ recipes = [], ingredients = [] }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [restaurantProfile, setRestaurantProfile] = useState({
    zone: '',
    cuisineType: '',
    priceRange: '',
    seatingCapacity: '',
    serviceType: ''
  });

  useEffect(() => {
    if (recipes.length > 0) {
      analyzeRecipes();
    }
  }, [recipes, ingredients]);

  const analyzeRecipes = () => {
    setIsAnalyzing(true);
    
    // Simulation d'analyse IA (remplacer par vraie IA en production)
    setTimeout(() => {
      const analysisResult = performAIAnalysis(recipes, ingredients);
      setAnalysis(analysisResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  const performAIAnalysis = (recipes, ingredients) => {
    const analyzedRecipes = recipes.map(recipe => {
      const cost = calculateRecipeCost(recipe, ingredients);
      const suggestedPrice = cost * 2.8; // Marge de 65%
      const currentPrice = recipe.price || suggestedPrice;
      const margin = ((currentPrice - cost) / currentPrice) * 100;
      const popularity = Math.random() * 100; // Simulation popularité
      const profitability = margin * (popularity / 100);

      return {
        ...recipe,
        cost,
        currentPrice,
        suggestedPrice,
        margin,
        popularity,
        profitability,
        status: getRecipeStatus(margin, popularity)
      };
    });

    // Tri par rentabilité
    const sortedByProfitability = [...analyzedRecipes].sort((a, b) => b.profitability - a.profitability);

    return {
      totalRecipes: recipes.length,
      avgMargin: analyzedRecipes.reduce((sum, r) => sum + r.margin, 0) / analyzedRecipes.length,
      topPerformers: sortedByProfitability.slice(0, 3),
      underPerformers: sortedByProfitability.slice(-3).reverse(),
      toOptimize: analyzedRecipes.filter(r => r.status === 'optimize'),
      toRemove: analyzedRecipes.filter(r => r.status === 'remove'),
      recommendations: generateRecommendations(analyzedRecipes),
      insights: generateInsights(analyzedRecipes)
    };
  };

  const calculateRecipeCost = (recipe, ingredients) => {
    const recipeIngredients = recipe.ingredients || recipe.Ingredients || [];
    let totalCost = 0;

    const prices = {
      'Bœuf haché': 12.50, 'Poulet fermier': 8.50, 'Saumon frais': 28.50,
      'Tomates': 3.20, 'Oignons': 1.80, 'Fromage cheddar': 18.00,
      'Pâtes spaghetti': 2.80, 'Riz basmati': 4.50, 'Huile d\'olive': 8.50
    };

    recipeIngredients.forEach(recipeIngredient => {
      let ingredientName, quantity, unit = 'kg';
      
      if (recipeIngredient.ingredientId) {
        const ingredient = ingredients.find(ing => ing.id === recipeIngredient.ingredientId);
        ingredientName = ingredient?.name;
        quantity = parseFloat(recipeIngredient.quantity) || 0;
        unit = ingredient?.unit || 'kg';
      } else if (recipeIngredient.name) {
        ingredientName = recipeIngredient.name;
        quantity = parseFloat(recipeIngredient.RecipeIngredient?.quantity || recipeIngredient.quantity) || 0;
        unit = recipeIngredient.unit || 'kg';
      }

      if (ingredientName) {
        const pricePerUnit = prices[ingredientName] || 5.00;
        let adjustedQuantity = quantity;
        if (unit === 'g') adjustedQuantity = quantity / 1000;
        else if (unit === 'mL') adjustedQuantity = quantity / 1000;
        
        totalCost += adjustedQuantity * pricePerUnit;
      }
    });

    const portions = parseInt(recipe.portions) || 1;
    return (totalCost / portions) * 1.25; // +25% pour main d'œuvre
  };

  const getRecipeStatus = (margin, popularity) => {
    if (margin < 30) return 'remove';
    if (margin < 50 || popularity < 30) return 'optimize';
    if (margin > 60 && popularity > 70) return 'star';
    return 'good';
  };

  const generateRecommendations = (recipes) => {
    const recommendations = [];
    
    // Recommandations basées sur l'analyse
    const lowMarginRecipes = recipes.filter(r => r.margin < 40);
    const highCostRecipes = recipes.filter(r => r.cost > 8);
    const unpopularRecipes = recipes.filter(r => r.popularity < 30);

    if (lowMarginRecipes.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Marges faibles détectées',
        description: `${lowMarginRecipes.length} recettes ont une marge inférieure à 40%`,
        action: 'Augmenter les prix ou réduire les coûts',
        impact: '+15% de rentabilité moyenne',
        recipes: lowMarginRecipes.slice(0, 3)
      });
    }

    if (highCostRecipes.length > 0) {
      recommendations.push({
        type: 'optimize',
        title: 'Coûts élevés identifiés',
        description: `${highCostRecipes.length} recettes ont un coût supérieur à 8€`,
        action: 'Optimiser les portions ou substituer des ingrédients',
        impact: '+200€/mois d\'économies',
        recipes: highCostRecipes.slice(0, 3)
      });
    }

    if (unpopularRecipes.length > 0) {
      recommendations.push({
        type: 'remove',
        title: 'Recettes peu populaires',
        description: `${unpopularRecipes.length} recettes sont rarement commandées`,
        action: 'Retirer de la carte ou relancer avec promotion',
        impact: 'Simplification de la carte et réduction des coûts',
        recipes: unpopularRecipes.slice(0, 3)
      });
    }

    // Recommandations positives
    const starRecipes = recipes.filter(r => r.status === 'star');
    if (starRecipes.length > 0) {
      recommendations.push({
        type: 'success',
        title: 'Recettes stars identifiées',
        description: `${starRecipes.length} recettes excellent(es) en rentabilité et popularité`,
        action: 'Mettre en avant et promouvoir davantage',
        impact: '+25% de ventes sur ces plats',
        recipes: starRecipes.slice(0, 3)
      });
    }

    return recommendations;
  };

  const generateInsights = (recipes) => {
    const insights = [];
    
    const avgCost = recipes.reduce((sum, r) => sum + r.cost, 0) / recipes.length;
    const avgMargin = recipes.reduce((sum, r) => sum + r.margin, 0) / recipes.length;
    const totalPotentialRevenue = recipes.reduce((sum, r) => sum + (r.suggestedPrice * r.popularity), 0);

    insights.push({
      icon: ChartBarIcon,
      title: 'Coût moyen par plat',
      value: `${avgCost.toFixed(2)}€`,
      trend: avgCost < 6 ? 'good' : avgCost < 8 ? 'warning' : 'bad',
      description: avgCost < 6 ? 'Excellent contrôle des coûts' : 'Coûts à optimiser'
    });

    insights.push({
      icon: ArrowTrendingUpIcon,
      title: 'Marge moyenne',
      value: `${avgMargin.toFixed(1)}%`,
      trend: avgMargin > 60 ? 'good' : avgMargin > 40 ? 'warning' : 'bad',
      description: avgMargin > 60 ? 'Excellente rentabilité' : 'Marge à améliorer'
    });

    insights.push({
      icon: SparklesIcon,
      title: 'Potentiel de revenus',
      value: `${(totalPotentialRevenue / 100).toFixed(0)}€/jour`,
      trend: 'good',
      description: 'Revenus optimisés avec recommandations IA'
    });

    return insights;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <SparklesIcon className="mx-auto h-12 w-12 text-blue-500 animate-pulse mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">IA en cours d'analyse...</h3>
        <p className="text-gray-600">Analyse de la rentabilité de vos recettes</p>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <SparklesIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Copilote IA de Rentabilité</h3>
        <p className="text-gray-600">Ajoutez des recettes pour commencer l'analyse</p>
      </div>
    );
  }

  const tabs = [
    { id: 'analysis', name: 'Analyse Rentabilité', icon: ChartBarIcon },
    { id: 'alerts', name: 'Alertes Intelligentes', icon: BellIcon },
    { id: 'benchmark', name: 'Benchmark Concurrentiel', icon: MapPinIcon },
    { id: 'suggestions', name: 'Suggestions IA', icon: LightBulbIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header du Copilote */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center mb-2">
              <SparklesIcon className="h-10 w-10 mr-4 animate-pulse" />
              Copilote IA de Rentabilité
            </h2>
            <p className="text-indigo-100 text-lg">
              {analysis ? (
                `Analyse intelligente de ${analysis.totalRecipes} recettes • Marge moyenne: ${analysis.avgMargin.toFixed(1)}%`
              ) : (
                'Intelligence artificielle avancée pour maximiser vos profits'
              )}
            </p>
            <div className="flex items-center mt-3 space-x-4">
              <div className="flex items-center text-indigo-200">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">IA Active</span>
              </div>
              <div className="flex items-center text-indigo-200">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span className="text-sm">Données temps réel</span>
              </div>
            </div>
          </div>
          <button
            onClick={analyzeRecipes}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            {analysis ? '🔄 Réanalyser' : '🚀 Analyser'}
          </button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <nav className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 rounded-lg font-semibold text-sm flex items-center justify-center space-x-3 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="hidden sm:block">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeTab === 'analysis' && (
          <AnalysisTab 
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            selectedInsight={selectedInsight}
            setSelectedInsight={setSelectedInsight}
            analyzeRecipes={analyzeRecipes}
          />
        )}
        
        {activeTab === 'alerts' && (
          <IntelligentAlerts 
            recipes={recipes}
            restaurantProfile={restaurantProfile}
          />
        )}
        
        {activeTab === 'benchmark' && (
          <BenchmarkAnalyzer 
            recipes={recipes}
            restaurantProfile={restaurantProfile}
            onProfileUpdate={setRestaurantProfile}
          />
        )}
        
        {activeTab === 'suggestions' && (
          <DishSuggestions 
            ingredients={ingredients}
            restaurantProfile={restaurantProfile}
            existingRecipes={recipes}
          />
        )}
      </div>
    </div>
  );
};

// Composant pour l'onglet d'analyse
const AnalysisTab = ({ analysis, isAnalyzing, selectedInsight, setSelectedInsight, analyzeRecipes }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <SparklesIcon className="mx-auto h-12 w-12 text-blue-500 animate-pulse mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">IA en cours d'analyse...</h3>
        <p className="text-gray-600">Analyse de la rentabilité de vos recettes</p>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <SparklesIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Copilote IA de Rentabilité</h3>
        <p className="text-gray-600 mb-4">Ajoutez des recettes pour commencer l'analyse</p>
        <button
          onClick={analyzeRecipes}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
        >
          Démarrer l'analyse
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Métriques Enterprise avec Graphiques Grands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique de Rentabilité Principal */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ChartBarIcon className="h-8 w-8 mr-3 text-indigo-600" />
            Analyse de Rentabilité Temps Réel
          </h3>
          
          {/* Grand graphique visuel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-800">Marge Moyenne</span>
                <span className="text-4xl font-bold text-green-600">{analysis.avgMargin.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{width: `${Math.min(analysis.avgMargin, 100)}%`}}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>0%</span>
                <span className="font-medium">Objectif: 65%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-800">Potentiel Revenus/Jour</span>
                <span className="text-4xl font-bold text-blue-600">
                  {(analysis.insights.find(i => i.title.includes('Potentiel'))?.value || '0€')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analysis.topPerformers.length}</div>
                  <div className="text-sm text-gray-600">Stars</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{analysis.toOptimize.length}</div>
                  <div className="text-sm text-gray-600">À Optimiser</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{analysis.toRemove.length}</div>
                  <div className="text-sm text-gray-600">À Retirer</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau de Bord Executive */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <SparklesIcon className="h-8 w-8 mr-3 text-purple-600" />
            Intelligence Executive
          </h3>
          
          <div className="space-y-6">
            {/* ROI Prédictif */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">ROI Prédictif (30 jours)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">+{(analysis.avgMargin * 1.2).toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Avec optimisations IA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">+{(analysis.totalRecipes * 150).toFixed(0)}€</div>
                  <div className="text-sm text-gray-600">Économies mensuelles</div>
                </div>
              </div>
            </div>

            {/* Alertes Critiques */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                Alertes Critiques
              </h4>
              <div className="space-y-3">
                {analysis.recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border-l-4 border-red-400">
                    <div className="font-medium text-gray-900 text-sm">{rec.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{rec.impact}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score de Performance Global */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl text-center">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Score Performance Global</h4>
              <div className="relative">
                <div className="text-6xl font-bold text-amber-600 mb-2">
                  {Math.round((analysis.avgMargin / 70) * 100)}
                </div>
                <div className="text-lg text-gray-600">/ 100</div>
                <div className="text-sm text-gray-500 mt-2">
                  {Math.round((analysis.avgMargin / 70) * 100) >= 80 ? 'Excellence' : 
                   Math.round((analysis.avgMargin / 70) * 100) >= 60 ? 'Très Bon' : 'À Améliorer'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations IA */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <LightBulbIcon className="h-6 w-6 mr-2 text-yellow-500" />
          Recommandations IA Prioritaires
        </h3>
        
        <div className="space-y-4">
          {analysis.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 rounded-r-lg cursor-pointer hover:bg-gray-50 ${
                rec.type === 'success' ? 'border-green-500 bg-green-50' :
                rec.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                rec.type === 'remove' ? 'border-red-500 bg-red-50' :
                'border-blue-500 bg-blue-50'
              }`}
              onClick={() => setSelectedInsight(rec)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    {rec.type === 'success' && <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />}
                    {rec.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-500" />}
                    {rec.type === 'remove' && <XCircleIcon className="h-5 w-5 mr-2 text-red-500" />}
                    {rec.type === 'optimize' && <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-blue-500" />}
                    {rec.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">Action: {rec.action}</p>
                  <p className="text-xs text-gray-500">Impact estimé: {rec.impact}</p>
                </div>
                <span className="text-xs text-gray-400">Cliquer pour détails →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top et Flop Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ArrowTrendingUpIcon className="h-6 w-6 mr-2 text-green-500" />
            Top Performers
          </h3>
          
          <div className="space-y-3">
            {analysis.topPerformers.map((recipe, index) => (
              <div key={recipe.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">#{index + 1} {recipe.name}</h4>
                  <p className="text-sm text-gray-600">
                    Marge: {recipe.margin.toFixed(1)}% • Popularité: {recipe.popularity.toFixed(0)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(recipe.currentPrice)}</p>
                  <p className="text-xs text-gray-500">Coût: {formatCurrency(recipe.cost)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Under Performers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ArrowTrendingDownIcon className="h-6 w-6 mr-2 text-red-500" />
            À Optimiser / Retirer
          </h3>
          
          <div className="space-y-3">
            {analysis.underPerformers.map((recipe) => (
              <div key={recipe.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                  <p className="text-sm text-gray-600">
                    Marge: {recipe.margin.toFixed(1)}% • Popularité: {recipe.popularity.toFixed(0)}%
                  </p>
                  <p className="text-xs text-red-600">
                    {recipe.status === 'remove' ? 'À retirer de la carte' : 'À optimiser'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{formatCurrency(recipe.currentPrice)}</p>
                  <p className="text-xs text-gray-500">Coût: {formatCurrency(recipe.cost)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de détail des recommandations */}
      {selectedInsight && (
        <RecommendationModal
          recommendation={selectedInsight}
          onClose={() => setSelectedInsight(null)}
        />
      )}
    </div>
  );
};

// Modal pour les détails des recommandations
const RecommendationModal = ({ recommendation, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{recommendation.title}</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{recommendation.description}</p>
                <p className="font-medium text-gray-900 mt-2">Action recommandée: {recommendation.action}</p>
                <p className="text-sm text-green-600 mt-1">Impact estimé: {recommendation.impact}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recettes concernées:</h4>
                <div className="space-y-2">
                  {recommendation.recipes.map((recipe, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{recipe.name}</span>
                      <div className="text-sm text-gray-600">
                        Marge: {recipe.margin.toFixed(1)}% • Coût: {recipe.cost.toFixed(2)}€
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitabilityCopilot;