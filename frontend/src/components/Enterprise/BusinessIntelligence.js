import React, { useState, useEffect } from 'react';
import {
  PresentationChartLineIcon,
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const BusinessIntelligence = ({ realData }) => {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [timeRange, setTimeRange] = useState('7days');
  const [chartData, setChartData] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalContent] = useState({ title: '', content: '', type: '' });

  useEffect(() => {
    generateChartData();
  }, [selectedMetric, timeRange, realData]);

  const generateChartData = () => {
    // Génération de données pour les graphiques
    const data = {
      revenue: generateRevenueChart(),
      customers: generateCustomerChart(),
      profitability: generateProfitabilityChart()
    };
    
    setChartData(data);
  };

  const generateRevenueChart = () => {
    const days = timeRange === '7days' ? 7 : 
                 timeRange === '15days' ? 15 :
                 timeRange === '30days' ? 30 :
                 timeRange === '60days' ? 60 :
                 timeRange === '90days' ? 90 :
                 timeRange === '120days' ? 120 :
                 timeRange === '180days' ? 180 :
                 timeRange === '365days' ? 365 : 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulation de données réalistes avec variations
      const baseRevenue = 2500;
      const weekdayMultiplier = [0.6, 0.8, 0.9, 1.0, 1.3, 1.5, 1.2][date.getDay()];
      const randomVariation = 0.8 + Math.random() * 0.4;
      const revenue = Math.round(baseRevenue * weekdayMultiplier * randomVariation);
      
      data.push({
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        revenue,
        customers: Math.round(revenue / 28), // Ticket moyen ~28€
        orders: Math.round(revenue / 45) // Panier moyen ~45€
      });
    }
    
    return data;
  };

  const generateCustomerChart = () => {
    const hours = [];
    for (let h = 11; h <= 23; h++) {
      const customers = h >= 12 && h <= 14 ? 
        Math.round(25 + Math.random() * 20) : // Pic déjeuner
        h >= 19 && h <= 21 ? 
        Math.round(30 + Math.random() * 25) : // Pic dîner
        Math.round(5 + Math.random() * 15); // Autres heures
      
      hours.push({
        hour: `${h}h`,
        customers,
        revenue: customers * (25 + Math.random() * 15)
      });
    }
    return hours;
  };

  const generateProfitabilityChart = () => {
    const dishes = [
      'Saumon grillé', 'Risotto truffe', 'Bœuf Wellington', 
      'Salade César', 'Pasta carbonara', 'Tarte tatin',
      'Soupe du jour', 'Burger premium'
    ];
    
    return dishes.map(dish => ({
      name: dish,
      cost: Math.round((8 + Math.random() * 12) * 100) / 100,
      price: Math.round((20 + Math.random() * 25) * 100) / 100,
      margin: Math.round((55 + Math.random() * 25) * 100) / 100,
      volume: Math.round(10 + Math.random() * 40)
    }));
  };

  const renderLargeChart = () => {
    if (!chartData) return null;

    const data = chartData[selectedMetric];
    if (!data) return null;

    switch (selectedMetric) {
      case 'revenue':
        return <RevenueChart data={data} />;
      case 'customers':
        return <CustomerFlowChart data={data} />;
      case 'profitability':
        return <ProfitabilityChart data={data} />;
      default:
        return <RevenueChart data={data} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center mb-2">
              <PresentationChartLineIcon className="h-10 w-10 mr-4" />
              Analyse de l'entreprise Enterprise
            </h2>
            <p className="text-slate-200 text-lg">
              Tableaux de bord exécutifs et analyses avancées pour la prise de décision
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">7 derniers jours</option>
              <option value="15days">15 derniers jours</option>
              <option value="30days">Dernier mois</option>
              <option value="60days">2 derniers mois</option>
              <option value="90days">3 derniers mois</option>
              <option value="120days">4 derniers mois</option>
              <option value="180days">6 derniers mois</option>
              <option value="365days">Année dernière</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sélecteur de métriques */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'revenue', name: 'Chiffre d\'Affaires', icon: CurrencyEuroIcon, color: 'green' },
            { id: 'customers', name: 'Flux Clients', icon: UserGroupIcon, color: 'blue' },
            { id: 'profitability', name: 'Rentabilité', icon: ArrowTrendingUpIcon, color: 'purple' }
          ].map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                selectedMetric === metric.id
                  ? `bg-${metric.color}-600 text-white shadow-lg transform scale-105`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <metric.icon className="h-6 w-6" />
              <span>{metric.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Graphique principal - TRÈS GRAND */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
        <div className="h-[600px]"> {/* Graphique très grand */}
          {renderLargeChart()}
        </div>
      </div>

      {/* KPIs en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="CA Temps Réel"
          value="2,847€"
          trend="+12.5%"
          icon={CurrencyEuroIcon}
          color="green"
          subtitle="Aujourd'hui"
        />
        <KPICard
          title="Clients Actifs"
          value="47"
          trend="+8.2%"
          icon={UserGroupIcon}
          color="blue"
          subtitle="En ce moment"
        />
        <KPICard
          title="Marge Moyenne"
          value="68.3%"
          trend="+2.1%"
          icon={ArrowTrendingUpIcon}
          color="purple"
          subtitle="Cette semaine"
        />
      </div>



      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowActionModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                    modalContent.type === 'success' ? 'bg-green-100' :
                    modalContent.type === 'warning' ? 'bg-yellow-100' :
                    modalContent.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                  } sm:mx-0 sm:h-10 sm:w-10`}>
                    {modalContent.type === 'success' && (
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {modalContent.type === 'warning' && (
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                    {(modalContent.type === 'info' || !modalContent.type) && (
                      <PresentationChartLineIcon className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {modalContent.title}
                    </h3>
                    <div className="mt-2">
                      <div className="text-sm text-gray-500 whitespace-pre-line">
                        {modalContent.content}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant graphique de revenus
const RevenueChart = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Évolution du Chiffre d'Affaires</h3>
      
      <div className="flex-1 relative">
        {/* Grille de fond */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <div key={ratio} className="border-t border-gray-200 flex items-center">
              <span className="text-sm text-gray-500 -mt-2 mr-4">
                {Math.round(maxRevenue * (1 - ratio))}€
              </span>
            </div>
          ))}
        </div>
        
        {/* Graphique en barres */}
        <div className="absolute inset-0 flex items-end justify-between px-12 pb-8">
          {data.map((day, index) => (
            <div key={index} className="flex flex-col items-center group">
              <div
                className="bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg w-12 hover:from-green-700 hover:to-green-500 transition-all duration-200 cursor-pointer shadow-lg"
                style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
              >
                {/* Tooltip au hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-opacity">
                  {day.revenue}€
                  <div className="text-xs text-gray-300">{day.customers} clients</div>
                </div>
              </div>
              <span className="text-sm text-gray-600 mt-2 font-medium">{day.dateLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant graphique de flux clients
const CustomerFlowChart = ({ data }) => {
  const maxCustomers = Math.max(...data.map(d => d.customers));
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Flux Clients par Heure</h3>
      
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
          {data.map((hour, index) => (
            <div key={index} className="flex flex-col items-center group">
              <div
                className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg w-8 hover:from-blue-700 hover:to-blue-500 transition-all duration-200 cursor-pointer"
                style={{ height: `${(hour.customers / maxCustomers) * 100}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-opacity">
                  {hour.customers} clients
                  <div className="text-xs text-gray-300">{Math.round(hour.revenue)}€</div>
                </div>
              </div>
              <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                {hour.hour}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant graphique de rentabilité
const ProfitabilityChart = ({ data }) => {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Analyse de Rentabilité par Plat</h3>
      
      <div className="flex-1 space-y-4 overflow-y-auto">
        {data.map((dish, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{dish.name}</h4>
              <div className="text-right">
                <span className="text-2xl font-bold text-purple-600">{dish.margin}%</span>
                <div className="text-sm text-gray-600">marge</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Coût:</span>
                <div className="font-semibold text-red-600">{dish.cost}€</div>
              </div>
              <div>
                <span className="text-gray-600">Prix:</span>
                <div className="font-semibold text-green-600">{dish.price}€</div>
              </div>
              <div>
                <span className="text-gray-600">Volume:</span>
                <div className="font-semibold text-blue-600">{dish.volume}/mois</div>
              </div>
            </div>
            
            {/* Barre de progression de la marge */}
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(dish.margin, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Composant KPI Card
const KPICard = ({ title, value, trend, icon: Icon, color, subtitle }) => {
  const isPositive = trend.startsWith('+');
  
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-100`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {trend}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
};

export default BusinessIntelligence;