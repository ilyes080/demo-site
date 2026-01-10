import React, { useState, useEffect } from 'react';
import {
  CurrencyEuroIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const SimpleCostCalculator = ({ recipe, ingredients = [] }) => {
  const [calculations, setCalculations] = useState({
    totalCost: 0,
    costPerPortion: 0,
    suggestedPrice: 0,
    margin: 65,
    profit: 0
  });

  const [settings, setSettings] = useState({
    laborCostPercentage: 25,
    vatRate: 20,
    targetMargin: 65,
    overheadCosts: 0
  });

  const [showSettings, setShowSettings] = useState(false);

  // Prix moyens simplifiés des ingrédients (€/kg ou €/L)
  const getIngredientPrice = (ingredientName) => {
    const prices = {
      // Viandes
      'Bœuf haché': 12.50,
      'Bœuf bourguignon': 15.80,
      'Côte de bœuf': 22.00,
      'Poulet fermier': 8.50,
      'Blanc de poulet': 12.00,
      'Cuisse de poulet': 6.50,
      'Porc échine': 9.20,
      'Côte de porc': 11.50,
      'Agneau gigot': 18.00,
      'Veau escalope': 25.00,
      
      // Poissons
      'Saumon frais': 28.50,
      'Cabillaud': 18.00,
      'Sole': 35.00,
      'Thon': 22.00,
      'Crevettes': 24.00,
      'Saint-Jacques': 45.00,
      
      // Légumes
      'Tomates': 3.20,
      'Tomates cerises': 4.50,
      'Oignons': 1.80,
      'Oignons rouges': 2.20,
      'Carottes': 1.50,
      'Courgettes': 2.80,
      'Aubergines': 3.50,
      'Poivrons': 4.20,
      'Champignons de Paris': 5.50,
      'Champignons shiitake': 12.00,
      'Épinards': 6.00,
      'Salade verte': 4.00,
      'Pommes de terre': 1.20,
      
      // Produits laitiers
      'Fromage cheddar': 18.00,
      'Fromage chèvre': 22.00,
      'Parmesan': 35.00,
      'Mozzarella': 12.00,
      'Crème fraîche': 4.50,
      'Beurre': 8.00,
      'Lait': 1.20,
      
      // Féculents
      'Pâtes spaghetti': 2.80,
      'Pâtes penne': 2.80,
      'Riz basmati': 4.50,
      'Riz arborio': 6.00,
      'Quinoa': 8.50,
      
      // Condiments et épices
      'Huile d\'olive': 8.50,
      'Huile tournesol': 3.20,
      'Vinaigre balsamique': 12.00,
      'Sel': 1.00,
      'Poivre noir': 25.00,
      'Ail': 8.00,
      'Persil': 15.00,
      'Basilic': 20.00,
      'Thym': 18.00,
      
      // Fruits
      'Pommes': 2.50,
      'Citrons': 4.00,
      'Oranges': 2.80,
      'Fraises': 6.50,
      
      // Autres
      'Œufs': 3.50, // par douzaine
      'Farine': 1.50,
      'Sucre': 1.80
    };
    
    // Recherche insensible à la casse et aux accents
    const normalizedName = ingredientName.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    for (const [key, value] of Object.entries(prices)) {
      const normalizedKey = key.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (normalizedKey.includes(normalizedName) || normalizedName.includes(normalizedKey)) {
        return value;
      }
    }
    
    return 5.00; // Prix par défaut
  };

  useEffect(() => {
    const recipeIngredients = recipe?.ingredients || recipe?.Ingredients || [];
    if (recipe && recipeIngredients.length > 0) {
      calculateCosts();
    }
  }, [recipe, ingredients, settings]);

  // Fonction pour forcer le recalcul
  const forceRecalculate = () => {
    console.log('🔄 Recalcul forcé - Données actuelles:');
    console.log('Recipe:', recipe);
    console.log('Ingredients:', ingredients);
    calculateCosts();
  };

  const calculateCosts = () => {
    // Gérer les différentes structures de données possibles
    const recipeIngredients = recipe?.ingredients || recipe?.Ingredients || [];
    
    if (!recipe || recipeIngredients.length === 0) {
      console.log('❌ Pas de recette ou d\'ingrédients à calculer');
      return;
    }

    let totalCost = 0;
    let processedIngredients = 0;
    
    console.log('🔍 Calcul des coûts pour:', recipe.name);
    console.log('📋 Ingrédients de la recette:', recipeIngredients);
    console.log('🗃️ Liste d\'ingrédients disponibles:', ingredients);

    // Calculer le coût de chaque ingrédient
    recipeIngredients.forEach((recipeIngredient, index) => {
      // Gérer les différentes structures d'ingrédients
      let ingredient;
      let quantity = 0;
      let ingredientName;
      let ingredientUnit = 'kg'; // Unité par défaut
      
      // Cas 1: Structure avec ingredientId (nouvelle structure)
      if (recipeIngredient.ingredientId) {
        ingredient = ingredients.find(ing => ing.id === recipeIngredient.ingredientId);
        quantity = parseFloat(recipeIngredient.quantity) || 0;
        ingredientName = ingredient?.name;
        ingredientUnit = ingredient?.unit || 'kg';
        console.log(`📝 Structure ingredientId: ${ingredientName}, quantité: ${quantity} ${ingredientUnit}`);
      } 
      // Cas 2: Structure avec relation (ancienne structure)
      else if (recipeIngredient.id && recipeIngredient.name) {
        ingredient = recipeIngredient;
        quantity = parseFloat(recipeIngredient.RecipeIngredient?.quantity) || 0;
        ingredientName = recipeIngredient.name;
        ingredientUnit = recipeIngredient.unit || 'kg';
        console.log(`📝 Structure relation: ${ingredientName}, quantité: ${quantity} ${ingredientUnit}`);
      } 
      // Cas 3: Structure simple directe
      else if (recipeIngredient.name) {
        ingredientName = recipeIngredient.name;
        quantity = parseFloat(recipeIngredient.quantity) || 0;
        ingredientUnit = recipeIngredient.unit || 'kg';
        console.log(`📝 Structure simple: ${ingredientName}, quantité: ${quantity} ${ingredientUnit}`);
      } 
      // Cas 4: Fallback - essayer de deviner la structure
      else {
        console.log(`⚠️ Structure d'ingrédient non reconnue à l'index ${index}:`, recipeIngredient);
        // Essayer de récupérer les données autrement
        const keys = Object.keys(recipeIngredient);
        console.log('Clés disponibles:', keys);
        return;
      }

      // Vérifications de base
      if (!ingredientName || ingredientName.trim() === '') {
        console.log(`⚠️ Nom d'ingrédient vide à l'index ${index}:`, recipeIngredient);
        return;
      }

      if (quantity <= 0) {
        console.log(`⚠️ Quantité invalide (${quantity}) pour ${ingredientName}`);
        return;
      }

      // Calculer le coût
      const pricePerUnit = getIngredientPrice(ingredientName);
      
      // Conversion d'unités
      let adjustedQuantity = quantity;
      if (ingredientUnit === 'g') {
        adjustedQuantity = quantity / 1000; // Convertir en kg
      } else if (ingredientUnit === 'mL') {
        adjustedQuantity = quantity / 1000; // Convertir en L
      } else if (ingredientUnit === 'pièce' || ingredientUnit === 'unité') {
        // Pour les pièces, on garde la quantité telle quelle
        adjustedQuantity = quantity;
      }

      const ingredientCost = adjustedQuantity * pricePerUnit;
      
      if (ingredientCost > 0) {
        totalCost += ingredientCost;
        processedIngredients++;
        console.log(`✅ ${ingredientName} (${quantity} ${ingredientUnit}): ${adjustedQuantity} × ${pricePerUnit}€ = ${ingredientCost.toFixed(2)}€`);
      } else {
        console.log(`❌ Coût nul pour ${ingredientName}`);
      }
    });

    // Calculer le coût par portion
    const portions = parseInt(recipe.portions) || 1;
    const costPerPortion = totalCost / portions;

    console.log(`📊 Résumé: ${processedIngredients}/${recipeIngredients.length} ingrédients traités`);
    console.log(`📊 Coût total: ${totalCost.toFixed(2)}€ pour ${portions} portions = ${costPerPortion.toFixed(2)}€ par portion`);
    
    if (processedIngredients === 0) {
      console.log('❌ AUCUN ingrédient traité - vérifiez la structure des données');
      console.log('Structure attendue: { ingredientId: number, quantity: number } OU { name: string, quantity: number, unit?: string }');
    }

    // Ajouter main d'œuvre (pourcentage personnalisable)
    const laborCost = costPerPortion * (settings.laborCostPercentage / 100);
    
    // Ajouter frais généraux
    const overheadCost = settings.overheadCosts / portions;
    
    // Coût total avec charges
    const totalCostWithOverhead = costPerPortion + laborCost + overheadCost;

    // Prix HT avec marge
    const priceHT = totalCostWithOverhead / (1 - (settings.targetMargin / 100));
    
    // Prix TTC avec TVA
    const priceTTC = priceHT * (1 + (settings.vatRate / 100));
    
    const profit = priceHT - totalCostWithOverhead;

    setCalculations({
      totalCost,
      costPerPortion,
      laborCost,
      overheadCost,
      totalCostWithOverhead,
      priceHT,
      priceTTC,
      suggestedPrice: priceTTC,
      margin: settings.targetMargin,
      profit,
      portions
    });

    console.log('✅ Calculs terminés:', {
      totalCost: totalCost.toFixed(2),
      costPerPortion: costPerPortion.toFixed(2),
      priceTTC: priceTTC.toFixed(2)
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Gérer les différentes structures de données possibles
  const recipeIngredients = recipe?.ingredients || recipe?.Ingredients || [];
  
  if (!recipe || recipeIngredients.length === 0) {
    return (
      <div className="card text-center py-8">
        <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-gray-500">Ajoutez des ingrédients pour calculer les coûts</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Coût des matières automatique */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
          <CurrencyEuroIcon className="h-5 w-5 mr-2" />
          Coût des Matières Premières
        </h3>
        
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-blue-600 font-medium">Coût automatique par portion</p>
          <p className="text-3xl font-bold text-blue-900 my-2">
            {formatCurrency(calculations.costPerPortion)}
          </p>
          <p className="text-xs text-blue-600">
            Basé sur {recipeIngredients.length} ingrédients • {calculations.portions} portions
          </p>
          
          {/* Debug info et bouton de recalcul */}
          <div className="mt-3 pt-3 border-t border-blue-200">
            <button
              onClick={forceRecalculate}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              Recalculer
            </button>
            {calculations.costPerPortion === 0 && recipeIngredients.length > 0 && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Coût à 0€ - Vérifiez la console pour le debug
              </p>
            )}
          </div>
        </div>

        {/* Détail des ingrédients */}
        {recipeIngredients.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Détail par ingrédient:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {recipeIngredients.map((recipeIngredient, index) => {
                // Gérer les différentes structures d'ingrédients
                let ingredientName;
                let quantity;
                let ingredientUnit = 'kg';
                
                if (recipeIngredient.ingredientId) {
                  // Structure: { ingredientId: 1, quantity: 100 }
                  const ingredient = ingredients.find(ing => ing.id === recipeIngredient.ingredientId);
                  ingredientName = ingredient?.name;
                  quantity = parseFloat(recipeIngredient.quantity) || 0;
                  ingredientUnit = ingredient?.unit || 'kg';
                } else if (recipeIngredient.id && recipeIngredient.name) {
                  // Structure: { id: 1, name: "Tomate", RecipeIngredient: { quantity: 100 } }
                  ingredientName = recipeIngredient.name;
                  quantity = parseFloat(recipeIngredient.RecipeIngredient?.quantity) || 0;
                  ingredientUnit = recipeIngredient.unit || 'kg';
                } else if (recipeIngredient.name) {
                  // Structure simple: { name: "Tomate", quantity: 100, unit: "g" }
                  ingredientName = recipeIngredient.name;
                  quantity = parseFloat(recipeIngredient.quantity) || 0;
                  ingredientUnit = recipeIngredient.unit || 'kg';
                } else {
                  return null; // Structure non reconnue
                }

                if (!ingredientName) return null;
                
                const pricePerUnit = getIngredientPrice(ingredientName);
                let adjustedQuantity = quantity;
                if (ingredientUnit === 'g') adjustedQuantity = quantity / 1000;
                else if (ingredientUnit === 'mL') adjustedQuantity = quantity / 1000;
                
                const ingredientCost = adjustedQuantity * pricePerUnit;
                
                return (
                  <div key={index} className="flex justify-between text-xs text-gray-600">
                    <span>{ingredientName} ({quantity} {ingredientUnit})</span>
                    <span className="font-medium">{formatCurrency(ingredientCost)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Calcul complet avec paramètres optionnels */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Calcul Complet du Prix de Vente
          </h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              showSettings 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showSettings ? 'Masquer paramètres' : 'Personnaliser'}
          </button>
        </div>

        {/* Paramètres personnalisables */}
        {showSettings && (
          <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Paramètres personnalisables</h4>
            <p className="text-sm text-gray-600 mb-4">
              Ajustez ces paramètres selon votre établissement pour un calcul précis
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coût main d'œuvre (% du coût matières)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.laborCostPercentage}
                    onChange={(e) => setSettings({...settings, laborCostPercentage: parseFloat(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recommandé: 20-30% pour service rapide, 25-40% pour restaurant
                </p>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux TVA (%)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.vatRate}
                    onChange={(e) => setSettings({...settings, vatRate: parseFloat(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  France: 10% (restauration) ou 20% (vente à emporter)
                </p>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marge bénéficiaire cible (%)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.targetMargin}
                    onChange={(e) => setSettings({...settings, targetMargin: parseFloat(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recommandé: 60-70% pour une bonne rentabilité
                </p>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frais généraux par plat (€)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.overheadCosts}
                    onChange={(e) => setSettings({...settings, overheadCosts: parseFloat(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">€</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Loyer, électricité, assurances... répartis par plat
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Résultat final */}
        <div className="bg-green-50 p-4 rounded-lg text-center mb-4">
          <p className="text-sm text-green-600 font-medium">Prix de vente suggéré TTC</p>
          <p className="text-3xl font-bold text-green-900 my-2">
            {formatCurrency(calculations.priceTTC)}
          </p>
          <p className="text-xs text-green-600">
            Marge {settings.targetMargin}% • Bénéfice: {formatCurrency(calculations.profit)}
          </p>
        </div>

        {/* Détail des calculs */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Matières premières:</span>
            <span className="font-medium">{formatCurrency(calculations.costPerPortion)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Main d'œuvre ({settings.laborCostPercentage}%):</span>
            <span className="font-medium">{formatCurrency(calculations.laborCost)}</span>
          </div>
          {settings.overheadCosts > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frais généraux:</span>
              <span className="font-medium">{formatCurrency(calculations.overheadCost)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="text-gray-600">Coût total HT:</span>
            <span className="font-medium">{formatCurrency(calculations.totalCostWithOverhead)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Prix HT (avec marge):</span>
            <span className="font-medium">{formatCurrency(calculations.priceHT)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">TVA ({settings.vatRate}%):</span>
            <span className="font-medium">{formatCurrency(calculations.priceTTC - calculations.priceHT)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-medium text-lg">
            <span>Prix TTC final:</span>
            <span className="text-green-600">{formatCurrency(calculations.priceTTC)}</span>
          </div>
        </div>

        {/* Recommandations */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Analyse de rentabilité</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p>• Bénéfice par portion: <strong>{formatCurrency(calculations.profit)}</strong></p>
            <p>• Bénéfice mensuel estimé (100 portions): <strong>{formatCurrency(calculations.profit * 100)}</strong></p>
            <p>• Marge de {settings.targetMargin}% - {settings.targetMargin >= 60 ? 'Excellente rentabilité' : settings.targetMargin >= 40 ? 'Bonne rentabilité' : 'Marge faible'}</p>
            <p>• Coût total pour {calculations.portions} portions: <strong>{formatCurrency(calculations.totalCost)}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCostCalculator;