import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const BenchmarkAnalyzer = ({ recipes = [], restaurantProfile, onProfileUpdate }) => {
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(!restaurantProfile?.zone);

  const [profileForm, setProfileForm] = useState({
    zone: restaurantProfile?.zone || '',
    cuisineType: restaurantProfile?.cuisineType || '',
    priceRange: restaurantProfile?.priceRange || '',
    seatingCapacity: restaurantProfile?.seatingCapacity || '',
    serviceType: restaurantProfile?.serviceType || ''
  });

  useEffect(() => {
    if (restaurantProfile?.zone && recipes.length > 0) {
      performBenchmarkAnalysis();
    }
  }, [restaurantProfile, recipes]);

  const performBenchmarkAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulation d'analyse benchmark (en production, cela ferait appel à une vraie API)
    setTimeout(() => {
      const analysis = generateBenchmarkData();
      setBenchmarkData(analysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const generateBenchmarkData = () => {
    // Données de benchmark simulées basées sur le profil du restaurant
    const baseData = {
      zone: profileForm.zone,
      cuisineType: profileForm.cuisineType,
      priceRange: profileForm.priceRange,
      sampleSize: Math.floor(Math.random() * 50) + 20, // 20-70 restaurants similaires
    };

    // Analyse des recettes par rapport au benchmark
    const recipeAnalysis = recipes.map(recipe => {
      const recipeCost = calculateRecipeCost(recipe);
      const recipePrice = recipe.price || recipeCost * 2.8;
      const recipeMargin = ((recipePrice - recipeCost) / recipePrice) * 100;

      // Génération de données benchmark simulées
      const benchmarkPrice = generateBenchmarkPrice(recipe.name, profileForm);
      const benchmarkMargin = generateBenchmarkMargin(profileForm);
      const popularityScore = Math.random() * 100;

      return {
        ...recipe,
        cost: recipeCost,
        price: recipePrice,
        margin: recipeMargin,
        benchmark: {
          avgPrice: benchmarkPrice,
          avgMargin: benchmarkMargin,
          popularity: popularityScore,
          priceComparison: ((recipePrice - benchmarkPrice) / benchmarkPrice) * 100,
          marginComparison: recipeMargin - benchmarkMargin,
          recommendation: generateRecommendation(recipePrice, benchmarkPrice, recipeMargin, benchmarkMargin)
        }
      };
    });

    // Statistiques globales
    const globalStats = {
      avgPriceDifference: recipeAnalysis.reduce((sum, r) => sum + r.benchmark.priceComparison, 0) / recipeAnalysis.length,
      avgMarginDifference: recipeAnalysis.reduce((sum, r) => sum + r.benchmark.marginComparison, 0) / recipeAnalysis.length,
      competitiveAdvantage: calculateCompetitiveAdvantage(recipeAnalysis),
      marketPosition: determineMarketPosition(recipeAnalysis)
    };

    return {
      ...baseData,
      recipes: recipeAnalysis,
      globalStats,
      lastUpdated: new Date()
    };
  };

  const calculateRecipeCost = (recipe) => {
    // Simulation du calcul de coût
    const ingredients = recipe.ingredients || recipe.Ingredients || [];
    return ingredients.length * 2.8 + Math.random() * 2;
  };

  const generateBenchmarkPrice = (recipeName, profile) => {
    // Simulation de prix benchmark basé sur le type de cuisine et la zone
    const basePrice = {
      'française': 18,
      'italienne': 15,
      'asiatique': 13,
      'méditerranéenne': 16,
      'américaine': 14,
      'végétarienne': 12
    }[profile.cuisineType] || 15;

    const zoneMultiplier = {
      'paris-centre': 1.4,
      'paris-banlieue': 1.1,
      'lyon': 1.0,
      'marseille': 0.9,
      'toulouse': 0.85,
      'bordeaux': 0.9,
      'lille': 0.8,
      'nantes': 0.85
    }[profile.zone] || 1.0;

    const rangeMultiplier = {
      'économique': 0.7,
      'moyen': 1.0,
      'haut-de-gamme': 1.6,
      'luxe': 2.2
    }[profile.priceRange] || 1.0;

    return basePrice * zoneMultiplier * rangeMultiplier * (0.9 + Math.random() * 0.2);
  };

  const generateBenchmarkMargin = (profile) => {
    const baseMargin = {
      'économique': 45,
      'moyen': 58,
      'haut-de-gamme': 68,
      'luxe': 75
    }[profile.priceRange] || 58;

    return baseMargin + (Math.random() - 0.5) * 10;
  };

  const generateRecommendation = (price, benchmarkPrice, margin, benchmarkMargin) => {
    const priceDiff = ((price - benchmarkPrice) / benchmarkPrice) * 100;
    const marginDiff = margin - benchmarkMargin;

    if (priceDiff < -15) {
      return {
        type: 'price-increase',
        message: 'Prix significativement sous la moyenne',
        action: `Augmentez de ${Math.abs(priceDiff).toFixed(1)}% pour aligner sur le marché`,
        impact: 'high'
      };
    } else if (priceDiff > 20) {
      return {
        type: 'price-decrease',
        message: 'Prix au-dessus de la moyenne',
        action: 'Justifiez la valeur ajoutée ou réduisez légèrement',
        impact: 'medium'
      };
    } else if (marginDiff < -10) {
      return {
        type: 'margin-improve',
        message: 'Marge inférieure à la moyenne',
        action: 'Optimisez les coûts ou ajustez le prix',
        impact: 'high'
      };
    } else {
      return {
        type: 'optimal',
        message: 'Positionnement concurrentiel optimal',
        action: 'Maintenez cette stratégie',
        impact: 'low'
      };
    }
  };

  const calculateCompetitiveAdvantage = (recipes) => {
    const advantages = recipes.filter(r => r.benchmark.marginComparison > 5).length;
    const total = recipes.length;
    return (advantages / total) * 100;
  };

  const determineMarketPosition = (recipes) => {
    const avgPriceComparison = recipes.reduce((sum, r) => sum + r.benchmark.priceComparison, 0) / recipes.length;
    
    if (avgPriceComparison < -10) return 'Positionnement économique';
    if (avgPriceComparison > 15) return 'Positionnement premium';
    return 'Positionnement équilibré';
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    onProfileUpdate(profileForm);
    setShowProfileForm(false);
    performBenchmarkAnalysis();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (showProfileForm) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <InformationCircleIcon className="h-6 w-6 mr-2 text-blue-500" />
          Configuration du Benchmark
        </h3>
        
        <p className="text-gray-600 mb-6">
          Renseignez ces informations pour obtenir un benchmark précis par rapport à vos concurrents locaux
        </p>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Informations de votre restaurant
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Ville / Zone géographique *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Paris 1er, Lyon Part-Dieu, Marseille Vieux-Port..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  value={profileForm.zone}
                  onChange={(e) => setProfileForm({...profileForm, zone: e.target.value})}
                />
                <p className="text-xs text-gray-600">Soyez précis pour un benchmark optimal</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Type de cuisine *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Française traditionnelle, Italienne moderne, Fusion asiatique..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  value={profileForm.cuisineType}
                  onChange={(e) => setProfileForm({...profileForm, cuisineType: e.target.value})}
                />
                <p className="text-xs text-gray-600">Décrivez votre spécialité culinaire</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Gamme de prix *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Économique 10-15€, Premium 25-40€, Gastronomique 50€+..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  value={profileForm.priceRange}
                  onChange={(e) => setProfileForm({...profileForm, priceRange: e.target.value})}
                />
                <p className="text-xs text-gray-600">Indiquez votre positionnement tarifaire</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Type de service
                </label>
                <input
                  type="text"
                  placeholder="Ex: Service à table, Comptoir, Livraison, Food truck..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  value={profileForm.serviceType}
                  onChange={(e) => setProfileForm({...profileForm, serviceType: e.target.value})}
                />
                <p className="text-xs text-gray-600">Décrivez votre mode de service</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
            >
              <ChartBarIcon className="h-6 w-6" />
              <span>Lancer l'analyse benchmark IA</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <ChartBarIcon className="mx-auto h-12 w-12 text-blue-500 animate-pulse mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analyse benchmark en cours...</h3>
        <p className="text-gray-600">Comparaison avec {Math.floor(Math.random() * 50) + 20} restaurants similaires</p>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
        </div>
      </div>
    );
  }

  if (!benchmarkData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Benchmark Concurrentiel</h3>
        <p className="text-gray-600 mb-4">Configurez votre profil pour commencer l'analyse</p>
        <button
          onClick={() => setShowProfileForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Configurer le benchmark
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques globales */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3" />
              Benchmark Concurrentiel
            </h2>
            <p className="text-blue-100 mt-1">
              Comparaison avec {benchmarkData.sampleSize} restaurants similaires • {benchmarkData.zone} • {benchmarkData.cuisineType}
            </p>
          </div>
          <button
            onClick={() => setShowProfileForm(true)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            Modifier profil
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center">
              <CurrencyEuroIcon className="h-6 w-6 mr-2" />
              <div>
                <p className="text-sm text-blue-100">Position prix</p>
                <p className="text-xl font-bold">
                  {benchmarkData.globalStats.avgPriceDifference > 0 ? '+' : ''}
                  {benchmarkData.globalStats.avgPriceDifference.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-6 w-6 mr-2" />
              <div>
                <p className="text-sm text-blue-100">Avantage concurrentiel</p>
                <p className="text-xl font-bold">{benchmarkData.globalStats.competitiveAdvantage.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center">
              <MapPinIcon className="h-6 w-6 mr-2" />
              <div>
                <p className="text-sm text-blue-100">Position marché</p>
                <p className="text-sm font-bold">{benchmarkData.globalStats.marketPosition}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analyse détaillée par recette */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Analyse détaillée par plat</h3>
        
        <div className="space-y-4">
          {benchmarkData.recipes.map((recipe) => (
            <div key={recipe.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                  <p className="text-sm text-gray-600">{recipe.category}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    {recipe.benchmark.recommendation.impact === 'high' && (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      recipe.benchmark.recommendation.type === 'optimal' ? 'bg-green-100 text-green-800' :
                      recipe.benchmark.recommendation.impact === 'high' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {recipe.benchmark.recommendation.type === 'optimal' ? 'Optimal' :
                       recipe.benchmark.recommendation.impact === 'high' ? 'Action requise' : 'À surveiller'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Votre prix</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(recipe.price)}</p>
                  <p className="text-xs text-gray-500">
                    Marge: {recipe.margin.toFixed(1)}%
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-600">Prix moyen marché</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(recipe.benchmark.avgPrice)}</p>
                  <p className="text-xs text-blue-600">
                    Marge moyenne: {recipe.benchmark.avgMargin.toFixed(1)}%
                  </p>
                </div>

                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-sm text-purple-600">Écart</p>
                  <p className="text-lg font-bold text-purple-900">
                    {recipe.benchmark.priceComparison > 0 ? '+' : ''}
                    {recipe.benchmark.priceComparison.toFixed(1)}%
                  </p>
                  <p className="text-xs text-purple-600">
                    Marge: {recipe.benchmark.marginComparison > 0 ? '+' : ''}
                    {recipe.benchmark.marginComparison.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="font-medium text-yellow-800">{recipe.benchmark.recommendation.message}</p>
                <p className="text-sm text-yellow-700 mt-1">{recipe.benchmark.recommendation.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommandations globales */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommandations stratégiques</h3>
        
        <div className="space-y-3">
          {benchmarkData.globalStats.avgPriceDifference < -10 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800">Opportunité de revenus</h4>
              <p className="text-sm text-red-700 mt-1">
                Vos prix sont significativement inférieurs au marché. Une augmentation de 10-15% 
                pourrait générer +500€/mois de revenus supplémentaires.
              </p>
            </div>
          )}

          {benchmarkData.globalStats.competitiveAdvantage < 30 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800">Optimisation des marges</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Seulement {benchmarkData.globalStats.competitiveAdvantage.toFixed(0)}% de vos plats 
                ont un avantage concurrentiel. Focalisez-vous sur l'optimisation des coûts.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800">Position concurrentielle</h4>
            <p className="text-sm text-blue-700 mt-1">
              {benchmarkData.globalStats.marketPosition}. Cette stratégie est adaptée à votre zone 
              géographique et type de cuisine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkAnalyzer;