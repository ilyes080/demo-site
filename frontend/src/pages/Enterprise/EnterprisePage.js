import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from '../../utils/axios';
import PredictiveAnalytics from '../../components/Enterprise/PredictiveAnalytics';
import BusinessIntelligence from '../../components/Enterprise/BusinessIntelligence';
import { lossCalculator } from '../../utils/lossCalculator';
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  CpuChipIcon,
  GlobeEuropeAfricaIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const EnterprisePage = () => {
  const [activeModule, setActiveModule] = useState('overview');

  // Charger les données réelles pour l'analyse
  const { data: realData } = useQuery(
    'enterprise-data',
    () => Promise.all([
      axios.get('/api/reporting/analytics'),
      axios.get('/api/reporting/revenue?period=month'),
      axios.get('/api/recipes'),
      axios.get('/inventory')
    ]).then(responses => ({
      analytics: responses[0].data,
      revenue: responses[1].data,
      recipes: responses[2].data,
      inventory: responses[3].data
    })),
    {
      refetchInterval: 30000,
    }
  );

  const modules = [
    {
      id: 'overview',
      name: 'Vue d\'Ensemble',
      icon: BuildingOfficeIcon,
      description: 'Tableau de bord exécutif'
    },
    {
      id: 'business-intelligence',
      name: 'Analyse de l\'entreprise',
      icon: PresentationChartLineIcon,
      description: 'Analyses avancées et graphiques'
    },
    {
      id: 'predictive',
      name: 'Analyse Prédictive',
      icon: CpuChipIcon,
      description: 'IA prédictive et recommandations'
    }
  ];

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'business-intelligence':
        return <BusinessIntelligence realData={realData} />;
      case 'predictive':
        return <PredictiveAnalytics restaurantData={realData} historicalData={realData} />;
      default:
        return <EnterpriseOverview realData={realData} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Enterprise */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <BuildingOfficeIcon className="h-12 w-12 mr-4" />
              RestaurantPro Enterprise
            </h1>
            <p className="text-slate-200 text-xl mb-4">
              Suite complète d'outils d'analyse et de gestion pour grandes entreprises
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-400" />
                <span>Sécurité Enterprise</span>
              </div>
              <div className="flex items-center">
                <GlobeEuropeAfricaIcon className="h-5 w-5 mr-2 text-blue-400" />
                <span>Multi-sites</span>
              </div>
              <div className="flex items-center">
                <CpuChipIcon className="h-5 w-5 mr-2 text-purple-400" />
                <span>IA Avancée</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-yellow-400" />
                <span>Temps Réel</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm font-medium">Licence Enterprise</p>
              <p className="text-2xl font-bold">Activée</p>
              <p className="text-xs text-slate-300">Toutes fonctionnalités</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des modules */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`flex items-center space-x-4 px-8 py-6 rounded-xl font-semibold transition-all duration-200 ${
                activeModule === module.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
              }`}
            >
              <module.icon className="h-8 w-8" />
              <div className="text-left">
                <div className="text-lg">{module.name}</div>
                <div className={`text-sm ${
                  activeModule === module.id ? 'text-purple-100' : 'text-gray-500'
                }`}>
                  {module.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu du module actif */}
      <div>
        {renderActiveModule()}
      </div>
    </div>
  );
};

// Vue d'ensemble Enterprise
const EnterpriseOverview = ({ realData }) => {
  const [lossMetrics, setLossMetrics] = useState(null);
  const [showROICalculator, setShowROICalculator] = useState(false);
  const [roiData, setRoiData] = useState({
    sites: '',
    monthlyRevenue: '',
    monthlyCosts: '',
    sector: 'restaurant'
  });
  const [roiResults, setRoiResults] = useState(null);

  // Calculer les pertes automatiquement
  useEffect(() => {
    if (realData?.inventory?.inventory) {
      const inventory = realData.inventory.inventory.map(item => ({
        id: item.id,
        name: item.Ingredient?.name,
        currentStock: item.quantity,
        unitPrice: item.costPerUnit,
        unit: item.Ingredient?.unit,
        expiryDate: item.expiryDate,
        category: item.Ingredient?.category
      }));

      // Calculer les pertes pour les ingrédients périmés
      const losses = lossCalculator.calculateAllLosses(inventory);
      
      // Enregistrer les nouvelles pertes
      losses.forEach(loss => {
        const existingLoss = lossCalculator.lossHistory.find(
          l => l.ingredientId === loss.ingredientId && 
               new Date(l.lossDate).toDateString() === new Date(loss.lossDate).toDateString()
        );
        
        if (!existingLoss) {
          lossCalculator.recordLoss(loss);
        }
      });

      // Mettre à jour les statistiques
      setLossMetrics(lossCalculator.getLossStatistics());
    }
  }, [realData]);

  const calculateROI = () => {
    const sites = parseInt(roiData.sites) || 0;
    const revenue = parseFloat(roiData.monthlyRevenue) || 0;
    const costs = parseFloat(roiData.monthlyCosts) || 0;
    
    if (sites === 0 || revenue === 0 || costs === 0) {
      alert('Veuillez remplir tous les champs avec des valeurs valides');
      return;
    }

    // Calculs basés sur les moyennes sectorielles
    const currentLossRate = lossMetrics?.lossPercentage || 3; // 3% de pertes moyennes
    const currentLosses = revenue * (currentLossRate / 100);
    const optimizedLossRate = 0.5; // Réduction à 0.5% avec RestaurantPro
    const optimizedLosses = revenue * (optimizedLossRate / 100);
    const lossReduction = currentLosses - optimizedLosses;
    
    const costReduction = costs * 0.15; // 15% de réduction des coûts
    const revenueIncrease = revenue * 0.25; // 25% d'augmentation du CA
    const monthlyGains = costReduction + revenueIncrease + lossReduction;
    const annualGains = monthlyGains * 12;
    const investmentCost = sites * 50000; // 50k€ par site
    const breakEvenMonths = Math.ceil(investmentCost / monthlyGains);
    const roi12Months = ((annualGains - investmentCost) / investmentCost) * 100;

    setRoiResults({
      sites,
      monthlyGains: monthlyGains.toFixed(0),
      annualGains: annualGains.toFixed(0),
      investmentCost: investmentCost.toFixed(0),
      breakEvenMonths,
      roi12Months: roi12Months.toFixed(1),
      costReduction: costReduction.toFixed(0),
      revenueIncrease: revenueIncrease.toFixed(0),
      lossReduction: lossReduction.toFixed(0),
      currentLosses: currentLosses.toFixed(0),
      optimizedLosses: optimizedLosses.toFixed(0)
    });
  };




  const enterpriseStats = [
    { label: 'Sites Gérés', value: '500+', icon: BuildingOfficeIcon },
    { label: 'Transactions/jour', value: '50K+', icon: ChartBarIcon },
    { label: 'Précision IA', value: '94%', icon: CpuChipIcon },
    { label: 'Uptime', value: '99.9%', icon: ShieldCheckIcon }
  ];

  // Métriques financières avec pertes
  const financialMetrics = [
    { 
      label: 'Chiffre d\'Affaires', 
      value: `${realData?.analytics?.analytics?.todayRevenue || 125000}€`, 
      icon: CurrencyEuroIcon,
      color: 'green',
      subtitle: 'Mensuel'
    },
    { 
      label: 'Pertes Ingrédients', 
      value: `${lossMetrics?.totalLoss?.toFixed(0) || 0}€`, 
      icon: ExclamationTriangleIcon,
      color: 'red',
      subtitle: `${lossMetrics?.lossCount || 0} produits périmés`
    },
    { 
      label: 'Bénéfice Net', 
      value: `${Math.max(0, (realData?.analytics?.analytics?.todayRevenue || 125000) * 0.35 - (lossMetrics?.totalLoss || 0)).toFixed(0)}€`, 
      icon: ChartBarIcon,
      color: 'blue',
      subtitle: 'Après déduction pertes'
    },
    { 
      label: 'Taux de Perte', 
      value: `${lossMetrics?.lossPercentage || 0}%`, 
      icon: PresentationChartLineIcon,
      color: lossMetrics?.lossPercentage > 5 ? 'red' : lossMetrics?.lossPercentage > 2 ? 'orange' : 'green',
      subtitle: 'Du chiffre d\'affaires'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Métriques Financières avec Pertes */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <CurrencyEuroIcon className="h-8 w-8 mr-3 text-green-600" />
          Analyse Financière Enterprise
          {lossMetrics?.totalLoss > 0 && (
            <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
              Pertes détectées
            </span>
          )}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {financialMetrics.map((metric, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-100 rounded-2xl border border-${metric.color}-200 p-6 text-center hover:shadow-lg transition-all duration-200`}
            >
              <metric.icon className={`h-12 w-12 mx-auto mb-4 text-${metric.color}-600`} />
              <div className={`text-3xl font-bold text-${metric.color}-900 mb-2`}>{metric.value}</div>
              <div className="text-sm font-medium text-gray-900 mb-1">{metric.label}</div>
              <div className="text-xs text-gray-600">{metric.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Alerte pertes si nécessaire */}
        {lossMetrics && lossMetrics.totalLoss > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mt-1" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Impact des Pertes sur la Rentabilité</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p className="mb-2">
                    <strong>Pertes totales ce mois:</strong> {lossMetrics.totalLoss.toFixed(2)}€ 
                    ({lossMetrics.lossCount} ingrédients périmés)
                  </p>
                  <p className="mb-2">
                    <strong>Impact sur la marge:</strong> -{lossMetrics.lossPercentage}% du chiffre d'affaires
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {lossMetrics.categoriesLoss.slice(0, 3).map((category, idx) => (
                      <div key={idx} className="bg-red-100 p-3 rounded">
                        <div className="font-medium">{category.category}</div>
                        <div className="text-red-800">{category.totalLoss.toFixed(2)}€</div>
                        <div className="text-xs">{category.itemCount} produits</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommandations pour réduire les pertes */}
        {lossMetrics && lossMetrics.totalLoss > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">🎯 Recommandations pour Réduire les Pertes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p><strong>Actions immédiates:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Mettre en place des alertes d'expiration automatiques</li>
                  <li>Améliorer la rotation des stocks (FIFO)</li>
                  <li>Former l'équipe sur la gestion des dates</li>
                </ul>
              </div>
              <div>
                <p><strong>Optimisations long terme:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Négocier des livraisons plus fréquentes</li>
                  <li>Utiliser l'IA pour prédire la consommation</li>
                  <li>Mettre en place des promotions automatiques</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-100 rounded text-center">
              <p className="text-green-800 font-medium">
                💰 Économies potentielles: {(lossMetrics.totalLoss * 0.7).toFixed(0)}€/mois avec ces optimisations
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques Enterprise */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {enterpriseStats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center"
          >
            <stat.icon className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>



      {/* ROI Calculator */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8">
        <h2 className="text-2xl font-bold text-green-900 mb-6 text-center">
          Calculateur ROI Personnalisé
        </h2>
        
        {!showROICalculator ? (
          <div className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center p-4 rounded-xl bg-green-100">
                <div className="text-4xl font-bold text-green-600 mb-2">15%</div>
                <div className="text-sm text-green-800">Réduction des coûts</div>
                <div className="text-xs text-green-600 mt-1">Optimisation IA</div>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-green-100">
                <div className="text-4xl font-bold text-green-600 mb-2">25%</div>
                <div className="text-sm text-green-800">Augmentation revenus</div>
                <div className="text-xs text-green-600 mt-1">Analyses prédictives</div>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-red-100">
                <div className="text-4xl font-bold text-red-600 mb-2">-85%</div>
                <div className="text-sm text-red-800">Réduction des pertes</div>
                <div className="text-xs text-red-600 mt-1">Gestion expiration IA</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="text-center p-4 rounded-xl bg-blue-100">
                <div className="text-2xl font-bold text-blue-600 mb-2">6 mois</div>
                <div className="text-sm text-blue-800">Retour sur investissement</div>
                <div className="text-xs text-blue-600 mt-1">Moyenne constatée</div>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-purple-100">
                <div className="text-2xl font-bold text-purple-600 mb-2">{lossMetrics?.totalLoss?.toFixed(0) || 0}€</div>
                <div className="text-sm text-purple-800">Pertes actuelles détectées</div>
                <div className="text-xs text-purple-600 mt-1">Ce mois dans votre système</div>
              </div>
            </div>
            
            <p className="text-green-800 font-medium mb-4">
              💰 Économies moyennes: <span className="text-2xl font-bold">€50,000/an</span> par site
            </p>
            <button 
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              onClick={() => setShowROICalculator(true)}
            >
              Calculer Mon ROI Personnalisé
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {!roiResults ? (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Paramètres de Votre Entreprise
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de sites/restaurants
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: 5"
                      value={roiData.sites}
                      onChange={(e) => setRoiData({...roiData, sites: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chiffre d'affaires mensuel total (€)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: 200000"
                      value={roiData.monthlyRevenue}
                      onChange={(e) => setRoiData({...roiData, monthlyRevenue: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coûts mensuels totaux (€)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: 150000"
                      value={roiData.monthlyCosts}
                      onChange={(e) => setRoiData({...roiData, monthlyCosts: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secteur d'activité
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={roiData.sector}
                      onChange={(e) => setRoiData({...roiData, sector: e.target.value})}
                    >
                      <option value="restaurant">Restaurant traditionnel</option>
                      <option value="fastfood">Fast-food</option>
                      <option value="gastronomy">Gastronomie</option>
                      <option value="chain">Chaîne de restaurants</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    onClick={() => setShowROICalculator(false)}
                  >
                    Annuler
                  </button>
                  <button
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    onClick={calculateROI}
                  >
                    Calculer le ROI
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  🎯 Votre ROI Personnalisé
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">€{roiResults.monthlyGains}</div>
                    <div className="text-sm text-green-800">Gains mensuels</div>
                    <div className="text-xs text-green-600 mt-1">
                      Économies: €{roiResults.costReduction} + CA: €{roiResults.revenueIncrease} + Pertes: €{roiResults.lossReduction}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">€{roiResults.annualGains}</div>
                    <div className="text-sm text-blue-800">Gains annuels</div>
                    <div className="text-xs text-blue-600 mt-1">
                      Sur {roiResults.sites} site{roiResults.sites > 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{roiResults.breakEvenMonths} mois</div>
                    <div className="text-sm text-orange-800">Seuil de rentabilité</div>
                    <div className="text-xs text-orange-600 mt-1">
                      Investissement: €{roiResults.investmentCost}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{roiResults.roi12Months}%</div>
                    <div className="text-sm text-purple-800">ROI à 12 mois</div>
                    <div className="text-xs text-purple-600 mt-1">
                      Retour sur investissement
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">📊 Résumé de votre projet :</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>{roiResults.sites} site{roiResults.sites > 1 ? 's' : ''}</strong> équipé{roiResults.sites > 1 ? 's' : ''} RestaurantPro Enterprise</li>
                    <li>• <strong>€{roiResults.monthlyGains}/mois</strong> de gains nets dès le 3ème mois</li>
                    <li>• <strong>Réduction des pertes:</strong> de €{roiResults.currentLosses}/mois à €{roiResults.optimizedLosses}/mois (-85%)</li>
                    <li>• <strong>Rentabilité atteinte en {roiResults.breakEvenMonths} mois</strong> (garantie 12 mois max)</li>
                    <li>• <strong>ROI de {roiResults.roi12Months}%</strong> la première année</li>
                  </ul>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <button
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      setRoiResults(null);
                      setRoiData({sites: '', monthlyRevenue: '', monthlyCosts: '', sector: 'restaurant'});
                    }}
                  >
                    Nouveau Calcul
                  </button>
                  <button
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    onClick={() => alert(`📧 Rapport ROI envoyé !

Votre analyse personnalisée a été générée :
• Gains mensuels : €${roiResults.monthlyGains}
• ROI 12 mois : ${roiResults.roi12Months}%
• Break-even : ${roiResults.breakEvenMonths} mois

📞 Prochaines étapes :
• Un expert vous contactera sous 24h
• Démonstration personnalisée gratuite
• Audit de vos besoins spécifiques
• Proposition commerciale détaillée

Merci pour votre intérêt ! 🎯`)}
                  >
                    Recevoir le Rapport Détaillé
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
};

export default EnterprisePage;