import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const PerformanceTracking = () => {
  const [performanceData, setPerformanceData] = useState({
    satisfaction: 4.7,
    serviceTime: 18,
    occupancyRate: 78,
    tableRotation: 2.3
  });

  const [newEntry, setNewEntry] = useState({
    type: 'satisfaction',
    value: '',
    timestamp: new Date().toISOString().slice(0, 16)
  });

  const [recentEntries, setRecentEntries] = useState([]);

  // Charger les données depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('performanceEntries');
    if (saved) {
      const entries = JSON.parse(saved);
      setRecentEntries(entries);
      calculateMetrics(entries);
    }
  }, []);

  const calculateMetrics = (entries) => {
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    // Filtrer les entrées de la semaine
    const weekEntries = entries.filter(entry => 
      new Date(entry.timestamp).getTime() > oneWeekAgo
    );

    const metrics = {
      satisfaction: 4.7,
      serviceTime: 18,
      occupancyRate: 78,
      tableRotation: 2.3
    };

    // Calculer satisfaction moyenne
    const satisfactionEntries = weekEntries.filter(e => e.type === 'satisfaction');
    if (satisfactionEntries.length > 0) {
      metrics.satisfaction = satisfactionEntries.reduce((sum, e) => sum + parseFloat(e.value), 0) / satisfactionEntries.length;
    }

    // Calculer temps de service moyen
    const serviceEntries = weekEntries.filter(e => e.type === 'serviceTime');
    if (serviceEntries.length > 0) {
      metrics.serviceTime = serviceEntries.reduce((sum, e) => sum + parseFloat(e.value), 0) / serviceEntries.length;
    }

    // Calculer taux d'occupation moyen
    const occupancyEntries = weekEntries.filter(e => e.type === 'occupancyRate');
    if (occupancyEntries.length > 0) {
      metrics.occupancyRate = occupancyEntries.reduce((sum, e) => sum + parseFloat(e.value), 0) / occupancyEntries.length;
    }

    // Calculer rotation moyenne
    const rotationEntries = weekEntries.filter(e => e.type === 'tableRotation');
    if (rotationEntries.length > 0) {
      metrics.tableRotation = rotationEntries.reduce((sum, e) => sum + parseFloat(e.value), 0) / rotationEntries.length;
    }

    setPerformanceData(metrics);
  };

  const addEntry = () => {
    if (!newEntry.value) return;

    const entry = {
      ...newEntry,
      id: Date.now(),
      timestamp: new Date(newEntry.timestamp).toISOString()
    };

    const updatedEntries = [entry, ...recentEntries].slice(0, 100); // Garder 100 dernières entrées
    setRecentEntries(updatedEntries);
    localStorage.setItem('performanceEntries', JSON.stringify(updatedEntries));
    
    calculateMetrics(updatedEntries);
    
    // Reset form
    setNewEntry({
      type: 'satisfaction',
      value: '',
      timestamp: new Date().toISOString().slice(0, 16)
    });
  };

  const getMetricInfo = (type) => {
    switch (type) {
      case 'satisfaction':
        return {
          icon: StarIcon,
          label: 'Satisfaction Client',
          value: performanceData.satisfaction.toFixed(1),
          unit: '/5',
          color: 'yellow',
          description: 'Note moyenne des clients'
        };
      case 'serviceTime':
        return {
          icon: ClockIcon,
          label: 'Temps Service',
          value: Math.round(performanceData.serviceTime),
          unit: 'min',
          color: 'blue',
          description: 'Temps moyen de service'
        };
      case 'occupancyRate':
        return {
          icon: UserGroupIcon,
          label: 'Taux Occupation',
          value: Math.round(performanceData.occupancyRate),
          unit: '%',
          color: 'green',
          description: 'Pourcentage d\'occupation'
        };
      case 'tableRotation':
        return {
          icon: ArrowPathIcon,
          label: 'Rotation Tables',
          value: performanceData.tableRotation.toFixed(1),
          unit: '',
          color: 'purple',
          description: 'Nombre de services par table'
        };
      default:
        return null;
    }
  };

  const performanceTypes = [
    { value: 'satisfaction', label: 'Satisfaction Client (1-5)', placeholder: '4.5' },
    { value: 'serviceTime', label: 'Temps Service (minutes)', placeholder: '15' },
    { value: 'occupancyRate', label: 'Taux Occupation (%)', placeholder: '80' },
    { value: 'tableRotation', label: 'Rotation Tables', placeholder: '2.5' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 rounded-2xl p-8 text-white shadow-2xl">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <ChartBarIcon className="h-12 w-12 mr-4" />
          Suivi des Performances
        </h1>
        <p className="text-indigo-200 text-xl">
          Enregistrez et analysez les métriques de performance de votre restaurant
        </p>
      </div>

      {/* Métriques Actuelles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['satisfaction', 'serviceTime', 'occupancyRate', 'tableRotation'].map((type) => {
          const metric = getMetricInfo(type);
          return (
            <div key={type} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center">
              <div className={`p-3 rounded-xl bg-${metric.color}-100 inline-block mb-4`}>
                <metric.icon className={`h-8 w-8 text-${metric.color}-600`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {metric.value}
                <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.label}</h3>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          );
        })}
      </div>

      {/* Formulaire d'Ajout */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <PlusIcon className="h-8 w-8 mr-3 text-green-600" />
          Ajouter une Mesure
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de Métrique
            </label>
            <select
              value={newEntry.type}
              onChange={(e) => setNewEntry({...newEntry, type: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {performanceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valeur
            </label>
            <input
              type="number"
              step="0.1"
              value={newEntry.value}
              onChange={(e) => setNewEntry({...newEntry, value: e.target.value})}
              placeholder={performanceTypes.find(t => t.value === newEntry.type)?.placeholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date et Heure
            </label>
            <input
              type="datetime-local"
              value={newEntry.timestamp}
              onChange={(e) => setNewEntry({...newEntry, timestamp: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={addEntry}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Guide de Saisie */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Guide de Saisie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p><strong>Satisfaction Client :</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Sondages clients (QR code sur table)</li>
                <li>Avis Google/TripAdvisor</li>
                <li>Feedback direct serveurs</li>
                <li>Réclamations/compliments</li>
              </ul>
            </div>
            <div>
              <p><strong>Temps de Service :</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Commande → Premier plat servi</li>
                <li>Chronométrer pendant service</li>
                <li>Moyenne sur plusieurs tables</li>
                <li>Exclure les attentes exceptionnelles</li>
              </ul>
            </div>
            <div>
              <p><strong>Taux d'Occupation :</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Places occupées / Places totales</li>
                <li>Calculer par créneaux horaires</li>
                <li>Moyenne sur heures d'ouverture</li>
                <li>Exclure fermetures exceptionnelles</li>
              </ul>
            </div>
            <div>
              <p><strong>Rotation Tables :</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Nombre de services par table/jour</li>
                <li>Durée moyenne d'occupation</li>
                <li>Heures ouverture / Temps moyen repas</li>
                <li>Optimiser selon type de service</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Historique Récent */}
      {recentEntries.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Historique Récent</h2>
          
          <div className="space-y-3">
            {recentEntries.slice(0, 10).map((entry) => {
              const metric = getMetricInfo(entry.type);
              return (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                      <metric.icon className={`h-5 w-5 text-${metric.color}-600`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{metric.label}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">
                      {entry.value}{metric.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceTracking;