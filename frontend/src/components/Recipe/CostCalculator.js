import React, { useState, useEffect } from 'react';
import {
  CurrencyEuroIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const CostCalculator = ({ recipe, ingredients = [], onCostUpdate }) => {
  const [calculations, setCalculations] = useState({
    totalCost: 0,
    costPerPortion: 0,
    suggestedPrice: 0,
    margin: 0,
    profit: 0,
    breakdown: []
  });

  const [pricing, setPricing] = useState({
    targetMargin: 65, // Marge cible par défaut
    laborCost: 15, // Coût de main d'œuvre en %
    overheadCost: 10, // Frais généraux en %
    sellPrice: 0
  });

  // Prix moyens des ingrédients (base de données de prix)
  const ingredientPrices = {
    // Viandes (€/kg)
    'Bœuf haché': 12.50,
    'Steak de bœuf': 28.00,
    'Poulet fermier': 8.50,
    'Blanc de poulet': 15.00,
    'Saumon frais': 28.50,
    'Cabillaud': 18.00,
    'Thon rouge': 45.00,
    'Crevettes': 22.00,
    
    // Légumes (€/kg)
    'Tomates': 3.20,
    'Salade verte': 2.50, // par pièce
    'Oignons': 1.80,
    'Champignons de Paris': 12.00,
    'Courgettes': 2.80,
    'Avocat': 1.50, // par pièce
    'Pommes de terre': 1.20,
    
    // Féculents (€/kg)
    'Riz basmati': 4.50,
    'Pâtes spaghetti': 2.80,
    'Quinoa': 8.00,
    
    // Produits laitiers
    'Fromage cheddar': 18.00, // €/kg
    'Mozzarella': 12.00,
    'Parmesan': 40.00,
    'Crème fraîche': 17.00, // €/L
    'Beurre': 27.00, // €/kg
    
    // Condiments et épices
    'Huile d\'olive': 8.50, // €/L
    'Sel': 1.50, // €/kg
    'Poivre noir': 25.00, // €/kg
    'Basilic frais': 15.00, // €/botte
    
    // Ingrédients premium pour gastronomie
    'Truffe noire': 1000.00, // €/kg
    'Foie gras': 120.00, // €/kg
    'Homard': 35.00, // €/kg
    'Caviar': 2500.00, // €/kg
    'Huile de truffe': 180.00 // €/L
  };

  useEffect(() => {
    if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
      calculateCosts();
    }
  }, [recipe, ingredients, pricing.targetMargin, pricing.laborCost, pricing.overheadCost]);

  const getIngredientPrice = (ingredientName) => {
    // Chercher d'abord dans les prix prédéfinis
    if (ingredientPrices[ingredientName]) {
      return ingredientPrices[ingredientName];
    }
    
    // Prix par défaut selon la catégorie
    const ingredient = ingredients.find(ing => ing.name === ingredientName);
    if (!ingredient) return 5.00; // Prix par défaut
    
    const categoryPrices = {
      'Viandes': 15.00,
      'Poissons': 20.00,
      'Légumes': 3.00,
      'Féculents': 3.50,
      'Produits laitiers': 15.00,
      'Condiments': 8.00,
      'Épices': 20.00,
      'Herbes': 12.00,
      'Fruits': 4.00,
      'Boissons': 2.50,
      'Boulangerie': 3.00
    };
    
    return categoryPrices[ingredient.category] || 5.00;
  };

  const calculateCosts = () => {
    if (!recipe || !recipe.ingredients) return;

    let totalCost = 0;
    const breakdown = [];

    // Calculer le coût de chaque ingrédient
    recipe.ingredients.forEach(recipeIngredient => {
      const ingredient = ingredients.find(ing => ing.id === recipeIngredient.ingredientId);
      if (!ingredient) return;

      const pricePerUnit = getIngredientPrice(ingredient.name);
      const quantity = parseFloat(recipeIngredient.quantity) || 0;
      
      // Convertir les unités si nécessaire
      let adjustedQuantity = quantity;
      if (ingredient.unit === 'g' && pricePerUnit > 50) {
        // Si le prix semble être au kg, convertir les grammes
        adjustedQuantity = quantity / 1000;
      } else if (ingredient.unit === 'mL' && pricePerUnit > 10) {
        // Si le prix semble être au litre, convertir les mL
        adjustedQuantity = quantity / 1000;
      }

      const ingredientCost = adjustedQuantity * pricePerUnit;
      totalCost += ingredientCost;

      breakdown.push({
        name: ingredient.name,
        quantity: quantity,
        unit: ingredient.unit,
        pricePerUnit: pricePerUnit,
        cost: ingredientCost
      });
    });

    // Calculer le coût par portion
    const portions = parseInt(recipe.portions) || 1;
    const costPerPortion = totalCost / portions;

    // Ajouter les coûts de main d'œuvre et frais généraux
    const laborCostAmount = (costPerPortion * pricing.laborCost) / 100;
    const overheadCostAmount = (costPerPortion * pricing.overheadCost) / 100;
    const totalCostWithOverhead = costPerPortion + laborCostAmount + overheadCostAmount;

    // Calculer le prix de vente suggéré selon la marge cible
    const suggestedPrice = totalCostWithOverhead / (1 - pricing.targetMargin / 100);
    
    // Calculer la marge et le profit actuels
    const sellPrice = pricing.sellPrice || suggestedPrice;
    const profit = sellPrice - totalCostWithOverhead;
    const actualMargin = sellPrice > 0 ? ((profit / sellPrice) * 100) : 0;

    const newCalculations = {
      totalCost: totalCost,
      costPerPortion: costPerPortion,
      totalCostWithOverhead: totalCostWithOverhead,
      laborCost: laborCostAmount,
      overheadCost: overheadCostAmount,
      suggestedPrice: suggestedPrice,
      margin: actualMargin,
      profit: profit,
      breakdown: breakdown,
      portions: portions
    };

    setCalculations(newCalculations);
    
    // Notifier le parent du changement de coût
    if (onCostUpdate) {
      onCostUpdate(newCalculations);
    }
  };

  const handlePricingChange = (field, value) => {
    setPricing(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const getMarginColor = (margin) => {
    if (margin >= 60) return 'text-green-600';
    if (margin >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfitabilityLevel = (margin) => {
    if (margin >= 70) return 'Excellent';
    if (margin >= 60) return 'Très bon';
    if (margin >= 50) return 'Bon';
    if (margin >= 40) return 'Correct';
    if (margin >= 30) return 'Faible';
    return 'Insuffisant';
  };

  if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
    return (
      <div className="card text-center py-8">
        <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-gray-500">Ajoutez des ingrédients pour calculer les coûts</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Résumé des coûts */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CurrencyEuroIcon className="h-5 w-5 mr-2" />
          Analyse des Coûts
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Coût matières</p>
            <p className="text-2xl font-bold text-blue-900">
              {calculations.costPerPortion.toFixed(2)}€
            </p>
            <p className="text-xs text-blue-600">par portion</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Coût total</p>
            <p className="text-2xl font-bold text-green-900">
              {calculations.totalCostWithOverhead.toFixed(2)}€
            </p>
            <p className="text-xs text-green-600">avec charges</p>
          </div>
        </div>

        {/* Détail des coûts */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Matières premières:</span>
            <span className="font-medium">{calculations.costPerPortion.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Main d'œuvre ({pricing.laborCost}%):</span>
            <span className="font-medium">{calculations.laborCost.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Frais généraux ({pricing.overheadCost}%):</span>
            <span className="font-medium">{calculations.overheadCost.toFixed(2)}€</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Coût total par portion:</span>
            <span>{calculations.totalCostWithOverhead.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      {/* Configuration des prix */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Configuration Pricing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="label text-sm">Marge cible (%)</label>
            <input
              type="number"
              min="0"
              max="90"
              step="5"
              className="input"
              value={pricing.targetMargin}
              onChange={(e) => handlePricingChange('targetMargin', e.target.value)}
            />
          </div>
          
          <div>
            <label className="label text-sm">Main d'œuvre (%)</label>
            <input
              type="number"
              min="0"
              max="50"
              step="1"
              className="input"
              value={pricing.laborCost}
              onChange={(e) => handlePricingChange('laborCost', e.target.value)}
            />
          </div>
          
          <div>
            <label className="label text-sm">Frais généraux (%)</label>
            <input
              type="number"
              min="0"
              max="30"
              step="1"
              className="input"
              value={pricing.overheadCost}
              onChange={(e) => handlePricingChange('overheadCost', e.target.value)}
            />
          </div>
        </div>

        {/* Prix de vente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 font-medium">Prix suggéré</p>
            <p className="text-2xl font-bold text-yellow-900">
              {calculations.suggestedPrice.toFixed(2)}€
            </p>
            <p className="text-xs text-yellow-600">pour {pricing.targetMargin}% de marge</p>
          </div>
          
          <div>
            <label className="label text-sm">Prix de vente réel</label>
            <input
              type="number"
              min="0"
              step="0.50"
              className="input"
              placeholder="Prix de vente..."
              value={pricing.sellPrice}
              onChange={(e) => handlePricingChange('sellPrice', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Analyse de rentabilité */}
      {pricing.sellPrice > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
            Analyse de Rentabilité
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Bénéfice par portion</p>
              <p className={`text-2xl font-bold ${calculations.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {calculations.profit.toFixed(2)}€
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Marge réelle</p>
              <p className={`text-2xl font-bold ${getMarginColor(calculations.margin)}`}>
                {calculations.margin.toFixed(1)}%
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Niveau</p>
              <p className={`text-lg font-bold ${getMarginColor(calculations.margin)}`}>
                {getProfitabilityLevel(calculations.margin)}
              </p>
            </div>
          </div>

          {/* Recommandations */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">💡 Recommandations</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {calculations.margin < 40 && (
                <p>• ⚠️ Marge faible - Considérez augmenter le prix ou réduire les coûts</p>
              )}
              {calculations.margin >= 40 && calculations.margin < 60 && (
                <p>• ✅ Marge correcte - Vous pouvez optimiser davantage</p>
              )}
              {calculations.margin >= 60 && (
                <p>• 🎉 Excellente marge - Plat très rentable !</p>
              )}
              
              <p>• Bénéfice mensuel estimé (100 portions): <strong>{(calculations.profit * 100).toFixed(0)}€</strong></p>
              <p>• Seuil de rentabilité: <strong>{calculations.totalCostWithOverhead.toFixed(2)}€</strong> minimum</p>
            </div>
          </div>
        </div>
      )}

      {/* Détail des ingrédients */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Détail des Coûts par Ingrédient</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ingrédient</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Coût total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">% du coût</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calculations.breakdown.map((item, index) => {
                const percentage = calculations.totalCost > 0 ? (item.cost / calculations.totalCost * 100) : 0;
                return (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.pricePerUnit.toFixed(2)}€</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.cost.toFixed(2)}€</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{percentage.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between font-medium">
            <span>Total matières premières:</span>
            <span>{calculations.totalCost.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>Pour {calculations.portions} portion(s):</span>
            <span>{calculations.costPerPortion.toFixed(2)}€ par portion</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;