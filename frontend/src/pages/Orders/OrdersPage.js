import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from '../../utils/axios';
import RealOrderEntry from '../../components/Orders/RealOrderEntry';
import { 
  ClockIcon, 
  CurrencyEuroIcon, 
  ChartBarIcon,
  EyeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const OrdersPage = () => {
  const [showOrderEntry, setShowOrderEntry] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Charger les commandes récentes
  const { data: ordersData, refetch: refetchOrders } = useQuery(
    ['orders', selectedPeriod],
    () => axios.get(`/api/reporting/orders?limit=20`).then(res => res.data),
    {
      refetchInterval: 10000,
    }
  );

  // Charger les statistiques
  const { data: revenueData, refetch: refetchRevenue } = useQuery(
    ['revenue', selectedPeriod],
    () => axios.get(`/api/reporting/revenue?period=${selectedPeriod}`).then(res => res.data),
    {
      refetchInterval: 10000,
    }
  );

  const handleOrderSubmitted = (newOrder) => {
    refetchOrders();
    refetchRevenue();
    setShowOrderEntry(false);
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const orders = ordersData?.orders || [];
  const revenue = revenueData?.data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Gestion des Commandes Réelles
            </h1>
            <p className="text-blue-100 text-lg">
              Saisissez vos commandes pour un reporting précis et des analyses fiables
            </p>
            <div className="flex items-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">Données temps réel</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm">{orders.length} commandes enregistrées</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowOrderEntry(!showOrderEntry)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            {showOrderEntry ? '📋 Voir les commandes' : '➕ Nouvelle commande'}
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CA Aujourd'hui</p>
              <p className="text-2xl font-bold text-green-600">{revenue.totalRevenue?.toFixed(2) || 0}€</p>
            </div>
            <CurrencyEuroIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commandes</p>
              <p className="text-2xl font-bold text-blue-600">{revenue.totalOrders || 0}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Moyen</p>
              <p className="text-2xl font-bold text-purple-600">{revenue.avgOrderValue?.toFixed(2) || 0}€</p>
            </div>
            <CurrencyEuroIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Articles Vendus</p>
              <p className="text-2xl font-bold text-orange-600">{revenue.totalItems || 0}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {showOrderEntry ? (
        <RealOrderEntry onOrderSubmitted={handleOrderSubmitted} />
      ) : (
        <div className="space-y-6">
          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Commandes Récentes</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des commandes */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <CurrencyEuroIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande enregistrée</h3>
                <p className="text-gray-600 mb-6">
                  Commencez à saisir vos commandes pour voir apparaître des données réelles ici.
                </p>
                <button
                  onClick={() => setShowOrderEntry(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  ➕ Saisir ma première commande
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Commande #{order.id.slice(-8)}
                          </span>
                          {order.tableNumber && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Table {order.tableNumber}
                            </span>
                          )}
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {order.paymentMethod === 'cash' ? 'Espèces' : 
                             order.paymentMethod === 'card' ? 'Carte' :
                             order.paymentMethod === 'check' ? 'Chèque' : 'Ticket resto'}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatDateTime(order.timestamp)}
                          </div>
                          <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {order.customerCount} couvert{order.customerCount > 1 ? 's' : ''}
                          </div>
                          <div>
                            {order.items.length} article{order.items.length > 1 ? 's' : ''}
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="text-sm text-gray-600">
                            {order.items.map((item, index) => (
                              <span key={index}>
                                {item.quantity}x {item.name}
                                {index < order.items.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {order.total.toFixed(2)}€
                        </div>
                        <div className="text-sm text-gray-500">
                          {(order.total / order.customerCount).toFixed(2)}€/pers
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top recettes */}
          {revenue.topRecipes && revenue.topRecipes.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Recettes par CA</h3>
              <div className="space-y-3">
                {revenue.topRecipes.slice(0, 5).map((recipe, index) => (
                  <div key={recipe.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{recipe.name}</span>
                      <span className="text-sm text-gray-600">({recipe.quantity} vendues)</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {recipe.revenue.toFixed(2)}€
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;