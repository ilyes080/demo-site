// Gestionnaire IoT et Capteurs Intelligents
export class IoTManager {
  constructor() {
    this.sensors = new Map();
    this.alerts = [];
    this.isConnected = false;
    this.websocket = null;
    this.sensorData = JSON.parse(localStorage.getItem('iotSensorData') || '{}');
    this.initializeConnection();
  }

  // Initialisation de la connexion IoT
  initializeConnection() {
    // Simulation d'une connexion WebSocket pour les capteurs
    this.simulateConnection();
    this.startDataCollection();
  }

  // Simulation de connexion (en production, ce serait une vraie connexion)
  simulateConnection() {
    this.isConnected = true;
    console.log('🔗 Connexion IoT établie');
    
    // Simulation de capteurs
    this.registerSensor('temp_frigo_1', 'Température Frigo Principal', 'temperature', { min: 2, max: 4, unit: '°C' });
    this.registerSensor('temp_congelateur_1', 'Température Congélateur', 'temperature', { min: -18, max: -15, unit: '°C' });
    this.registerSensor('balance_stock_1', 'Balance Stock Légumes', 'weight', { unit: 'kg' });
    this.registerSensor('camera_queue_1', 'Caméra File d\'Attente', 'camera', { location: 'entrée' });
    this.registerSensor('air_quality_1', 'Qualité de l\'Air Salle', 'air_quality', { unit: 'ppm' });
    this.registerSensor('humidity_kitchen', 'Humidité Cuisine', 'humidity', { min: 40, max: 60, unit: '%' });
    this.registerSensor('noise_level_dining', 'Niveau Sonore Salle', 'noise', { max: 70, unit: 'dB' });
  }

  // Enregistrement d'un capteur
  registerSensor(id, name, type, config) {
    this.sensors.set(id, {
      id,
      name,
      type,
      config,
      status: 'active',
      lastReading: null,
      lastUpdate: Date.now(),
      batteryLevel: Math.floor(Math.random() * 30) + 70, // 70-100%
      signalStrength: Math.floor(Math.random() * 30) + 70 // 70-100%
    });
  }

  // Démarrage de la collecte de données
  startDataCollection() {
    setInterval(() => {
      this.collectSensorData();
      this.analyzeData();
      this.checkAlerts();
    }, 5000); // Toutes les 5 secondes
  }

  // Collecte des données des capteurs
  collectSensorData() {
    this.sensors.forEach((sensor, id) => {
      const reading = this.generateSensorReading(sensor);
      
      // Mise à jour du capteur
      sensor.lastReading = reading;
      sensor.lastUpdate = Date.now();
      
      // Stockage des données historiques
      if (!this.sensorData[id]) {
        this.sensorData[id] = [];
      }
      
      this.sensorData[id].push({
        timestamp: Date.now(),
        value: reading.value,
        status: reading.status
      });
      
      // Garder seulement les 1000 dernières lectures
      if (this.sensorData[id].length > 1000) {
        this.sensorData[id] = this.sensorData[id].slice(-1000);
      }
    });
    
    // Sauvegarde locale
    localStorage.setItem('iotSensorData', JSON.stringify(this.sensorData));
  }

  // Génération de lectures de capteurs réalistes
  generateSensorReading(sensor) {
    let value, status = 'normal';
    
    switch (sensor.type) {
      case 'temperature':
        const baseTemp = (sensor.config.min + sensor.config.max) / 2;
        const variation = (sensor.config.max - sensor.config.min) * 0.3;
        value = baseTemp + (Math.random() - 0.5) * variation;
        
        // Simulation d'anomalies occasionnelles
        if (Math.random() < 0.05) { // 5% de chance d'anomalie
          value += (Math.random() - 0.5) * 10;
          status = value < sensor.config.min || value > sensor.config.max ? 'alert' : 'warning';
        }
        break;
        
      case 'weight':
        value = Math.random() * 100; // 0-100 kg
        break;
        
      case 'camera':
        value = Math.floor(Math.random() * 15); // 0-15 personnes en file
        break;
        
      case 'air_quality':
        value = 300 + Math.random() * 200; // 300-500 ppm
        if (value > 450) status = 'warning';
        if (value > 500) status = 'alert';
        break;
        
      case 'humidity':
        value = 45 + Math.random() * 20; // 45-65%
        if (value < sensor.config.min || value > sensor.config.max) {
          status = 'warning';
        }
        break;
        
      case 'noise':
        const baseNoise = 55;
        const timeOfDay = new Date().getHours();
        const multiplier = timeOfDay >= 12 && timeOfDay <= 14 || timeOfDay >= 19 && timeOfDay <= 21 ? 1.3 : 1.0;
        value = baseNoise * multiplier + Math.random() * 15;
        if (value > sensor.config.max) status = 'warning';
        break;
        
      default:
        value = Math.random() * 100;
    }
    
    return {
      value: Math.round(value * 100) / 100,
      status,
      unit: sensor.config.unit || '',
      timestamp: Date.now()
    };
  }

  // Analyse des données IoT
  analyzeData() {
    const analysis = {
      temperatureCompliance: this.analyzeTemperatureCompliance(),
      inventoryTracking: this.analyzeInventoryTracking(),
      customerFlow: this.analyzeCustomerFlow(),
      environmentalConditions: this.analyzeEnvironmentalConditions(),
      predictiveMaintenance: this.analyzePredictiveMaintenance()
    };
    
    return analysis;
  }

  // Analyse de conformité des températures
  analyzeTemperatureCompliance() {
    const tempSensors = Array.from(this.sensors.values()).filter(s => s.type === 'temperature');
    const compliance = {
      overall: 100,
      details: [],
      violations: []
    };
    
    tempSensors.forEach(sensor => {
      const reading = sensor.lastReading;
      if (reading) {
        const isCompliant = reading.value >= sensor.config.min && reading.value <= sensor.config.max;
        
        compliance.details.push({
          sensorName: sensor.name,
          currentTemp: reading.value,
          targetRange: `${sensor.config.min}°C - ${sensor.config.max}°C`,
          compliant: isCompliant,
          status: reading.status
        });
        
        if (!isCompliant) {
          compliance.overall -= 20;
          compliance.violations.push({
            sensor: sensor.name,
            violation: reading.value < sensor.config.min ? 'Température trop basse' : 'Température trop élevée',
            severity: reading.status,
            action: 'Vérification immédiate requise'
          });
        }
      }
    });
    
    return compliance;
  }

  // Analyse du suivi d'inventaire automatique
  analyzeInventoryTracking() {
    const weightSensors = Array.from(this.sensors.values()).filter(s => s.type === 'weight');
    const tracking = {
      realTimeStock: [],
      predictions: [],
      alerts: []
    };
    
    weightSensors.forEach(sensor => {
      const reading = sensor.lastReading;
      if (reading) {
        const historicalData = this.sensorData[sensor.id] || [];
        const trend = this.calculateTrend(historicalData.slice(-10));
        
        tracking.realTimeStock.push({
          location: sensor.name,
          currentWeight: reading.value,
          trend: trend,
          estimatedDaysRemaining: this.estimateDaysRemaining(reading.value, trend)
        });
        
        // Prédictions de réapprovisionnement
        if (trend < -0.5) { // Consommation rapide
          tracking.predictions.push({
            item: sensor.name,
            predictedEmptyDate: new Date(Date.now() + (reading.value / Math.abs(trend)) * 24 * 60 * 60 * 1000),
            recommendedOrderDate: new Date(Date.now() + (reading.value / Math.abs(trend) * 0.7) * 24 * 60 * 60 * 1000),
            confidence: 85
          });
        }
        
        // Alertes de stock bas
        if (reading.value < 10) {
          tracking.alerts.push({
            type: 'low_stock',
            item: sensor.name,
            currentLevel: reading.value,
            severity: reading.value < 5 ? 'critical' : 'warning',
            action: 'Commande urgente recommandée'
          });
        }
      }
    });
    
    return tracking;
  }

  // Analyse du flux clients
  analyzeCustomerFlow() {
    const cameraSensors = Array.from(this.sensors.values()).filter(s => s.type === 'camera');
    const flow = {
      currentQueue: 0,
      averageWaitTime: 0,
      peakHours: [],
      recommendations: []
    };
    
    cameraSensors.forEach(sensor => {
      const reading = sensor.lastReading;
      if (reading) {
        flow.currentQueue += reading.value;
        
        // Calcul du temps d'attente estimé (2 minutes par personne)
        flow.averageWaitTime = reading.value * 2;
        
        // Recommandations basées sur la file d'attente
        if (reading.value > 10) {
          flow.recommendations.push('Ouvrir une caisse supplémentaire');
          flow.recommendations.push('Activer le système de commande mobile');
        } else if (reading.value > 5) {
          flow.recommendations.push('Préparer du personnel supplémentaire');
        }
        
        // Analyse des heures de pointe
        const hour = new Date().getHours();
        if (reading.value > 8) {
          flow.peakHours.push(hour);
        }
      }
    });
    
    return flow;
  }

  // Analyse des conditions environnementales
  analyzeEnvironmentalConditions() {
    const conditions = {
      airQuality: 'good',
      humidity: 'optimal',
      noiseLevel: 'acceptable',
      overallComfort: 85,
      recommendations: []
    };
    
    // Analyse de la qualité de l'air
    const airSensor = this.sensors.get('air_quality_1');
    if (airSensor && airSensor.lastReading) {
      const airValue = airSensor.lastReading.value;
      if (airValue > 500) {
        conditions.airQuality = 'poor';
        conditions.overallComfort -= 20;
        conditions.recommendations.push('Améliorer la ventilation');
      } else if (airValue > 450) {
        conditions.airQuality = 'fair';
        conditions.overallComfort -= 10;
      }
    }
    
    // Analyse de l'humidité
    const humiditySensor = this.sensors.get('humidity_kitchen');
    if (humiditySensor && humiditySensor.lastReading) {
      const humidityValue = humiditySensor.lastReading.value;
      if (humidityValue < 40 || humidityValue > 60) {
        conditions.humidity = 'suboptimal';
        conditions.overallComfort -= 15;
        conditions.recommendations.push('Ajuster le système de climatisation');
      }
    }
    
    // Analyse du niveau sonore
    const noiseSensor = this.sensors.get('noise_level_dining');
    if (noiseSensor && noiseSensor.lastReading) {
      const noiseValue = noiseSensor.lastReading.value;
      if (noiseValue > 70) {
        conditions.noiseLevel = 'high';
        conditions.overallComfort -= 15;
        conditions.recommendations.push('Réduire le volume de la musique');
        conditions.recommendations.push('Améliorer l\'isolation acoustique');
      }
    }
    
    return conditions;
  }

  // Analyse de maintenance prédictive
  analyzePredictiveMaintenance() {
    const maintenance = {
      equipmentHealth: [],
      upcomingMaintenance: [],
      criticalAlerts: []
    };
    
    this.sensors.forEach(sensor => {
      const health = this.calculateEquipmentHealth(sensor);
      
      maintenance.equipmentHealth.push({
        equipment: sensor.name,
        healthScore: health.score,
        status: health.status,
        batteryLevel: sensor.batteryLevel,
        signalStrength: sensor.signalStrength,
        lastMaintenance: health.lastMaintenance,
        nextMaintenance: health.nextMaintenance
      });
      
      // Maintenance programmée
      if (health.score < 70) {
        maintenance.upcomingMaintenance.push({
          equipment: sensor.name,
          priority: health.score < 50 ? 'high' : 'medium',
          estimatedDate: new Date(Date.now() + (100 - health.score) * 24 * 60 * 60 * 1000),
          type: 'preventive',
          estimatedCost: Math.floor(Math.random() * 500) + 100
        });
      }
      
      // Alertes critiques
      if (sensor.batteryLevel < 20) {
        maintenance.criticalAlerts.push({
          equipment: sensor.name,
          issue: 'Batterie faible',
          severity: 'high',
          action: 'Remplacement de batterie requis'
        });
      }
      
      if (sensor.signalStrength < 30) {
        maintenance.criticalAlerts.push({
          equipment: sensor.name,
          issue: 'Signal faible',
          severity: 'medium',
          action: 'Vérifier la connectivité réseau'
        });
      }
    });
    
    return maintenance;
  }

  // Vérification des alertes
  checkAlerts() {
    const newAlerts = [];
    
    this.sensors.forEach(sensor => {
      const reading = sensor.lastReading;
      if (reading && reading.status !== 'normal') {
        newAlerts.push({
          id: `${sensor.id}_${Date.now()}`,
          sensorId: sensor.id,
          sensorName: sensor.name,
          type: sensor.type,
          severity: reading.status,
          message: this.generateAlertMessage(sensor, reading),
          timestamp: Date.now(),
          acknowledged: false,
          actions: this.generateAlertActions(sensor, reading)
        });
      }
    });
    
    // Ajouter les nouvelles alertes
    this.alerts.push(...newAlerts);
    
    // Garder seulement les 100 dernières alertes
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    return newAlerts;
  }

  // Génération de messages d'alerte
  generateAlertMessage(sensor, reading) {
    switch (sensor.type) {
      case 'temperature':
        if (reading.value < sensor.config.min) {
          return `Température trop basse: ${reading.value}°C (min: ${sensor.config.min}°C)`;
        } else if (reading.value > sensor.config.max) {
          return `Température trop élevée: ${reading.value}°C (max: ${sensor.config.max}°C)`;
        }
        break;
      case 'air_quality':
        return `Qualité de l'air dégradée: ${reading.value} ppm`;
      case 'humidity':
        return `Humidité anormale: ${reading.value}%`;
      case 'noise':
        return `Niveau sonore élevé: ${reading.value} dB`;
      default:
        return `Valeur anormale détectée: ${reading.value}`;
    }
  }

  // Génération d'actions correctives
  generateAlertActions(sensor, reading) {
    const actions = [];
    
    switch (sensor.type) {
      case 'temperature':
        actions.push('Vérifier l\'équipement de réfrigération');
        actions.push('Contrôler l\'étanchéité des portes');
        actions.push('Appeler le technicien si nécessaire');
        break;
      case 'air_quality':
        actions.push('Améliorer la ventilation');
        actions.push('Vérifier les filtres à air');
        break;
      case 'humidity':
        actions.push('Ajuster la climatisation');
        actions.push('Vérifier les sources d\'humidité');
        break;
      case 'noise':
        actions.push('Réduire le volume sonore');
        actions.push('Vérifier l\'équipement bruyant');
        break;
    }
    
    return actions;
  }

  // Méthodes utilitaires
  calculateTrend(data) {
    if (data.length < 2) return 0;
    
    const recent = data.slice(-5);
    const older = data.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.value, 0) / older.length;
    
    return recentAvg - olderAvg;
  }

  estimateDaysRemaining(currentValue, trend) {
    if (trend >= 0) return Infinity;
    return Math.max(0, Math.floor(currentValue / Math.abs(trend)));
  }

  calculateEquipmentHealth(sensor) {
    let score = 100;
    
    // Impact de la batterie
    score -= (100 - sensor.batteryLevel) * 0.3;
    
    // Impact du signal
    score -= (100 - sensor.signalStrength) * 0.2;
    
    // Impact de l'âge (simulation)
    const age = Math.random() * 365; // 0-365 jours
    score -= age * 0.1;
    
    // Impact des anomalies récentes
    const recentData = this.sensorData[sensor.id]?.slice(-20) || [];
    const anomalies = recentData.filter(d => d.status !== 'normal').length;
    score -= anomalies * 5;
    
    return {
      score: Math.max(0, Math.min(100, score)),
      status: score > 80 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'fair' : 'poor',
      lastMaintenance: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + (score > 70 ? 90 : 30) * 24 * 60 * 60 * 1000)
    };
  }

  // API publique
  getSensorStatus() {
    return Array.from(this.sensors.values()).map(sensor => ({
      ...sensor,
      lastReading: sensor.lastReading
    }));
  }

  getActiveAlerts() {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = Date.now();
    }
  }

  getSensorHistory(sensorId, hours = 24) {
    const data = this.sensorData[sensorId] || [];
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return data.filter(d => d.timestamp > cutoff);
  }

  getSystemHealth() {
    const sensors = Array.from(this.sensors.values());
    const totalSensors = sensors.length;
    const activeSensors = sensors.filter(s => s.status === 'active').length;
    const alertSensors = sensors.filter(s => s.lastReading?.status !== 'normal').length;
    
    return {
      overallHealth: Math.round((activeSensors / totalSensors) * 100),
      totalSensors,
      activeSensors,
      alertSensors,
      connectionStatus: this.isConnected ? 'connected' : 'disconnected',
      lastUpdate: Math.max(...sensors.map(s => s.lastUpdate))
    };
  }
}

// Instance globale
export const iotManager = new IoTManager();