import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  CurrencyEuroIcon,
  ClockIcon,
  UserGroupIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import axios from '../../utils/axios';

const RealOrderEntry = ({ onOrderSubmitted }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [customerCount, setCustomerCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      // Essayer d'abord l'API démo, puis l'API normale
      let response;
      try {
        response = await axios.get('/api/recipes?all=true');
      } catch (demoError) {
        // Si l'API normale échoue, essayer l'API démo avec toutes les recettes
        response = await axios.get('/api/demo/recipes?all=true');
      }
      
      let recipes = response.data.recipes || response.data || [];
      console.log('Recettes chargées depuis API:', recipes); // Debug
      
      // Si pas de recettes ou très peu, ajouter des recettes par défaut
      if (recipes.length < 3) {
        const defaultRecipes = [
          { id: 'default-1', name: 'Burger Classic', price: 16.90, category: 'Plats principaux' },
          { id: 'default-2', name: 'Saumon aux champignons', price: 28.50, category: 'Poissons' },
          { id: 'default-3', name: 'Salade César', price: 14.50, category: 'Entrées' },
          { id: 'default-4', name: 'Risotto aux truffes', price: 45.00, category: 'Plats principaux' },
          { id: 'default-5', name: 'Pasta Carbonara', price: 19.90, category: 'Plats principaux' },
          { id: 'default-6', name: 'Tarte Tatin', price: 12.50, category: 'Desserts' },
          { id: 'default-7', name: 'Burger Premium', price: 22.90, category: 'Plats principaux' },
          { id: 'default-8', name: 'Soupe du jour', price: 9.50, category: 'Entrées' }
        ];
        recipes = [...recipes, ...defaultRecipes];
      }
      
      console.log('Recettes finales:', recipes); // Debug
      setAvailableRecipes(recipes);
    } catch (error) {
      console.error('Erreur lors du chargement des recettes:', error);
      // En cas d'erreur totale, utiliser uniquement les recettes par défaut
      const fallbackRecipes = [
        { id: 'fallback-1', name: 'Burger Classic', price: 16.90, category: 'Plats principaux' },
        { id: 'fallback-2', name: 'Saumon aux champignons', price: 28.50, category: 'Poissons' },
        { id: 'fallback-3', name: 'Salade César', price: 14.50, category: 'Entrées' },
        { id: 'fallback-4', name: 'Risotto aux truffes', price: 45.00, category: 'Plats principaux' },
        { id: 'fallback-5', name: 'Pasta Carbonara', price: 19.90, category: 'Plats principaux' },
        { id: 'fallback-6', name: 'Tarte Tatin', price: 12.50, category: 'Desserts' }
      ];
      setAvailableRecipes(fallbackRecipes);
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      id: Date.now(),
      recipeId: '',
      name: '',
      price: 0,
      quantity: 1
    }]);
  };

  const updateOrderItem = (id, field, value) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === id) {
        if (field === 'recipeId') {
          const recipe = availableRecipes.find(r => r.id === value || r.id === parseInt(value));
          console.log('Recette sélectionnée:', recipe); // Debug
          return {
            ...item,
            recipeId: value,
            name: recipe?.name || '',
            price: recipe?.price || recipe?.suggestedPrice || 25 // Prix par défaut si pas de prix
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeOrderItem = (id) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * parseInt(item.quantity));
    }, 0);
  };

  const updateInventoryForOrder = async (orderItems) => {
    try {
      // Pour chaque plat commandé, récupérer les ingrédients et mettre à jour l'inventaire
      for (const item of orderItems) {
        if (item.recipeId && !item.recipeId.toString().startsWith('default-') && !item.recipeId.toString().startsWith('fallback-')) {
          try {
            // Récupérer les détails de la recette avec ses ingrédients
            const recipeResponse = await axios.get(`/recipes/${item.recipeId}`);
            const recipe = recipeResponse.data;
            
            if (recipe.Ingredients && recipe.Ingredients.length > 0) {
              // Pour chaque ingrédient de la recette
              for (const ingredient of recipe.Ingredients) {
                const quantityUsed = (ingredient.RecipeIngredient?.quantity || 0) * item.quantity;
                const unit = ingredient.RecipeIngredient?.unit || 'g';
                
                if (quantityUsed > 0) {
                  // Mettre à jour l'inventaire en soustrayant la quantité utilisée
                  try {
                    await axios.put(`/inventory/consume`, {
                      ingredientId: ingredient.id,
                      quantity: quantityUsed,
                      unit: unit,
                      orderId: `order-${Date.now()}`,
                      reason: `Commande: ${item.name} x${item.quantity}`
                    });
                    console.log(`Inventaire mis à jour: ${ingredient.name} -${quantityUsed}${unit}`);
                  } catch (inventoryError) {
                    console.warn(`Impossible de mettre à jour l'inventaire pour ${ingredient.name}:`, inventoryError);
                  }
                }
              }
            }
          } catch (recipeError) {
            console.warn(`Impossible de récupérer la recette ${item.recipeId}:`, recipeError);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'inventaire:', error);
      // Ne pas bloquer la commande si l'inventaire échoue
    }
  };

  const submitOrder = async () => {
    if (orderItems.length === 0) {
      alert('Veuillez ajouter au moins un plat à la commande');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        items: orderItems.map(item => ({
          recipeId: item.recipeId,
          name: item.name,
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1
        })),
        total: calculateTotal(),
        tableNumber: tableNumber ? parseInt(tableNumber) : null,
        customerCount: parseInt(customerCount) || 1,
        paymentMethod
      };

      console.log('Envoi de la commande:', orderData); // Debug

      const response = await axios.post('/api/reporting/orders', orderData);
      
      console.log('Réponse serveur:', response.data); // Debug
      
      if (response.data.success) {
        // Mettre à jour l'inventaire automatiquement
        await updateInventoryForOrder(orderItems);
        
        setShowSuccess(true);
        setOrderItems([]);
        setTableNumber('');
        setCustomerCount(1);
        setPaymentMethod('cash');
        
        if (onOrderSubmitted) {
          onOrderSubmitted(response.data.order);
        }
        
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        throw new Error(response.data.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la commande:', error);
      alert(`Erreur lors de l'enregistrement: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CurrencyEuroIcon className="h-8 w-8 mr-3 text-green-600" />
            Saisie Commande Réelle
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {availableRecipes.length} recettes disponibles dans le menu
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg">
              ✅ Commande enregistrée avec succès !
            </div>
          )}
          <button
            onClick={loadRecipes}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm transition-colors"
          >
            🔄 Recharger recettes
          </button>
        </div>
      </div>

      {/* Informations de la commande */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ClockIcon className="h-4 w-4 inline mr-1" />
            Numéro de table (optionnel)
          </label>
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserGroupIcon className="h-4 w-4 inline mr-1" />
            Nombre de couverts
          </label>
          <input
            type="number"
            min="1"
            value={customerCount}
            onChange={(e) => setCustomerCount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCardIcon className="h-4 w-4 inline mr-1" />
            Mode de paiement
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="cash">Espèces</option>
            <option value="card">Carte bancaire</option>
            <option value="check">Chèque</option>
            <option value="voucher">Ticket restaurant</option>
          </select>
        </div>
      </div>

      {/* Articles de la commande */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Articles commandés</h3>
          <button
            onClick={addOrderItem}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Ajouter un plat</span>
          </button>
        </div>

        {orderItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CurrencyEuroIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun article ajouté. Cliquez sur "Ajouter un plat" pour commencer.</p>
            {availableRecipes.length > 0 && (
              <p className="text-xs text-green-600 mt-2">
                ✅ {availableRecipes.length} recettes chargées
              </p>
            )}
            {availableRecipes.length === 0 && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Aucune recette trouvée - Vérifiez la connexion
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
                <div className="flex-1">
                  <select
                    value={item.recipeId}
                    onChange={(e) => updateOrderItem(item.id, 'recipeId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un plat ({availableRecipes.length} disponibles)</option>
                    {availableRecipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name} {recipe.price ? `- ${recipe.price}€` : recipe.suggestedPrice ? `- ${recipe.suggestedPrice}€` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateOrderItem(item.id, 'price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Prix"
                  />
                </div>

                <div className="w-20">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(item.id, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Qté"
                  />
                </div>

                <div className="w-24 text-right font-semibold text-gray-900">
                  {(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}€
                </div>

                <button
                  onClick={() => removeOrderItem(item.id)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total et validation */}
      {orderItems.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-2xl font-bold text-gray-900">
              Total: {calculateTotal().toFixed(2)}€
            </div>
            <div className="text-sm text-gray-600">
              {orderItems.reduce((sum, item) => sum + parseInt(item.quantity), 0)} article(s)
            </div>
          </div>

          <button
            onClick={submitOrder}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Enregistrement...
              </div>
            ) : (
              '💰 Enregistrer la Commande Réelle'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RealOrderEntry;