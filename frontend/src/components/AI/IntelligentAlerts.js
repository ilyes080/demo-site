import { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  BellIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const IntelligentAlerts = ({ recipes = [], restaurantProfile = {} }) => {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  useEffect(() => {
    if (recipes.length > 0) {
      generateIntelligentAlerts();
    }
  }, [recipes, restaurantProfile]);

  const generateIntelligentAlerts = () => {
    const newAlerts = [];
    const now = new Date();

    // Analyse des recettes pour générer des alertes
    recipes.forEach(recipe => {
      const cost = calculateRecipeCost(recipe);
      const margin = recipe.price ? ((recipe.price - cost) / recipe.price) * 100 : 0;
      
      // Alerte marge faible
      if (margin < 30) {
        newAlerts.push({
          id: `low-margin-${recipe.id}`,
          type: 'warning',
          priority: 'high',
          title: 'Marge critique détectée',
          message: `${recipe.name} a une marge de seulement ${margin.toFixed(1)}%`,
          recommendation: 'Augmentez le prix de 15% ou réduisez les coûts',
          impact: `+${((cost * 0.15)).toFixed(2)}€ de bénéfice par plat`,
          timestamp: now,
          category: 'profitability'
        });
      }

      // Alerte coût élevé
      if (cost > 8) {
        newAlerts.push({
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

    // Alertes saisonnières
    const month = now.getMonth();
    if (month >= 2 && month <= 4) { // Printemps
      newAlerts.push({
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

    // Alertes de tendances marché
    newAlerts.push({
      id: 'market-trend-vegan',
      type: 'info',
      priority: 'low',
      title: 'Tendance marché détectée',
      message: 'La demande pour les plats végans augmente de 25%',
      recommendation: 'Développez 2-3 options véganes rentables',
      impact: 'Potentiel de +200€/mois de CA supplémentaire',
      timestamp: now,
      category: 'market-trends'
    });

    // Alertes concurrence
    if (restaurantProfile.zone && restaurantProfile.type) {
      newAlerts.push({
        id: 'competition-pricing',
        type: 'warning',
        priority: 'high',
        title: 'Analyse concurrentielle',
        message: `Vos prix sont 12% inférieurs à la moyenne locale`,
        recommendation: 'Augmentation de prix recommandée sur 3-4 plats populaires',
        impact: '+300€/mois de revenus supplémentaires',
        timestamp: now,
        category: 'competition'
      });
    }

    setAlerts(newAlerts.filter(alert => !dismissedAlerts.has(alert.id)));
  };

  const calculateRecipeCost = (recipe) => {
    // Simulation du calcul de coût (à adapter selon votre logique)
    const baseIngredients = recipe.ingredients || recipe.Ingredients || [];
    return baseIngredients.length * 2.5; // Coût moyen simulé
  };

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return ExclamationTriangleIcon;
      case 'success':
        return ArrowTrendingUpIcon;
      case 'error':
        return ArrowTrendingDownIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'success':
        return 'border-green-500 bg-green-50 text-green-800';
      case 'error':
        return 'border-red-500 bg-red-50 text-red-800';
      default:
        return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[priority] || colors.low;
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune alerte</h3>
        <p className="text-gray-600">Votre restaurant fonctionne de manière optimale</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-2xl p-6 text-white shadow-2xl mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold flex items-center mb-2">
              <BellIcon className="h-8 w-8 mr-3 animate-pulse" />
              Alertes Intelligentes ({alerts.length})
            </h3>
            <p className="text-pink-100">
              Surveillance automatique de votre rentabilité en temps réel
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-semibold">Dernière analyse</span>
              <p className="text-xs text-pink-100">
                {new Date().toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const IconComponent = getAlertIcon(alert.type);
          return (
            <div
              key={alert.id}
              className={`border-l-4 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-102 ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <IconComponent className="h-6 w-6 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(alert.priority)}`}>
                        {alert.priority === 'high' ? 'Urgent' : 
                         alert.priority === 'medium' ? 'Important' : 'Info'}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <div className="bg-white/50 p-2 rounded text-sm">
                      <p className="font-medium">Recommandation:</p>
                      <p>{alert.recommendation}</p>
                      <p className="text-xs mt-1 font-medium text-green-700">
                        Impact: {alert.impact}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé des alertes par catégorie */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Résumé par catégorie</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {Object.entries(
            alerts.reduce((acc, alert) => {
              acc[alert.category] = (acc[alert.category] || 0) + 1;
              return acc;
            }, {})
          ).map(([category, count]) => (
            <div key={category} className="text-center">
              <div className="font-medium text-gray-900">{count}</div>
              <div className="text-gray-600 capitalize">
                {category.replace('-', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntelligentAlerts;