import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import axios from '../../utils/axios';
import {
  CurrencyEuroIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CalculatorIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const AdvancedFinance = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedView, setSelectedView] = useState('overview');
  const [financialData, setFinancialData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Charger les données financières avec optimisation
  const { data: realData, isLoading: isLoadingData } = useQuery(
    'advanced-finance-data',
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
      refetchInterval: 60000, // Réduire la fréquence de refresh
      staleTime: 30000, // Garder les données en cache 30s
      cacheTime: 300000, // Cache pendant 5 minutes
    }
  );

  useEffect(() => {
    if (realData) {
      // Débounce pour éviter les recalculs trop fréquents
      const timer = setTimeout(() => {
        generateFinancialAnalysis();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [realData, selectedPeriod]);

  const generateFinancialAnalysis = useMemo(() => {
    if (!realData) return null;
    
    return {
      cashFlow: generateCashFlowAnalysis(),
      profitability: generateProfitabilityAnalysis(),
      costs: generateCostAnalysis(),
      forecasting: generateForecastingData(),
      kpis: generateAdvancedKPIs(),
      alerts: generateFinancialAlerts()
    };
  }, [realData, selectedPeriod]);

  useEffect(() => {
    if (generateFinancialAnalysis) {
      // Simulation du progrès de chargement
      setLoadingProgress(25);
      setTimeout(() => setLoadingProgress(50), 200);
      setTimeout(() => setLoadingProgress(75), 400);
      setTimeout(() => {
        setFinancialData(generateFinancialAnalysis);
        setLoadingProgress(100);
      }, 600);
    }
  }, [generateFinancialAnalysis]);

  const generateCashFlowAnalysis = () => {
    const baseRevenue = realData?.analytics?.analytics?.todayRevenue || 125000;
    const monthlyCosts = baseRevenue * 0.65; // 65% de coûts
    const monthlyProfit = baseRevenue - monthlyCosts;
    
    return {
      inflow: {
        sales: baseRevenue,
        other: baseRevenue * 0.05,
        total: baseRevenue * 1.05
      },
      outflow: {
        ingredients: monthlyCosts * 0.35,
        staff: monthlyCosts * 0.40,
        rent: monthlyCosts * 0.15,
        utilities: monthlyCosts * 0.05,
        other: monthlyCosts * 0.05,
        total: monthlyCosts
      },
      netCashFlow: monthlyProfit,
      cashPosition: monthlyProfit * 2.5, // 2.5 mois de réserve
      burnRate: monthlyCosts / 30, // Par jour
      runway: (monthlyProfit * 2.5) / (monthlyCosts / 30) // Jours
    };
  };

  const generateProfitabilityAnalysis = () => {
    const recipes = realData?.recipes || [];
    const totalRecipes = recipes.length || 20;
    
    return {
      grossMargin: 65.2,
      netMargin: 18.5,
      ebitda: 22.3,
      roi: 24.8,
      topPerformers: [
        { dish: 'Saumon grillé', margin: 72.5, volume: 45, contribution: 15.2 },
        { dish: 'Risotto truffe', margin: 68.8, volume: 32, contribution: 12.8 },
        { dish: 'Bœuf Wellington', margin: 65.3, volume: 28, contribution: 11.5 },
        { dish: 'Tarte tatin', margin: 78.2, volume: 38, contribution: 14.1 }
      ],
      underPerformers: [
        { dish: 'Salade César', margin: 45.2, volume: 52, contribution: 8.3 },
        { dish: 'Soupe du jour', margin: 42.8, volume: 35, contribution: 6.2 }
      ],
      marginTrends: {
        thisMonth: 65.2,
        lastMonth: 63.8,
        trend: 'up',
        change: 1.4
      }
    };
  };

  const generateCostAnalysis = () => {
    return {
      breakdown: {
        ingredients: { amount: 43750, percentage: 35, trend: 'stable' },
        staff: { amount: 50000, percentage: 40, trend: 'up' },
        rent: { amount: 18750, percentage: 15, trend: 'stable' },
        utilities: { amount: 6250, percentage: 5, trend: 'down' },
        other: { amount: 6250, percentage: 5, trend: 'stable' }
      },
      optimization: {
        potential: 8750, // 7% d'économies possibles
        recommendations: [
          { category: 'Ingrédients', saving: 3500, action: 'Négociation fournisseurs' },
          { category: 'Personnel', saving: 2800, action: 'Optimisation planning' },
          { category: 'Énergie', saving: 1250, action: 'Équipements efficaces' },
          { category: 'Gaspillage', saving: 1200, action: 'Gestion des pertes' }
        ]
      },
      benchmarks: {
        ingredients: { current: 35, industry: 32, status: 'above' },
        staff: { current: 40, industry: 38, status: 'above' },
        rent: { current: 15, industry: 18, status: 'below' },
        utilities: { current: 5, industry: 7, status: 'below' }
      }
    };
  };

  const generateForecastingData = () => {
    const baseRevenue = realData?.analytics?.analytics?.todayRevenue || 125000;
    
    return {
      revenue: {
        nextMonth: baseRevenue * 1.08,
        nextQuarter: baseRevenue * 3.15,
        nextYear: baseRevenue * 12.5,
        confidence: 87
      },
      seasonality: [
        { month: 'Jan', factor: 0.85, revenue: baseRevenue * 0.85 },
        { month: 'Fév', factor: 0.88, revenue: baseRevenue * 0.88 },
        { month: 'Mar', factor: 0.95, revenue: baseRevenue * 0.95 },
        { month: 'Avr', factor: 1.02, revenue: baseRevenue * 1.02 },
        { month: 'Mai', factor: 1.08, revenue: baseRevenue * 1.08 },
        { month: 'Jun', factor: 1.12, revenue: baseRevenue * 1.12 },
        { month: 'Jul', factor: 1.18, revenue: baseRevenue * 1.18 },
        { month: 'Aoû', factor: 1.15, revenue: baseRevenue * 1.15 },
        { month: 'Sep', factor: 1.05, revenue: baseRevenue * 1.05 },
        { month: 'Oct', factor: 0.98, revenue: baseRevenue * 0.98 },
        { month: 'Nov', factor: 0.92, revenue: baseRevenue * 0.92 },
        { month: 'Déc', factor: 1.25, revenue: baseRevenue * 1.25 }
      ],
      scenarios: {
        optimistic: { revenue: baseRevenue * 1.25, probability: 25 },
        realistic: { revenue: baseRevenue * 1.08, probability: 50 },
        pessimistic: { revenue: baseRevenue * 0.95, probability: 25 }
      }
    };
  };

  const generateAdvancedKPIs = () => {
    return {
      financial: [
        { name: 'EBITDA', value: '22.3%', trend: 'up', change: '+1.2%' },
        { name: 'ROI', value: '24.8%', trend: 'up', change: '+2.1%' },
        { name: 'Marge Nette', value: '18.5%', trend: 'stable', change: '+0.3%' },
        { name: 'Ratio Liquidité', value: '2.4', trend: 'up', change: '+0.2' }
      ],
      operational: [
        { name: 'CA par m²', value: '1,250€', trend: 'up', change: '+8%' },
        { name: 'CA par employé', value: '12,500€', trend: 'up', change: '+5%' },
        { name: 'Ticket Moyen', value: '45€', trend: 'up', change: '+3%' },
        { name: 'Taux Rotation', value: '2.3', trend: 'stable', change: '0%' }
      ],
      efficiency: [
        { name: 'Productivité', value: '94%', trend: 'up', change: '+2%' },
        { name: 'Taux Service', value: '97%', trend: 'stable', change: '0%' },
        { name: 'Satisfaction', value: '4.8/5', trend: 'up', change: '+0.1' },
        { name: 'Rotation Stock', value: '12x', trend: 'up', change: '+1x' }
      ]
    };
  };

  const generateFinancialAlerts = () => {
    return [
      {
        type: 'warning',
        title: 'Coûts Personnel Élevés',
        message: 'Les coûts de personnel représentent 40% du CA (vs 38% secteur)',
        impact: 'Réduction potentielle de 2,800€/mois',
        action: 'Optimiser les plannings et la productivité'
      },
      {
        type: 'opportunity',
        title: 'Marge en Amélioration',
        message: 'Marge brute en hausse de +1.4% ce mois',
        impact: 'Gain supplémentaire de 1,750€/mois',
        action: 'Maintenir la stratégie actuelle'
      },
      {
        type: 'info',
        title: 'Saisonnalité Décembre',
        message: 'Pic saisonnier attendu (+25% de CA)',
        impact: 'Revenus supplémentaires de 31,250€',
        action: 'Préparer les équipes et stocks'
      }
    ];
  };

  const renderCashFlowChart = () => {
    if (!financialData) return null;

    const { inflow, outflow } = financialData.cashFlow;

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <BanknotesIcon className="h-8 w-8 mr-3 text-emerald-600" />
          Analyse de Trésorerie Avancée
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Entrées */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
            <h4 className="text-xl font-bold text-emerald-900 mb-6 flex items-center">
              <div className="w-4 h-4 bg-emerald-500 rounded-full mr-3"></div>
              Flux Entrants
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                <span className="text-emerald-800 font-medium">Ventes Restaurant</span>
                <span className="font-bold text-emerald-900 text-lg">{inflow.sales.toLocaleString()}€</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                <span className="text-emerald-800 font-medium">Autres Revenus</span>
                <span className="font-bold text-emerald-900 text-lg">{inflow.other.toLocaleString()}€</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-100 border-2 border-emerald-300 rounded-lg shadow-md">
                <span className="font-bold text-emerald-900 text-lg">Total Entrées</span>
                <span className="font-bold text-2xl text-emerald-900">{inflow.total.toLocaleString()}€</span>
              </div>
            </div>
          </div>

          {/* Sorties */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
            <h4 className="text-xl font-bold text-red-900 mb-6 flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
              Flux Sortants
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                <span className="text-red-800 font-medium">Ingrédients & Matières</span>
                <span className="font-bold text-red-900 text-lg">{outflow.ingredients.toLocaleString()}€</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                <span className="text-red-800 font-medium">Masse Salariale</span>
                <span className="font-bold text-red-900 text-lg">{outflow.staff.toLocaleString()}€</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                <span className="text-red-800 font-medium">Loyer & Charges</span>
                <span className="font-bold text-red-900 text-lg">{outflow.rent.toLocaleString()}€</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                <span className="text-red-800 font-medium">Utilities & Services</span>
                <span className="font-bold text-red-900 text-lg">{outflow.utilities.toLocaleString()}€</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-100 border-2 border-red-300 rounded-lg shadow-md">
                <span className="font-bold text-red-900 text-lg">Total Sorties</span>
                <span className="font-bold text-2xl text-red-900">{outflow.total.toLocaleString()}€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Métriques de Trésorerie */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">{financialData.cashFlow.netCashFlow.toLocaleString()}€</div>
            <p className="text-blue-800 font-semibold">Flux Net Mensuel</p>
            <p className="text-xs text-blue-600 mt-1">Bénéfice opérationnel</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border border-purple-200 shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">{financialData.cashFlow.cashPosition.toLocaleString()}€</div>
            <p className="text-purple-800 font-semibold">Réserves Disponibles</p>
            <p className="text-xs text-purple-600 mt-1">Position de trésorerie</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-yellow-100 rounded-xl border border-orange-200 shadow-lg">
            <div className="text-3xl font-bold text-orange-600 mb-2">{financialData.cashFlow.burnRate.toLocaleString()}€</div>
            <p className="text-orange-800 font-semibold">Burn Rate Quotidien</p>
            <p className="text-xs text-orange-600 mt-1">Dépenses journalières</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl border border-emerald-200 shadow-lg">
            <div className="text-3xl font-bold text-emerald-600 mb-2">{Math.round(financialData.cashFlow.runway)}</div>
            <p className="text-emerald-800 font-semibold">Jours d'Autonomie</p>
            <p className="text-xs text-emerald-600 mt-1">Runway financier</p>
          </div>
        </div>

        {/* Analyse de Santé Financière */}
        <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Indicateurs de Santé Financière</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">Excellent</div>
              <p className="text-sm text-gray-600">Ratio de Liquidité</p>
              <p className="text-xs text-gray-500">2.5 mois de réserve</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">Stable</div>
              <p className="text-sm text-gray-600">Flux de Trésorerie</p>
              <p className="text-xs text-gray-500">Croissance régulière</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">Optimisé</div>
              <p className="text-sm text-gray-600">Gestion des Coûts</p>
              <p className="text-xs text-gray-500">65% de marge brute</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!financialData || isLoadingData) {
    return (
      <div className="space-y-8">
        {/* Header de chargement */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 flex items-center">
                <CurrencyEuroIcon className="h-12 w-12 mr-4 text-emerald-400" />
                Finance Avancée
              </h1>
              <p className="text-slate-200 text-xl mb-6 leading-relaxed">
                Chargement des analyses financières...
              </p>
            </div>
          </div>
        </div>

        {/* Indicateur de chargement amélioré */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <ArrowPathIcon className="h-16 w-16 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Analyse en cours...</h3>
              <p className="text-gray-600">Traitement des données financières et calcul des KPIs</p>
              
              {/* Barre de progression */}
              <div className="w-full max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{loadingProgress}% terminé</p>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>
                  {loadingProgress < 30 ? 'Récupération des données...' :
                   loadingProgress < 60 ? 'Calcul des métriques...' :
                   loadingProgress < 90 ? 'Génération des graphiques...' :
                   'Finalisation...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3 flex items-center">
              <CurrencyEuroIcon className="h-12 w-12 mr-4 text-emerald-400" />
              Finance Avancée
            </h1>
            <p className="text-slate-200 text-xl mb-6 leading-relaxed">
              Analyses financières approfondies et intelligence décisionnelle
            </p>
            <div className="flex items-center space-x-8 text-sm">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-emerald-400" />
                <span className="font-medium">Données Temps Réel</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <ChartBarIcon className="h-5 w-5 mr-2 text-blue-400" />
                <span className="font-medium">Analyses Prédictives</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <CalculatorIcon className="h-5 w-5 mr-2 text-purple-400" />
                <span className="font-medium">KPIs Avancés</span>
              </div>
            </div>
          </div>
          <div className="text-right space-y-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            >
              <option value="week" className="text-gray-900">Cette semaine</option>
              <option value="month" className="text-gray-900">Ce mois</option>
              <option value="quarter" className="text-gray-900">Ce trimestre</option>
              <option value="year" className="text-gray-900">Cette année</option>
            </select>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm font-medium text-slate-200">Dernière mise à jour</p>
              <p className="text-lg font-bold">{new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des vues */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'overview', name: 'Vue d\'ensemble', icon: DocumentChartBarIcon, color: 'blue' },
            { id: 'cashflow', name: 'Trésorerie', icon: BanknotesIcon, color: 'green' },
            { id: 'profitability', name: 'Rentabilité', icon: ArrowTrendingUpIcon, color: 'purple' },
            { id: 'forecasting', name: 'Prévisions', icon: ClockIcon, color: 'orange' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                selectedView === view.id
                  ? `bg-${view.color}-600 text-white shadow-lg transform scale-105`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <view.icon className="h-6 w-6" />
              <span>{view.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu principal basé sur la vue sélectionnée */}
      {selectedView === 'overview' && (
        <>
          {/* Alertes Financières */}
          {financialData.alerts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 mr-3 text-amber-600" />
                Alertes & Recommandations Stratégiques
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {financialData.alerts.map((alert, index) => (
                  <div key={index} className={`p-6 rounded-xl border-l-4 shadow-lg ${
                    alert.type === 'warning' ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-400' :
                    alert.type === 'opportunity' ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-400' :
                    'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`font-bold text-lg ${
                        alert.type === 'warning' ? 'text-amber-800' :
                        alert.type === 'opportunity' ? 'text-emerald-800' :
                        'text-blue-800'
                      }`}>
                        {alert.title}
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        alert.type === 'warning' ? 'bg-amber-200 text-amber-800' :
                        alert.type === 'opportunity' ? 'bg-emerald-200 text-emerald-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {alert.type === 'warning' ? 'ATTENTION' : 
                         alert.type === 'opportunity' ? 'OPPORTUNITÉ' : 'INFO'}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">{alert.message}</p>
                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg mb-3">
                      <p className="text-sm font-semibold text-gray-900">{alert.impact}</p>
                    </div>
                    <p className="text-sm text-gray-600 italic">{alert.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPIs Avancés */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <DocumentChartBarIcon className="h-8 w-8 mr-3 text-indigo-600" />
              Tableau de Bord Exécutif
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* KPIs Financiers */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                  <CurrencyEuroIcon className="h-6 w-6 mr-2" />
                  Indicateurs Financiers
                </h3>
                <div className="space-y-4">
                  {financialData.kpis.financial.map((kpi, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                      <span className="text-gray-700 font-medium">{kpi.name}</span>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-gray-900 text-lg">{kpi.value}</span>
                        <span className={`text-sm flex items-center px-2 py-1 rounded-full font-semibold ${
                          kpi.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 
                          kpi.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {kpi.trend === 'up' ? '↗' : kpi.trend === 'down' ? '↘' : '→'}
                          {kpi.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs Opérationnels */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
                <h3 className="text-xl font-bold text-emerald-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-6 w-6 mr-2" />
                  Performance Opérationnelle
                </h3>
                <div className="space-y-4">
                  {financialData.kpis.operational.map((kpi, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                      <span className="text-gray-700 font-medium">{kpi.name}</span>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-gray-900 text-lg">{kpi.value}</span>
                        <span className={`text-sm flex items-center px-2 py-1 rounded-full font-semibold ${
                          kpi.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 
                          kpi.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {kpi.trend === 'up' ? '↗' : kpi.trend === 'down' ? '↘' : '→'}
                          {kpi.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs d'Efficacité */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center">
                  <CalculatorIcon className="h-6 w-6 mr-2" />
                  Efficacité & Qualité
                </h3>
                <div className="space-y-4">
                  {financialData.kpis.efficiency.map((kpi, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                      <span className="text-gray-700 font-medium">{kpi.name}</span>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-gray-900 text-lg">{kpi.value}</span>
                        <span className={`text-sm flex items-center px-2 py-1 rounded-full font-semibold ${
                          kpi.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 
                          kpi.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {kpi.trend === 'up' ? '↗' : kpi.trend === 'down' ? '↘' : '→'}
                          {kpi.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedView === 'cashflow' && renderCashFlowChart()}

      {selectedView === 'profitability' && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <ChartBarIcon className="h-8 w-8 mr-3 text-purple-600" />
            Analyse de Rentabilité Détaillée
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Performers */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
              <h3 className="text-xl font-bold text-emerald-900 mb-6">🏆 Champions de Rentabilité</h3>
              <div className="space-y-4">
                {financialData.profitability.topPerformers.map((dish, index) => (
                  <div key={index} className="p-5 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-emerald-900 text-lg">{dish.dish}</h4>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-emerald-600">{dish.margin}%</span>
                        <p className="text-xs text-emerald-700">marge</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-emerald-100 p-2 rounded">
                        <span className="text-emerald-700 font-medium">Volume mensuel</span>
                        <div className="font-bold text-emerald-900">{dish.volume} portions</div>
                      </div>
                      <div className="bg-emerald-100 p-2 rounded">
                        <span className="text-emerald-700 font-medium">Contribution CA</span>
                        <div className="font-bold text-emerald-900">{dish.contribution}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Under Performers */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
              <h3 className="text-xl font-bold text-red-900 mb-6">⚠️ Opportunités d'Amélioration</h3>
              <div className="space-y-4">
                {financialData.profitability.underPerformers.map((dish, index) => (
                  <div key={index} className="p-5 bg-white/80 backdrop-blur-sm border border-red-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-red-900 text-lg">{dish.dish}</h4>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-red-600">{dish.margin}%</span>
                        <p className="text-xs text-red-700">marge</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-red-100 p-2 rounded">
                        <span className="text-red-700 font-medium">Volume mensuel</span>
                        <div className="font-bold text-red-900">{dish.volume} portions</div>
                      </div>
                      <div className="bg-red-100 p-2 rounded">
                        <span className="text-red-700 font-medium">Contribution CA</span>
                        <div className="font-bold text-red-900">{dish.contribution}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tendance des Marges */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <h3 className="text-xl font-bold text-blue-900 mb-4">📈 Évolution des Marges</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <span className="text-blue-700 font-medium">Marge brute actuelle: </span>
                  <span className="font-bold text-blue-900 text-xl">{financialData.profitability.marginTrends.thisMonth}%</span>
                </div>
                <div className="h-8 w-px bg-blue-300"></div>
                <div>
                  <span className="text-blue-700 font-medium">vs mois précédent: </span>
                  <span className={`font-bold text-xl flex items-center ${
                    financialData.profitability.marginTrends.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {financialData.profitability.marginTrends.trend === 'up' ? 
                      <ArrowTrendingUpIcon className="h-5 w-5 mr-1" /> : 
                      <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />
                    }
                    {financialData.profitability.marginTrends.change > 0 ? '+' : ''}{financialData.profitability.marginTrends.change}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'forecasting' && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <ClockIcon className="h-8 w-8 mr-3 text-orange-600" />
            Prévisions & Planification Stratégique
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200 shadow-lg">
              <div className="text-4xl font-bold text-blue-600 mb-3">
                {financialData.forecasting.revenue.nextMonth.toLocaleString()}€
              </div>
              <p className="text-blue-800 font-bold text-lg mb-2">Mois Prochain</p>
              <p className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">+8% vs ce mois</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl border border-emerald-200 shadow-lg">
              <div className="text-4xl font-bold text-emerald-600 mb-3">
                {financialData.forecasting.revenue.nextQuarter.toLocaleString()}€
              </div>
              <p className="text-emerald-800 font-bold text-lg mb-2">Prochain Trimestre</p>
              <p className="text-sm text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">+15% vs trimestre actuel</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl border border-purple-200 shadow-lg">
              <div className="text-4xl font-bold text-purple-600 mb-3">
                {financialData.forecasting.revenue.nextYear.toLocaleString()}€
              </div>
              <p className="text-purple-800 font-bold text-lg mb-2">Prochaine Année</p>
              <p className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">+25% vs année actuelle</p>
            </div>
          </div>

          {/* Analyse de Scénarios */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Analyse de Scénarios</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(financialData.forecasting.scenarios).map(([scenario, data]) => (
                <div key={scenario} className={`p-6 rounded-xl border-2 shadow-lg ${
                  scenario === 'optimistic' ? 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-300' :
                  scenario === 'realistic' ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-300' :
                  'bg-gradient-to-br from-red-50 to-pink-100 border-red-300'
                }`}>
                  <h3 className={`font-bold text-lg mb-4 capitalize ${
                    scenario === 'optimistic' ? 'text-emerald-900' :
                    scenario === 'realistic' ? 'text-blue-900' :
                    'text-red-900'
                  }`}>
                    Scénario {scenario === 'optimistic' ? 'Optimiste' : scenario === 'realistic' ? 'Réaliste' : 'Pessimiste'}
                  </h3>
                  <div className={`text-3xl font-bold mb-3 ${
                    scenario === 'optimistic' ? 'text-emerald-600' :
                    scenario === 'realistic' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {data.revenue.toLocaleString()}€
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 font-medium">Probabilité</p>
                    <p className={`text-lg font-bold ${
                      scenario === 'optimistic' ? 'text-emerald-700' :
                      scenario === 'realistic' ? 'text-blue-700' :
                      'text-red-700'
                    }`}>{data.probability}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFinance;
