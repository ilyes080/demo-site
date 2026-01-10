import React, { useState, useEffect } from 'react';
import { iotManager } from '../../utils/iotManager';
import {
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  SignalIcon,
  FireIcon,
  ScaleIcon,
  CameraIcon,
  SpeakerWaveIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

const IoTDashboard = () => {
  const [sensors, setSensors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [analysisData, setAnalysisData] = useState({});

  useEffect(() => {
    // Mise à jour des données toutes les 5 secondes
    const interval = setInterval(() => {
      setSensors(iotManager.getSensorStatus());
      setAlerts(iotManager.getActiveAlerts());
      setSystemHealth(iotManager.getSystemHealth());
      setAnalysisData(iotManager.analyzeData());
    }, 5000);

    // Chargement initial
    setSensors(iotManager.getSensorStatus());
    setAlerts(iotManager.getActiveAlerts());
    setSystemHealth(iotManager.getSystemHealth());
    setAnalysisData(iotManager.analyzeData());

    return () => clearInterval(interval);
  }, []);

  const getSensorIcon = (type) => {
    switch (type) {
      case 'temperature': return FireIcon;
      case 'weight': return ScaleIcon;
      case 'camera': return CameraIcon;
      case 'air_quality': return CloudIcon;
      case 'humidity': return CloudIcon;
      case 'noise': return SpeakerWaveIcon;
      default: return WifiIcon;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'alert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <WifiIcon className="h-12 w-12 mr-4" />
              Tableau de Bord IoT
            </h1>
            <p className="text-blue-200 text-xl mb-4">
              Surveillance en temps réel de vos équipements et environnement
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${systemHealth.connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span>{systemHealth.connectionStatus === 'connected' ? 'Connecté' : 'Déconnecté'}</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400" />
                <span>{systemHealth.activeSensors}/{systemHealth.totalSensors} Capteurs Actifs</span>
              </div>
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-400" />
                <span>{alerts.length} Alertes Actives</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm font-medium">Santé Système</p>
              <p className="text-3xl font-bold">{systemHealth.overallHealth}%</p>
              <p className="text-xs text-blue-200">Dernière MAJ: {new Date(systemHealth.lastUpdate).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes Actives */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 mr-3 text-red-600" />
            Alertes Actives ({alerts.length})
          </h2>
          
          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(alert.severity)}`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{alert.sensorName}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600">Actions recommandées:</p>
                    <ul className="text-xs text-gray-600 mt-1">
                      {alert.actions.map((action, idx) => (
                        <li key={idx}>• {action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => iotManager.acknowledgeAlert(alert.id)}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Acquitter
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grille des Capteurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensors.map((sensor) => {
          const IconComponent = getSensorIcon(sensor.type);
          return (
            <div
              key={sensor.id}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 cursor-pointer hover:shadow-2xl transition-all duration-200 hover:scale-105"
              onClick={() => setSelectedSensor(sensor)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-xl mr-3">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{sensor.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{sensor.type}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(sensor.lastReading?.status || 'normal')}`}>
                  {sensor.lastReading?.status || 'normal'}
                </div>
              </div>

              {sensor.lastReading && (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {sensor.lastReading.value}
                      <span className="text-lg text-gray-500 ml-1">{sensor.lastReading.unit}</span>
                    </div>
                    <p className="text-sm text-gray-500">Dernière lecture</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <BoltIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="font-medium">{sensor.batteryLevel}%</span>
                      </div>
                      <p className="text-xs text-gray-500">Batterie</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <SignalIcon className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="font-medium">{sensor.signalStrength}%</span>
                      </div>
                      <p className="text-xs text-gray-500">Signal</p>
                    </div>
                  </div>

                  <div className="text-center text-xs text-gray-500">
                    MAJ: {new Date(sensor.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Analyses Avancées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conformité des Températures */}
        {analysisData.temperatureCompliance && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FireIcon className="h-6 w-6 mr-2 text-blue-600" />
              Conformité des Températures
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Conformité Globale</span>
                <span className="text-2xl font-bold text-green-600">{analysisData.temperatureCompliance.overall}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${analysisData.temperatureCompliance.overall}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              {analysisData.temperatureCompliance.details.map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{detail.sensorName}</p>
                    <p className="text-sm text-gray-600">{detail.currentTemp}°C (cible: {detail.targetRange})</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${detail.compliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {detail.compliant ? 'Conforme' : 'Non conforme'}
                  </div>
                </div>
              ))}
            </div>

            {analysisData.temperatureCompliance.violations.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-800 mb-2">Violations Détectées:</p>
                {analysisData.temperatureCompliance.violations.map((violation, idx) => (
                  <p key={idx} className="text-sm text-red-700">• {violation.sensor}: {violation.violation}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suivi d'Inventaire Automatique */}
        {analysisData.inventoryTracking && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <ScaleIcon className="h-6 w-6 mr-2 text-purple-600" />
              Suivi d'Inventaire Automatique
            </h3>
            
            <div className="space-y-4">
              {analysisData.inventoryTracking.realTimeStock.map((stock, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{stock.location}</h4>
                    <span className="text-lg font-bold text-gray-900">{stock.currentWeight} kg</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${stock.trend > 0 ? 'text-green-600' : stock.trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      Tendance: {stock.trend > 0 ? '↗' : stock.trend < 0 ? '↘' : '→'} {Math.abs(stock.trend).toFixed(1)} kg/jour
                    </span>
                    <span className="text-gray-600">
                      {stock.estimatedDaysRemaining === Infinity ? '∞' : stock.estimatedDaysRemaining} jours restants
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {analysisData.inventoryTracking.predictions.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-800 mb-2">Prédictions de Réapprovisionnement:</p>
                {analysisData.inventoryTracking.predictions.map((prediction, idx) => (
                  <div key={idx} className="text-sm text-blue-700 mb-1">
                    • {prediction.item}: Commander avant le {new Date(prediction.recommendedOrderDate).toLocaleDateString()}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Flux Clients */}
        {analysisData.customerFlow && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CameraIcon className="h-6 w-6 mr-2 text-green-600" />
              Analyse du Flux Clients
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{analysisData.customerFlow.currentQueue}</div>
                <p className="text-sm text-green-800">Personnes en file</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{analysisData.customerFlow.averageWaitTime}</div>
                <p className="text-sm text-blue-800">Minutes d'attente</p>
              </div>
            </div>

            {analysisData.customerFlow.recommendations.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-800 mb-2">Recommandations:</p>
                {analysisData.customerFlow.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-sm text-yellow-700">• {rec}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conditions Environnementales */}
        {analysisData.environmentalConditions && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CloudIcon className="h-6 w-6 mr-2 text-indigo-600" />
              Conditions Environnementales
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Confort Global</span>
                <span className="text-2xl font-bold text-indigo-600">{analysisData.environmentalConditions.overallComfort}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${analysisData.environmentalConditions.overallComfort}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${
                  analysisData.environmentalConditions.airQuality === 'good' ? 'bg-green-500' :
                  analysisData.environmentalConditions.airQuality === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <p className="text-xs text-gray-600">Air</p>
              </div>
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${
                  analysisData.environmentalConditions.humidity === 'optimal' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <p className="text-xs text-gray-600">Humidité</p>
              </div>
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${
                  analysisData.environmentalConditions.noiseLevel === 'acceptable' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <p className="text-xs text-gray-600">Bruit</p>
              </div>
            </div>

            {analysisData.environmentalConditions.recommendations.length > 0 && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="font-medium text-indigo-800 mb-2">Améliorations suggérées:</p>
                {analysisData.environmentalConditions.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-sm text-indigo-700">• {rec}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Détail Capteur */}
      {selectedSensor && (
        <SensorDetailModal
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </div>
  );
};

// Modal de détail d'un capteur
const SensorDetailModal = ({ sensor, onClose }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(iotManager.getSensorHistory(sensor.id, 24));
  }, [sensor.id]);

  const IconComponent = getSensorIcon(sensor.type);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{sensor.name}</h3>
                  <p className="text-gray-600 capitalize">{sensor.type} • ID: {sensor.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {sensor.lastReading?.value || 'N/A'}
                  <span className="text-lg text-blue-500 ml-1">{sensor.lastReading?.unit}</span>
                </div>
                <p className="text-sm text-blue-800">Valeur Actuelle</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{sensor.batteryLevel}%</div>
                <p className="text-sm text-green-800">Niveau Batterie</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">{sensor.signalStrength}%</div>
                <p className="text-sm text-purple-800">Force Signal</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Historique (24h)</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="h-64 flex items-end justify-between space-x-1">
                  {history.slice(-20).map((point, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-500 rounded-t flex-1 min-h-1 hover:bg-blue-600 transition-colors"
                      style={{ 
                        height: `${Math.max(4, (point.value / Math.max(...history.map(h => h.value))) * 100)}%` 
                      }}
                      title={`${point.value}${sensor.lastReading?.unit} - ${new Date(point.timestamp).toLocaleString()}`}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>-24h</span>
                  <span>Maintenant</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{sensor.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className={`font-medium ${sensor.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      {sensor.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dernière MAJ:</span>
                    <span className="font-medium">{new Date(sensor.lastUpdate).toLocaleString()}</span>
                  </div>
                  {sensor.config && (
                    <>
                      {sensor.config.min !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min:</span>
                          <span className="font-medium">{sensor.config.min}{sensor.config.unit}</span>
                        </div>
                      )}
                      {sensor.config.max !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max:</span>
                          <span className="font-medium">{sensor.config.max}{sensor.config.unit}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Statistiques</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Moyenne 24h:</span>
                    <span className="font-medium">
                      {history.length > 0 ? 
                        (history.reduce((sum, h) => sum + h.value, 0) / history.length).toFixed(2) : 
                        'N/A'
                      }{sensor.lastReading?.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min 24h:</span>
                    <span className="font-medium">
                      {history.length > 0 ? Math.min(...history.map(h => h.value)).toFixed(2) : 'N/A'}{sensor.lastReading?.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max 24h:</span>
                    <span className="font-medium">
                      {history.length > 0 ? Math.max(...history.map(h => h.value)).toFixed(2) : 'N/A'}{sensor.lastReading?.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points de données:</span>
                    <span className="font-medium">{history.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getSensorIcon = (type) => {
  switch (type) {
    case 'temperature': return FireIcon;
    case 'weight': return ScaleIcon;
    case 'camera': return CameraIcon;
    case 'air_quality': return CloudIcon;
    case 'humidity': return CloudIcon;
    case 'noise': return SpeakerWaveIcon;
    default: return WifiIcon;
  }
};

export default IoTDashboard;