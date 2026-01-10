import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  CurrencyEuroIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { lossCalculator } from '../../utils/lossCalculator';

const Dashboard = () => {
  const { user } = useAuth();
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [showSitesModal, setShowSitesModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [lossMetrics, setLossMetrics] = useState(null);
  
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    () => axios.get('/api/dashboard').then(res => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Charger les vraies données de reporting
  const { data: realRevenueData } = useQuery(
    'real-revenue',
    () => axios.get('/api/reporting/revenue?period=today').then(res => res.data),
    {
      refetchInterval: 10000, // Refresh every 10 seconds for real data
    }
  );

  const { data: realAnalytics } = useQuery(
    'real-analytics',
    () => axios.get('/api/reporting/analytics').then(res => res.data),
    {
      refetchInterval: 10000,
    }
  );

  // Charger les données d'inventaire pour calculer les pertes
  const { data: inventoryData } = useQuery(
    'inventory',
    () => axios.get('/inventory').then(res => res.data),
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  // Calculer les pertes automatiquement
  useEffect(() => {
    if (inventoryData?.inventory) {
      const inventory = inventoryData.inventory.map(item => ({
        id: item.id,
        name: item.Ingredient?.name,
        currentStock: item.quantity,
        unitPrice: item.costPerUnit,
        unit: item.Ingredient?.unit,
        expiryDate: item.expiryDate,
        category: item.Ingredient?.category
      }));

      // Calculer les pertes et mettre à jour les métriques financières
      const losses = lossCalculator.calculateAllLosses(inventory);
      losses.forEach(loss => {
        const existingLoss = lossCalculator.lossHistory.find(
          l => l.ingredientId === loss.ingredientId && 
               new Date(l.lossDate).toDateString() === new Date(loss.lossDate).toDateString()
        );
        
        if (!existingLoss) {
          lossCalculator.recordLoss(loss);
        }
      });

      setLossMetrics(lossCalculator.getLossStatistics());
    }
  }, [inventoryData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const isChain = user?.restaurant?.type === 'chain';
  const isGastronomy = user?.restaurant?.type === 'gastronomy';

  // Utiliser les vraies données si disponibles, sinon les données de démo
  const realStats = realAnalytics?.analytics || {};
  const realRevenue = realRevenueData?.data || {};
  const financialMetrics = lossCalculator.getFinancialMetrics();
  
  // Ajuster les métriques avec les pertes calculées
  const baseRevenue = realStats.todayRevenue || stats.revenue || 2450;
  const totalLosses = lossMetrics?.totalLoss || 0;
  const adjustedRevenue = Math.max(0, baseRevenue - totalLosses);
  const adjustedProfit = Math.max(0, (adjustedRevenue * 0.35) - totalLosses);
  
  const displayStats = {
    revenue: adjustedRevenue,
    revenueTrend: realStats.revenueTrend || stats.revenueTrend || 0,
    profit: adjustedProfit,
    profitTrend: realStats.revenueTrend || stats.profitTrend || 0,
    covers: realStats.todayOrders || stats.covers || 0,
    coversTrend: realStats.ordersTrend || stats.coversTrend || 0,
    avgMargin: Math.max(0, 35 - (totalLosses / baseRevenue * 100)), // Réduire la marge par les pertes
    savings: (realStats.todayRevenue * 0.05) || stats.savings || 0,
    savingsTrend: 15,
    losses: totalLosses,
    lossPercentage: (totalLosses / baseRevenue * 100).toFixed(1)
  };

  return (
    <div className="space-y-8">
      {/* Header avec informations contextuelles */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Tableau de bord
            </h1>
            <p className="text-blue-100 text-lg">
              Vue d'ensemble de votre activité et rentabilité en temps réel
            </p>
            <div className="flex items-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">Données en temps réel</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm">Restaurant {user?.restaurant?.type === 'chain' ? 'Chaîne' : user?.restaurant?.type === 'gastronomy' ? 'Gastronomique' : 'Indépendant'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm font-medium">Aujourd'hui</p>
              <p className="text-2xl font-bold">{new Date().toLocaleDateString('fr-FR')}</p>
              <p className="text-xs text-blue-200">Mise à jour: {new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Métriques Principales */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Métriques Principales</h2>
          <span className="text-sm text-gray-500">Données basées sur vos recettes et commandes réelles</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Chiffre d'affaires"
            value={`${displayStats.revenue}€`}
            icon={CurrencyEuroIcon}
            trend={displayStats.revenueTrend}
            color="blue"
            subtitle={realStats.todayRevenue ? "Données réelles saisies" : "Données de démonstration"}
            onClick={() => setShowRevenueModal(true)}
            isRealData={!!realStats.todayRevenue}
          />
          
          <StatCard
            title="Bénéfice net"
            value={`${Math.round(displayStats.profit)}€`}
            icon={CurrencyEuroIcon}
            trend={displayStats.profitTrend}
            color="green"
            subtitle={`Marge: ${displayStats.avgMargin.toFixed(1)}% ${totalLosses > 0 ? `(Pertes: -${totalLosses.toFixed(0)}€)` : ''}`}
            onClick={() => setShowProfitModal(true)}
            isRealData={!!realStats.todayRevenue}
          />
          
          <StatCard
            title={isChain ? "Sites actifs" : "Commandes"}
            value={displayStats.covers}
            icon={isChain ? ChartBarIcon : UsersIcon}
            trend={displayStats.coversTrend}
            color="purple"
            subtitle={isChain ? "Restaurants" : (realStats.todayOrders ? "Commandes réelles" : "Données démo")}
            onClick={() => setShowSitesModal(true)}
            isRealData={!!realStats.todayOrders}
          />
          
          <StatCard
            title="Économies IA"
            value={`${Math.round(displayStats.savings)}€`}
            icon={ChartBarIcon}
            trend={displayStats.savingsTrend}
            color="orange"
            subtitle="Optimisations détectées"
            onClick={() => setShowSavingsModal(true)}
            isRealData={!!realStats.todayRevenue}
          />
        </div>
      </div>

      {/* Métriques de rentabilité */}
      <ProfitabilityMetrics 
        data={dashboardData} 
        userType={user?.restaurant?.type} 
        lossMetrics={lossMetrics}
        displayStats={displayStats}
      />

      {/* Section Activité */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Activité Récente</h2>
        
        <div className="grid grid-cols-1 gap-6">
          <RecentActivity activities={dashboardData?.recentActivities || []} />
        </div>
      </div>

      {/* Section Top Recettes */}
      {dashboardData?.topRecipes && dashboardData.topRecipes.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Top Recettes Aujourd'hui</h2>
          <TopRecipesSection recipes={dashboardData.topRecipes} />
        </div>
      )}

      {/* Specialized Widgets */}
      {isChain && <ChainOverview data={dashboardData?.chainData} />}
      {isGastronomy && <GastronomyInsights data={dashboardData?.gastronomyData} />}

      {/* Modals pour les détails des statistiques */}
      {showRevenueModal && (
        <RevenueModal 
          onClose={() => setShowRevenueModal(false)}
          data={stats}
        />
      )}

      {showProfitModal && (
        <ProfitModal 
          onClose={() => setShowProfitModal(false)}
          data={stats}
        />
      )}

      {showSitesModal && (
        <SitesModal 
          onClose={() => setShowSitesModal(false)}
          data={stats}
          isChain={isChain}
        />
      )}

      {showSavingsModal && (
        <SavingsModal 
          onClose={() => setShowSavingsModal(false)}
          data={stats}
        />
      )}
    </div>
  );
};

// Modal Chiffre d'affaires
const RevenueModal = ({ onClose, data }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Détail du Chiffre d'Affaires</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Aujourd'hui</h4>
                <p className="text-2xl font-bold text-blue-600">{data.revenue || 2450}€</p>
                <p className="text-sm text-blue-700">+{data.revenueTrend || 12}% vs hier</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Cette semaine</p>
                  <p className="text-xl font-bold text-gray-900">15,680€</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Ce mois</p>
                  <p className="text-xl font-bold text-gray-900">68,450€</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service en salle</span>
                  <span className="font-medium">1,890€ (77%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ventes comptoir</span>
                  <span className="font-medium">420€ (17%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Événements privés</span>
                  <span className="font-medium">140€ (6%)</span>
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

// Modal Bénéfice net
const ProfitModal = ({ onClose, data }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analyse des Bénéfices</h3>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Bénéfice net aujourd'hui</h4>
                <p className="text-2xl font-bold text-green-600">{data.profit || 890}€</p>
                <p className="text-sm text-green-700">Marge: {data.avgMargin || 36}%</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Chiffre d'affaires</span>
                  <span className="font-medium">2,450€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Coût des matières</span>
                  <span className="font-medium text-red-600">-780€ (32%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Main d'œuvre</span>
                  <span className="font-medium text-orange-600">-490€ (20%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Charges fixes</span>
                  <span className="font-medium text-gray-600">-290€ (12%)</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Bénéfice net</span>
                  <span className="text-green-600">890€ (36%)</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-700">
                  <strong>Objectif mensuel:</strong> 25,000€ (Progression: 68%)
                </p>
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

// Modal Sites actifs / Couverts
const SitesModal = ({ onClose, data, isChain }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isChain ? 'Sites de la Chaîne' : 'Analyse des Couverts'}
            </h3>
            
            {isChain ? (
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900">Sites actifs</h4>
                  <p className="text-2xl font-bold text-purple-600">12</p>
                  <p className="text-sm text-purple-700">100% opérationnels</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Paris Centre</span>
                    <span className="font-medium text-green-600">Excellent (95%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lyon Part-Dieu</span>
                    <span className="font-medium text-green-600">Très bon (88%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Marseille Vieux-Port</span>
                    <span className="font-medium text-yellow-600">Correct (75%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Toulouse Capitole</span>
                    <span className="font-medium text-green-600">Bon (82%)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900">Couverts aujourd'hui</h4>
                  <p className="text-2xl font-bold text-purple-600">85</p>
                  <p className="text-sm text-purple-700">+5% vs hier</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Déjeuner</p>
                    <p className="text-xl font-bold text-gray-900">52</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Dîner</p>
                    <p className="text-xl font-bold text-gray-900">33</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taux d'occupation</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ticket moyen</span>
                    <span className="font-medium">28.80€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Temps moyen</span>
                    <span className="font-medium">1h 15min</span>
                  </div>
                </div>
              </div>
            )}
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

// Modal Économies réalisées
const SavingsModal = ({ onClose, data }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Économies Réalisées</h3>
            
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900">Économies ce mois</h4>
                <p className="text-2xl font-bold text-orange-600">{data.savings || 1250}€</p>
                <p className="text-sm text-orange-700">+{data.savingsTrend || 15}% vs mois dernier</p>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Sources d'économies:</h5>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Optimisation des portions</span>
                  <span className="font-medium text-green-600">+480€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Négociation fournisseurs</span>
                  <span className="font-medium text-green-600">+320€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Réduction du gaspillage</span>
                  <span className="font-medium text-green-600">+280€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Optimisation énergétique</span>
                  <span className="font-medium text-green-600">+170€</span>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-green-700">
                  <strong>Projection annuelle:</strong> 15,000€ d'économies
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-700">
                  <strong>Recommandation IA:</strong> Optimiser les recettes à base de saumon pour économiser 200€ supplémentaires ce mois.
                </p>
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

const StatCard = ({ title, value, icon: Icon, trend, color, subtitle, onClick, isRealData }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-gray-200 p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-200 shadow-lg"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
            trend > 0 ? 'bg-green-100 text-green-800' : trend < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-blue-600 hover:text-blue-800 font-medium">
          Cliquer pour voir les détails →
        </span>
        {isRealData && (
          <div className="flex items-center text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            Données réelles
          </div>
        )}
      </div>
    </div>
  );
};

const ProfitabilityMetrics = ({ data, userType, lossMetrics, displayStats }) => {
  const metrics = data?.profitability || {};
  const totalLosses = lossMetrics?.totalLoss || 0;
  
  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Analyse de Rentabilité en Temps Réel
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Coût matières */}
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-2">
            <p className="text-2xl font-bold text-red-600">
              {metrics.foodCostPercentage || 32}%
            </p>
          </div>
          <p className="text-sm font-medium text-gray-900">Coût matières</p>
          <p className="text-xs text-gray-500">
            {metrics.foodCostPercentage <= 30 ? 'Excellent' : 
             metrics.foodCostPercentage <= 35 ? 'Correct' : 'Élevé'}
          </p>
        </div>

        {/* Marge brute */}
        <div className="text-center">
          <div className="bg-green-100 p-4 rounded-lg mb-2">
            <p className="text-2xl font-bold text-green-600">
              {displayStats?.avgMargin?.toFixed(1) || 68}%
            </p>
          </div>
          <p className="text-sm font-medium text-gray-900">Marge brute</p>
          <p className="text-xs text-gray-500">
            {displayStats?.avgMargin >= 65 ? 'Excellent' : 
             displayStats?.avgMargin >= 55 ? 'Bon' : 'À améliorer'}
          </p>
        </div>

        {/* Pertes ingrédients */}
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-2">
            <p className="text-2xl font-bold text-red-600">
              {totalLosses.toFixed(0)}€
            </p>
          </div>
          <p className="text-sm font-medium text-gray-900">Pertes péremption</p>
          <p className="text-xs text-gray-500">
            {lossMetrics?.lossCount || 0} ingrédients
          </p>
        </div>

        {/* Plat le plus rentable */}
        <div className="text-center">
          <div className="bg-yellow-100 p-4 rounded-lg mb-2">
            <p className="text-lg font-bold text-yellow-600">
              {metrics.topDish || 'Saumon'}
            </p>
          </div>
          <p className="text-sm font-medium text-gray-900">Top rentabilité</p>
          <p className="text-xs text-gray-500">
            +{metrics.topDishProfit || 15.50}€ par portion
          </p>
        </div>

        {/* Économies du mois */}
        <div className="text-center">
          <div className="bg-blue-100 p-4 rounded-lg mb-2">
            <p className="text-2xl font-bold text-blue-600">
              {metrics.monthlySavings || 2450}€
            </p>
          </div>
          <p className="text-sm font-medium text-gray-900">Économies</p>
          <p className="text-xs text-gray-500">
            vs mois dernier: +{metrics.savingsIncrease || 12}%
          </p>
        </div>
      </div>

      {/* Recommandations intelligentes */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Recommandations IA</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700">
              <strong>Optimisation immédiate:</strong> Réduire les portions de {metrics.wastefulDish || 'salade'} 
              de 10% = +{metrics.potentialSaving || 180}€/mois
            </p>
          </div>
          <div>
            <p className="text-green-700">
              <strong>Opportunité:</strong> Promouvoir "{metrics.topDish || 'Saumon'}" 
              (+20% ventes = +{metrics.revenueOpportunity || 890}€/mois)
            </p>
          </div>
        </div>
        
        {/* Alerte pertes si nécessaire */}
        {totalLosses > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-sm">
              <strong>⚠️ Alerte Pertes:</strong> {totalLosses.toFixed(2)}€ de pertes détectées ce mois 
              ({displayStats?.lossPercentage}% du CA). Améliorer la gestion des dates de péremption pourrait récupérer cette marge.
            </p>
          </div>
        )}
      </div>

      {/* Graphique de tendance simplifié */}
      <div className="mt-4 grid grid-cols-7 gap-1">
        <div className="text-center">
          <div className="h-8 bg-green-200 rounded mb-1"></div>
          <p className="text-xs text-gray-500">Lun</p>
        </div>
        <div className="text-center">
          <div className="h-12 bg-green-300 rounded mb-1"></div>
          <p className="text-xs text-gray-500">Mar</p>
        </div>
        <div className="text-center">
          <div className="h-6 bg-yellow-300 rounded mb-1"></div>
          <p className="text-xs text-gray-500">Mer</p>
        </div>
        <div className="text-center">
          <div className="h-10 bg-green-400 rounded mb-1"></div>
          <p className="text-xs text-gray-500">Jeu</p>
        </div>
        <div className="text-center">
          <div className="h-16 bg-green-500 rounded mb-1"></div>
          <p className="text-xs text-gray-500">Ven</p>
        </div>
        <div className="text-center">
          <div className="h-14 bg-green-400 rounded mb-1"></div>
          <p className="text-xs text-gray-500">Sam</p>
        </div>
        <div className="text-center">
          <div className="h-4 bg-gray-300 rounded mb-1"></div>
          <p className="text-xs text-gray-500">Dim</p>
        </div>
      </div>
      <p className="text-center text-xs text-gray-500 mt-2">
        Évolution des bénéfices cette semaine (ajustés des pertes)
      </p>
    </div>
  );
};

const RecentActivity = ({ activities }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
        Activité en Temps Réel
      </h3>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">{activity.message}</p>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Aucune activité récente</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TopRecipesSection = ({ recipes }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
      <div className="space-y-4">
        {recipes.map((recipe, index) => (
          <div key={recipe.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                {index + 1}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{recipe.name}</h4>
                <p className="text-sm text-gray-600">{recipe.quantity} portions vendues</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">{Math.round(recipe.revenue)}€</p>
              <p className="text-xs text-gray-500">Chiffre d'affaires</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChainOverview = ({ data }) => {
  if (!data) return null;

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Vue d'ensemble chaîne</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{data.totalSites || 0}</p>
          <p className="text-sm text-gray-600">Sites total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{data.bestPerformer || 'N/A'}</p>
          <p className="text-sm text-gray-600">Meilleur site</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{data.avgScore || 0}%</p>
          <p className="text-sm text-gray-600">Score moyen</p>
        </div>
      </div>
    </div>
  );
};

const GastronomyInsights = ({ data }) => {
  if (!data) return null;

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Insights gastronomiques</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Plat le plus rentable</span>
          <span className="text-sm font-medium">{data.mostProfitable || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Coût matière moyen</span>
          <span className="text-sm font-medium">{data.avgFoodCost || 0}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Ingrédients saisonniers</span>
          <span className="text-sm font-medium">{data.seasonalIngredients || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;