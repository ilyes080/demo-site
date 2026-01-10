import { useState, useEffect } from 'react';
import {
  LightBulbIcon,
  SparklesIcon,
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const DishSuggestions = ({ ingredients = [], restaurantProfile = {}, existingRecipes = [] }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => {
    if (ingredients.length > 0 && restaurantProfile.zone) {
      generateDishSuggestions();
    }
  }, [ingredients, restaurantProfile, existingRecipes]);

  const generateDishSuggestions = () => {
    setIsGenerating(true);
    
    // Simulation de génération IA (en production, cela ferait appel à une vraie IA)
    setTimeout(() => {
      const newSuggestions = generateIntelligentSuggestions();
      setSuggestions(newSuggestions);
      setIsGenerating(false);
    }, 2500);
  };

  const generateIntelligentSuggestions = () => {
    const availableIngredients = ingredients.map(ing => ing.name);
    const existingDishes = existingRecipes.map(recipe => recipe.name.toLowerCase());
    
    // Base de données de suggestions intelligentes et réalistes
    const suggestionTemplates = [
      // Plats tendance et rentables
      {
        name: 'Bowl Buddha Quinoa Bio',
        category: 'healthy',
        description: 'Bowl équilibré avec quinoa bio, avocat, légumes croquants, graines et sauce tahini maison',
        requiredIngredients: ['Quinoa', 'Avocat', 'Tomates cerises', 'Concombre', 'Épinards'],
        optionalIngredients: ['Graines de tournesol', 'Feta', 'Pousses de radis'],
        estimatedCost: 4.80,
        suggestedPrice: 16.90,
        margin: 72,
        preparationTime: 12,
        difficulty: 'easy',
        popularity: 89,
        trend: 'rising',
        reasons: [
          'Tendance healthy explosive : +45% de demande en 2024',
          'Marge exceptionnelle de 72% grâce aux légumes',
          'Préparation ultra-rapide, idéal pour le rush',
          'Instagram-friendly, génère du bouche-à-oreille',
          'Clientèle fidèle et récurrente'
        ]
      },
      {
        name: 'Risotto Champignons & Truffe d\'Été',
        category: 'gastronomic',
        description: 'Risotto crémeux aux champignons de saison, parmesan 24 mois et huile de truffe d\'été',
        requiredIngredients: ['Riz arborio', 'Champignons de Paris', 'Parmesan', 'Bouillon de légumes'],
        optionalIngredients: ['Champignons shiitake', 'Huile de truffe', 'Persil plat'],
        estimatedCost: 7.20,
        suggestedPrice: 24.50,
        margin: 71,
        preparationTime: 22,
        difficulty: 'medium',
        popularity: 82,
        trend: 'stable',
        reasons: [
          'Plat signature qui fidélise la clientèle premium',
          'Marge de 71% grâce à la perception de valeur',
          'Technique maîtrisable par toute l\'équipe',
          'Ingrédients disponibles toute l\'année',
          'Prix justifié par l\'expérience gastronomique'
        ]
      },
      {
        name: 'Tacos Végétariens Gourmet',
        category: 'fusion',
        description: 'Trio de tacos aux légumes grillés, haricots noirs épicés, guacamole maison et salsa verde',
        requiredIngredients: ['Tortillas de maïs', 'Haricots noirs', 'Avocat', 'Tomates', 'Oignons'],
        optionalIngredients: ['Poivrons colorés', 'Coriandre fraîche', 'Fromage frais', 'Piment jalapeño'],
        estimatedCost: 4.20,
        suggestedPrice: 13.90,
        margin: 70,
        preparationTime: 15,
        difficulty: 'easy',
        popularity: 94,
        trend: 'rising',
        reasons: [
          'Explosion de la demande végétarienne : +60% en 2024',
          'Marge de 70% avec des ingrédients économiques',
          'Plat photogénique parfait pour les réseaux sociaux',
          'Préparation simple, formation équipe facile',
          'Clientèle jeune et fidèle, commandes récurrentes'
        ]
      },
      {
        name: 'Saumon Teriyaki & Légumes Croquants',
        category: 'asian',
        description: 'Pavé de saumon norvégien laqué teriyaki, wok de légumes croquants et riz basmati parfumé',
        requiredIngredients: ['Saumon frais', 'Riz basmati', 'Courgettes', 'Carottes', 'Sauce soja'],
        optionalIngredients: ['Brocolis', 'Graines de sésame', 'Gingembre frais', 'Oignons verts'],
        estimatedCost: 9.50,
        suggestedPrice: 22.90,
        margin: 59,
        preparationTime: 20,
        difficulty: 'medium',
        popularity: 86,
        trend: 'stable',
        reasons: [
          'Cuisine asiatique en forte demande (+25% depuis 2023)',
          'Perception de qualité élevée justifie le prix',
          'Équilibre parfait protéines/légumes/féculents',
          'Technique de cuisson valorisante pour l\'équipe',
          'Plat signature qui différencie de la concurrence'
        ]
      },
      {
        name: 'Burger Végétal "Beyond Taste"',
        category: 'vegan',
        description: 'Burger 100% végétal avec steak de légumineuses épicé, avocat, roquette et sauce barbecue vegan',
        requiredIngredients: ['Pain burger artisanal', 'Haricots rouges', 'Avocat', 'Roquette', 'Tomates'],
        optionalIngredients: ['Oignons caramélisés', 'Cornichons', 'Sauce barbecue vegan', 'Graines de tournesol'],
        estimatedCost: 4.90,
        suggestedPrice: 15.90,
        margin: 69,
        preparationTime: 12,
        difficulty: 'easy',
        popularity: 83,
        trend: 'rising',
        reasons: [
          'Marché végan en explosion : +55% de croissance en 2024',
          'Marge de 69% avec des ingrédients économiques',
          'Différenciation forte face à la concurrence traditionnelle',
          'Attire une nouvelle clientèle engagée et fidèle',
          'Préparation simple, pas de formation complexe requise'
        ]
      },
      {
        name: 'Poke Bowl Thon Rouge Premium',
        category: 'healthy',
        description: 'Bowl hawaïen authentique avec thon rouge mariné soja-sésame, riz vinaigré, avocat et légumes croquants',
        requiredIngredients: ['Thon rouge', 'Riz sushi', 'Avocat', 'Concombre', 'Edamame'],
        optionalIngredients: ['Algues wakame', 'Graines de sésame', 'Radis', 'Sauce ponzu'],
        estimatedCost: 8.90,
        suggestedPrice: 19.90,
        margin: 55,
        preparationTime: 15,
        difficulty: 'easy',
        popularity: 91,
        trend: 'rising',
        reasons: [
          'Tendance poke bowl en pleine expansion (+40% en 2024)',
          'Plat premium qui justifie un prix élevé',
          'Préparation rapide, idéal pour le service midi',
          'Très photogénique, marketing naturel sur Instagram',
          'Clientèle urbaine aisée, récurrence élevée'
        ]
      },
      {
        name: 'Curry de Légumes Coco-Coriandre',
        category: 'fusion',
        description: 'Curry végétarien aux légumes de saison, lait de coco onctueux, riz basmati et naan maison',
        requiredIngredients: ['Lait de coco', 'Courgettes', 'Aubergines', 'Tomates', 'Riz basmati'],
        optionalIngredients: ['Épinards', 'Pois chiches', 'Coriandre fraîche', 'Pain naan'],
        estimatedCost: 3.80,
        suggestedPrice: 14.50,
        margin: 74,
        preparationTime: 18,
        difficulty: 'easy',
        popularity: 79,
        trend: 'rising',
        reasons: [
          'Cuisine fusion très tendance, clientèle curieuse',
          'Marge exceptionnelle de 74% grâce aux légumes',
          'Plat réconfortant, parfait pour toutes saisons',
          'Végétarien mais copieux, satisfait tous les profils',
          'Arômes exotiques qui fidélisent la clientèle'
        ]
      },
      {
        name: 'Salade César Revisitée au Poulet Grillé',
        category: 'healthy',
        description: 'Salade César moderne avec poulet fermier grillé, croûtons artisanaux, parmesan et sauce César allégée',
        requiredIngredients: ['Salade romaine', 'Poulet fermier', 'Parmesan', 'Pain de mie'],
        optionalIngredients: ['Anchois', 'Câpres', 'Tomates cerises', 'Avocat'],
        estimatedCost: 5.20,
        suggestedPrice: 16.90,
        margin: 69,
        preparationTime: 10,
        difficulty: 'easy',
        popularity: 87,
        trend: 'stable',
        reasons: [
          'Classique indémodable avec une touche moderne',
          'Marge solide de 69% avec des ingrédients simples',
          'Préparation ultra-rapide, parfait pour le rush',
          'Plat sain qui attire la clientèle health-conscious',
          'Valeur sûre qui rassure les clients indécis'
        ]
      }
    ];

    // Filtrer les suggestions basées sur les ingrédients disponibles et éviter les doublons
    const viableSuggestions = suggestionTemplates.filter(suggestion => {
      // Vérifier si le plat n'existe pas déjà
      if (existingDishes.includes(suggestion.name.toLowerCase())) {
        return false;
      }

      // Vérifier la disponibilité des ingrédients requis
      const availableRequired = suggestion.requiredIngredients.filter(ing => 
        availableIngredients.some(available => 
          available.toLowerCase().includes(ing.toLowerCase()) || 
          ing.toLowerCase().includes(available.toLowerCase())
        )
      );

      // Au moins 70% des ingrédients requis doivent être disponibles
      return availableRequired.length >= suggestion.requiredIngredients.length * 0.7;
    });

    // Ajouter des données contextuelles basées sur le profil du restaurant
    return viableSuggestions.map(suggestion => ({
      ...suggestion,
      id: `suggestion-${Date.now()}-${Math.random()}`,
      competitorAnalysis: generateCompetitorAnalysis(suggestion, restaurantProfile),
      marketFit: calculateMarketFit(suggestion, restaurantProfile),
      seasonality: getSeasonalityScore(suggestion),
      implementationEase: calculateImplementationEase(suggestion, availableIngredients)
    })).sort((a, b) => {
      // Trier par score global (popularité + marge + facilité d'implémentation)
      const scoreA = (a.popularity + a.margin + a.implementationEase) / 3;
      const scoreB = (b.popularity + b.margin + b.implementationEase) / 3;
      return scoreB - scoreA;
    });
  };

  const generateCompetitorAnalysis = (suggestion, profile) => {
    // Simulation d'analyse concurrentielle
    const competitorPrice = suggestion.suggestedPrice * (0.85 + Math.random() * 0.3);
    const marketGap = Math.random() > 0.7;
    
    return {
      avgCompetitorPrice: competitorPrice,
      marketGap: marketGap,
      competitiveAdvantage: suggestion.suggestedPrice < competitorPrice ? 'price' : 'quality',
      analysis: marketGap 
        ? 'Peu de concurrents proposent ce plat dans votre zone'
        : 'Plat populaire chez vos concurrents, opportunité de différenciation'
    };
  };

  const calculateMarketFit = (suggestion, profile) => {
    // Score basé sur le type de cuisine et la gamme de prix
    let score = 70; // Score de base
    
    if (profile.cuisineType === 'française' && suggestion.category === 'gastronomic') score += 20;
    if (profile.cuisineType === 'asiatique' && suggestion.category === 'asian') score += 25;
    if (profile.priceRange === 'haut-de-gamme' && suggestion.margin > 65) score += 15;
    if (profile.priceRange === 'économique' && suggestion.estimatedCost < 5) score += 15;
    
    return Math.min(score, 100);
  };

  const getSeasonalityScore = (suggestion) => {
    const month = new Date().getMonth();
    const season = Math.floor(month / 3); // 0: hiver, 1: printemps, 2: été, 3: automne
    
    // Scores saisonniers simplifiés
    const seasonalScores = {
      'healthy': [60, 85, 95, 70], // Plus populaire au printemps/été
      'gastronomic': [90, 70, 60, 85], // Plus populaire en hiver/automne
      'fusion': [80, 80, 80, 80], // Stable toute l'année
      'asian': [75, 80, 85, 80],
      'vegan': [70, 90, 85, 75]
    };
    
    return seasonalScores[suggestion.category]?.[season] || 75;
  };

  const calculateImplementationEase = (suggestion, availableIngredients) => {
    const requiredCount = suggestion.requiredIngredients.length;
    const availableCount = suggestion.requiredIngredients.filter(ing => 
      availableIngredients.some(available => 
        available.toLowerCase().includes(ing.toLowerCase())
      )
    ).length;
    
    const availabilityScore = (availableCount / requiredCount) * 100;
    const difficultyScore = suggestion.difficulty === 'easy' ? 100 : 
                           suggestion.difficulty === 'medium' ? 75 : 50;
    const timeScore = suggestion.preparationTime <= 15 ? 100 : 
                     suggestion.preparationTime <= 25 ? 80 : 60;
    
    return (availabilityScore + difficultyScore + timeScore) / 3;
  };

  const categories = [
    { id: 'all', name: 'Toutes', icon: SparklesIcon },
    { id: 'healthy', name: 'Healthy', icon: StarIcon },
    { id: 'gastronomic', name: 'Gastronomique', icon: StarIcon },
    { id: 'fusion', name: 'Fusion', icon: ArrowTrendingUpIcon },
    { id: 'asian', name: 'Asiatique', icon: ArrowTrendingUpIcon },
    { id: 'vegan', name: 'Végétal', icon: StarIcon }
  ];

  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getTrendIcon = (trend) => {
    return trend === 'rising' ? ArrowTrendingUpIcon : StarIcon;
  };

  const getTrendColor = (trend) => {
    return trend === 'rising' ? 'text-green-500' : 'text-blue-500';
  };

  if (isGenerating) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <LightBulbIcon className="mx-auto h-12 w-12 text-yellow-500 animate-pulse mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">IA en cours de génération...</h3>
        <p className="text-gray-600">Analyse de vos ingrédients et des tendances marché</p>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div className="bg-yellow-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center mb-2">
              <LightBulbIcon className="h-10 w-10 mr-4 animate-bounce" />
              Suggestions IA de Plats Rentables
            </h2>
            <p className="text-amber-100 text-lg">
              {suggestions.length} suggestions personnalisées basées sur vos ingrédients et les tendances marché
            </p>
            <div className="flex items-center mt-3 space-x-4">
              <div className="flex items-center text-amber-200">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">IA Créative</span>
              </div>
              <div className="flex items-center text-amber-200">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm">Tendances 2024</span>
              </div>
            </div>
          </div>
          <button
            onClick={generateDishSuggestions}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            ✨ Régénérer
          </button>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Grille des suggestions */}
      {filteredSuggestions.length === 0 ? (
        <div className="text-center py-12">
          <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune suggestion disponible</h3>
          <p className="text-gray-500">
            Ajoutez plus d'ingrédients ou configurez votre profil restaurant
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSuggestions.map((suggestion) => {
            const TrendIconComponent = getTrendIcon(suggestion.trend);
            return (
              <div
                key={suggestion.id}
                className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-2xl hover:border-orange-200 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1"
                onClick={() => setSelectedSuggestion(suggestion)}
              >
                {/* Header de la suggestion */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-gray-900 mr-3">
                        {suggestion.name}
                      </h3>
                      <TrendIconComponent className={`h-6 w-6 ${getTrendColor(suggestion.trend)} animate-pulse`} />
                    </div>
                    <p className="text-gray-600 leading-relaxed">{suggestion.description}</p>
                  </div>
                  <div className="ml-4">
                    <span className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 px-3 py-2 rounded-full text-sm font-semibold shadow-sm">
                      {suggestion.category}
                    </span>
                  </div>
                </div>

                {/* Métriques clés */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-100">
                    <div className="flex items-center justify-center mb-2">
                      <CurrencyEuroIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-semibold text-gray-800">Marge</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{suggestion.margin}%</p>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                        style={{width: `${suggestion.margin}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
                    <div className="flex items-center justify-center mb-2">
                      <StarIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-semibold text-gray-800">Popularité</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{suggestion.popularity}%</p>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                        style={{width: `${suggestion.popularity}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-100">
                    <div className="flex items-center justify-center mb-2">
                      <ClockIcon className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm font-semibold text-gray-800">Temps</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{suggestion.preparationTime}min</p>
                    <div className="flex justify-center mt-2">
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        {suggestion.difficulty === 'easy' ? 'Facile' : suggestion.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Analyse financière */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Coût estimé:</span>
                    <span className="font-medium">{formatCurrency(suggestion.estimatedCost)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Prix suggéré:</span>
                    <span className="font-medium">{formatCurrency(suggestion.suggestedPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bénéfice par plat:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(suggestion.suggestedPrice - suggestion.estimatedCost)}
                    </span>
                  </div>
                </div>

                {/* Raisons principales */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Pourquoi ce plat ?</h4>
                  <ul className="space-y-1">
                    {suggestion.reasons.slice(0, 2).map((reason, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Adéquation marché</span>
                      <span>{suggestion.marketFit}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{width: `${suggestion.marketFit}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Facilité mise en œuvre</span>
                      <span>{Math.round(suggestion.implementationEase)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{width: `${suggestion.implementationEase}%`}}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Bouton d'action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSuggestion(suggestion);
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PlusIcon className="h-5 w-5 mr-3" />
                  Voir les détails complets
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de détail */}
      {selectedSuggestion && (
        <SuggestionDetailModal
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
          onImplement={(suggestion) => {
            // Ici vous pourriez rediriger vers la création de recette
            console.log('Implémenter:', suggestion);
            setSelectedSuggestion(null);
          }}
        />
      )}
    </div>
  );
};

// Modal de détail pour une suggestion
const SuggestionDetailModal = ({ suggestion, onClose, onImplement }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{suggestion.name}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Fermer</span>
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations générales */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{suggestion.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ingrédients requis</h4>
                  <div className="space-y-1">
                    {suggestion.requiredIngredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {ingredient}
                      </div>
                    ))}
                  </div>
                </div>

                {suggestion.optionalIngredients.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ingrédients optionnels</h4>
                    <div className="space-y-1">
                      {suggestion.optionalIngredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                          {ingredient}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex items-center mb-1">
                      <ClockIcon className="h-4 w-4 text-gray-600 mr-1" />
                      <span className="text-sm font-medium">Préparation</span>
                    </div>
                    <p className="text-lg font-bold">{suggestion.preparationTime} min</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex items-center mb-1">
                      <UsersIcon className="h-4 w-4 text-gray-600 mr-1" />
                      <span className="text-sm font-medium">Difficulté</span>
                    </div>
                    <p className="text-lg font-bold capitalize">{suggestion.difficulty}</p>
                  </div>
                </div>
              </div>

              {/* Analyse financière et concurrentielle */}
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">Analyse financière</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Coût estimé:</span>
                      <span className="font-medium">{formatCurrency(suggestion.estimatedCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Prix suggéré:</span>
                      <span className="font-medium">{formatCurrency(suggestion.suggestedPrice)}</span>
                    </div>
                    <div className="flex justify-between border-t border-green-200 pt-2">
                      <span className="text-sm font-medium text-green-800">Marge:</span>
                      <span className="font-bold text-green-800">{suggestion.margin}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-green-800">Bénéfice/plat:</span>
                      <span className="font-bold text-green-800">
                        {formatCurrency(suggestion.suggestedPrice - suggestion.estimatedCost)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">Analyse concurrentielle</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Prix concurrent moyen:</span>
                      <span className="font-medium">{formatCurrency(suggestion.competitorAnalysis.avgCompetitorPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Avantage:</span>
                      <span className="font-medium capitalize">{suggestion.competitorAnalysis.competitiveAdvantage}</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      {suggestion.competitorAnalysis.analysis}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Pourquoi ce plat ?</h4>
                  <ul className="space-y-2">
                    {suggestion.reasons.map((reason, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Popularité</p>
                    <p className="text-lg font-bold text-blue-600">{suggestion.popularity}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Saisonnalité</p>
                    <p className="text-lg font-bold text-purple-600">{suggestion.seasonality}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Facilité</p>
                    <p className="text-lg font-bold text-green-600">{Math.round(suggestion.implementationEase)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => onImplement(suggestion)}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Créer cette recette
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishSuggestions;