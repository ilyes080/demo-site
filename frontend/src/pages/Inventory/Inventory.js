import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from '../../utils/axios';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  DocumentArrowDownIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import CategorizedSelect from '../../components/UI/CategorizedSelect';
import useIngredients from '../../hooks/useIngredients';
import { lossCalculator } from '../../utils/lossCalculator';
import { generateInventoryPDF, downloadPDF } from '../../utils/pdfGenerator';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showLossModal, setShowLossModal] = useState(false);
  const [lossStats, setLossStats] = useState(null);
  const queryClient = useQueryClient();

  const { data: inventoryData, isLoading } = useQuery(
    'inventory',
    () => axios.get('/inventory').then(res => res.data)
  );

  const { ingredients, categorizedIngredients, categories: ingredientCategories, createIngredient, isCreating } = useIngredients();

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

      // Calculer les pertes pour les ingrédients périmés
      const losses = lossCalculator.calculateAllLosses(inventory);
      
      // Enregistrer les nouvelles pertes
      losses.forEach(loss => {
        const existingLoss = lossCalculator.lossHistory.find(
          l => l.ingredientId === loss.ingredientId && 
               new Date(l.lossDate).toDateString() === new Date(loss.lossDate).toDateString()
        );
        
        if (!existingLoss) {
          lossCalculator.recordLoss(loss);
        }
      });

      // Mettre à jour les statistiques
      setLossStats(lossCalculator.getLossStatistics());
    }
  }, [inventoryData]);

  const updateMutation = useMutation(
    ({ id, data }) => axios.put(`/inventory/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        setShowModal(false);
        setEditingItem(null);
        toast.success('Stock mis à jour');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
      }
    }
  );

  const addStockMutation = useMutation(
    (data) => axios.post('/inventory', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        queryClient.invalidateQueries('ingredients');
        setShowModal(false);
        toast.success('Stock ajouté');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
      }
    }
  );

  const markExpiredMutation = useMutation(
    (itemId) => axios.put(`/inventory/${itemId}`, { quantity: 0, status: 'expired' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        toast.success('Ingrédient marqué comme périmé');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
      }
    }
  );

  const handleDownloadPDF = () => {
    if (inventoryData?.inventory) {
      const pdfData = inventoryData.inventory.map(item => ({
        name: item.Ingredient?.name,
        currentStock: item.quantity,
        minStock: item.minQuantity || 10,
        unitPrice: item.costPerUnit,
        unit: item.Ingredient?.unit,
        status: item.quantity <= (item.minQuantity || 10) ? 'Critique' : 'OK',
        expiryDate: item.expiryDate
      }));

      const doc = generateInventoryPDF(pdfData);
      downloadPDF(doc, 'inventaire');
      toast.success('Rapport PDF généré avec succès');
    }
  };

  const handleMarkExpired = (item) => {
    const loss = lossCalculator.markAsExpired({
      id: item.id,
      name: item.Ingredient?.name,
      currentStock: item.quantity,
      unitPrice: item.costPerUnit,
      unit: item.Ingredient?.unit,
      expiryDate: item.expiryDate,
      category: item.Ingredient?.category
    });

    if (loss) {
      markExpiredMutation.mutate(item.id);
      toast.success(`Perte enregistrée: ${loss.totalLoss.toFixed(2)}€`);
    }
  };

  const inventory = inventoryData?.inventory || [];
  const inventoryCategories = [...new Set(inventory.map(item => item.Ingredient?.category))].filter(Boolean);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.Ingredient?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.Ingredient?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const criticalStock = inventory.filter(item => item.quantity <= (item.minQuantity || 10));
  const expiringSoon = inventory.filter(item => {
    if (!item.expiryDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventaire</h1>
          <p className="text-gray-600">Gestion des stocks et ingrédients</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleDownloadPDF}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>Exporter PDF</span>
          </button>
          <button
            onClick={() => setShowLossModal(true)}
            className="btn btn-warning flex items-center space-x-2"
          >
            <TrashIcon className="h-5 w-5" />
            <span>Pertes ({lossStats?.lossCount || 0})</span>
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Ajouter stock</span>
          </button>
        </div>
      </div>

      {/* Loss Alert */}
      {lossStats && lossStats.totalLoss > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Pertes détectées:</strong> {lossStats.totalLoss.toFixed(2)}€ 
                ({lossStats.lossCount} ingrédients périmés ce mois)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {(criticalStock.length > 0 || expiringSoon.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criticalStock.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>{criticalStock.length} produit(s)</strong> en stock critique
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {expiringSoon.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>{expiringSoon.length} produit(s)</strong> expirent dans 7 jours
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un ingrédient..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="input sm:w-48"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Toutes les catégories</option>
          {inventoryCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingrédient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coût unitaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur totale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <InventoryRow
                  key={item.id}
                  item={item}
                  onEdit={(item) => {
                    setEditingItem(item);
                    setShowModal(true);
                  }}
                  onMarkExpired={handleMarkExpired}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loss Modal */}
      {showLossModal && (
        <LossModal
          onClose={() => setShowLossModal(false)}
          lossStats={lossStats}
        />
      )}

      {/* Modal */}
      {showModal && (
        <InventoryModal
          item={editingItem}
          ingredients={ingredients}
          categorizedIngredients={categorizedIngredients}
          categories={ingredientCategories}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          onSubmit={async (data) => {
            if (editingItem) {
              updateMutation.mutate({ id: editingItem.id, data });
            } else {
              // Si c'est un ingrédient personnalisé, le créer d'abord
              if (data.ingredientId === 'custom' && data.customIngredient) {
                try {
                  const newIngredient = await createIngredient(data.customIngredient);
                  // Utiliser l'ID du nouvel ingrédient créé
                  const stockData = {
                    ...data,
                    ingredientId: newIngredient.data.id
                  };
                  delete stockData.customIngredient;
                  addStockMutation.mutate(stockData);
                } catch (error) {
                  // L'erreur est déjà gérée par la mutation
                }
              } else {
                addStockMutation.mutate(data);
              }
            }
          }}
          isLoading={updateMutation.isLoading || addStockMutation.isLoading || isCreating}
        />
      )}
    </div>
  );
};

const InventoryRow = ({ item, onEdit, onMarkExpired }) => {
  const getStatusColor = () => {
    if (item.quantity <= (item.minQuantity || 10)) return 'bg-red-100 text-red-800';
    if (item.quantity <= (item.minQuantity || 10) * 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (item.quantity <= (item.minQuantity || 10)) return 'Critique';
    if (item.quantity <= (item.minQuantity || 10) * 2) return 'Faible';
    return 'OK';
  };

  const isExpiringSoon = () => {
    if (!item.expiryDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  };

  const isExpired = () => {
    if (!item.expiryDate) return false;
    return new Date(item.expiryDate) < new Date();
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg mr-3">
            <ArchiveBoxIcon className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {item.Ingredient?.name}
            </div>
            <div className="text-sm text-gray-500">
              {item.Ingredient?.category}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {item.quantity} {item.Ingredient?.unit}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {item.costPerUnit}€
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {(item.quantity * item.costPerUnit).toFixed(2)}€
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${isExpired() ? 'text-red-600 font-bold' : isExpiringSoon() ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('fr-FR') : 'N/A'}
          {isExpired() && <span className="ml-2 text-xs">(PÉRIMÉ)</span>}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
          {isExpired() ? 'PÉRIMÉ' : getStatusText()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <button
          onClick={() => onEdit(item)}
          className="text-primary-600 hover:text-primary-900"
        >
          Modifier
        </button>
        {isExpired() && (
          <button
            onClick={() => onMarkExpired(item)}
            className="text-red-600 hover:text-red-900"
          >
            Marquer périmé
          </button>
        )}
      </td>
    </tr>
  );
};

const InventoryModal = ({ item, ingredients = [], categorizedIngredients = {}, categories: ingredientCategories = [], onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    ingredientId: item?.ingredientId || '',
    quantity: item?.quantity || '',
    costPerUnit: item?.costPerUnit || '',
    expiryDate: item?.expiryDate ? item.expiryDate.split('T')[0] : '',
    batchNumber: item?.batchNumber || ''
  });

  const [showCustomIngredient, setShowCustomIngredient] = useState(false);
  const [customIngredient, setCustomIngredient] = useState({
    name: '',
    category: '',
    unit: 'kg',
    allergens: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation pour ingrédient personnalisé
    if (formData.ingredientId === 'custom') {
      if (!customIngredient.name || !customIngredient.category || !customIngredient.unit) {
        toast.error('Veuillez remplir tous les champs requis pour le nouvel ingrédient');
        return;
      }
    }
    
    const submitData = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      costPerUnit: parseFloat(formData.costPerUnit)
    };

    // Si c'est un ingrédient personnalisé, inclure les données du nouvel ingrédient
    if (formData.ingredientId === 'custom') {
      submitData.customIngredient = customIngredient;
    }

    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'ingredientId') {
      if (value === 'custom') {
        setShowCustomIngredient(true);
        setFormData({
          ...formData,
          [name]: value
        });
      } else {
        setShowCustomIngredient(false);
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCustomIngredientChange = (e) => {
    const { name, value } = e.target;
    setCustomIngredient({
      ...customIngredient,
      [name]: value
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {item ? 'Modifier le stock' : 'Ajouter du stock'}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Ingrédient *</label>
                  <CategorizedSelect
                    name="ingredientId"
                    required
                    value={formData.ingredientId}
                    onChange={handleChange}
                    categorizedIngredients={categorizedIngredients}
                    categories={ingredientCategories}
                    disabled={!!item}
                    placeholder="Sélectionner un ingrédient"
                  />
                </div>

                {/* Formulaire pour nouvel ingrédient */}
                {showCustomIngredient && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium text-blue-900">Créer un nouvel ingrédient</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="label text-xs">Nom de l'ingrédient *</label>
                        <input
                          type="text"
                          name="name"
                          required={showCustomIngredient}
                          className="input text-sm"
                          placeholder="Ex: Truffe blanche"
                          value={customIngredient.name}
                          onChange={handleCustomIngredientChange}
                        />
                      </div>
                      
                      <div>
                        <label className="label text-xs">Catégorie *</label>
                        <select
                          name="category"
                          required={showCustomIngredient}
                          className="input text-sm"
                          value={customIngredient.category}
                          onChange={handleCustomIngredientChange}
                        >
                          <option value="">Choisir une catégorie</option>
                          <option value="Viandes">Viandes</option>
                          <option value="Poissons">Poissons</option>
                          <option value="Légumes">Légumes</option>
                          <option value="Produits laitiers">Produits laitiers</option>
                          <option value="Féculents">Féculents</option>
                          <option value="Condiments">Condiments</option>
                          <option value="Épices">Épices</option>
                          <option value="Herbes">Herbes</option>
                          <option value="Fruits">Fruits</option>
                          <option value="Boulangerie">Boulangerie</option>
                          <option value="Boissons">Boissons</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="label text-xs">Unité de mesure *</label>
                        <select
                          name="unit"
                          required={showCustomIngredient}
                          className="input text-sm"
                          value={customIngredient.unit}
                          onChange={handleCustomIngredientChange}
                        >
                          <option value="kg">Kilogramme (kg)</option>
                          <option value="g">Gramme (g)</option>
                          <option value="L">Litre (L)</option>
                          <option value="mL">Millilitre (mL)</option>
                          <option value="pièce">Pièce</option>
                          <option value="botte">Botte</option>
                          <option value="sachet">Sachet</option>
                          <option value="boîte">Boîte</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="label text-xs">Allergènes (optionnel)</label>
                        <input
                          type="text"
                          name="allergens"
                          className="input text-sm"
                          placeholder="Ex: gluten, lait, œufs"
                          value={customIngredient.allergens.join(', ')}
                          onChange={(e) => setCustomIngredient({
                            ...customIngredient,
                            allergens: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                          })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Séparez par des virgules</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">Quantité *</label>
                  <input
                    type="number"
                    name="quantity"
                    step="0.01"
                    required
                    className="input"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">Coût unitaire (€) *</label>
                  <input
                    type="number"
                    name="costPerUnit"
                    step="0.01"
                    required
                    className="input"
                    value={formData.costPerUnit}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">Date d'expiration</label>
                  <input
                    type="date"
                    name="expiryDate"
                    className="input"
                    value={formData.expiryDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">Numéro de lot</label>
                  <input
                    type="text"
                    name="batchNumber"
                    className="input"
                    value={formData.batchNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : (item ? 'Modifier' : 'Ajouter')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const LossModal = ({ onClose, lossStats }) => {
  const losses = lossCalculator.getLossesByPeriod(30);
  const categoriesLoss = lossCalculator.getLossesByCategory(30);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <TrashIcon className="h-6 w-6 text-red-500 mr-2" />
                Rapport des Pertes - Ingrédients Périmés
              </h3>
            </div>

            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Pertes totales</p>
                <p className="text-2xl font-bold text-red-700">{lossStats?.totalLoss?.toFixed(2) || 0}€</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Ingrédients périmés</p>
                <p className="text-2xl font-bold text-orange-700">{lossStats?.lossCount || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Perte moyenne</p>
                <p className="text-2xl font-bold text-yellow-700">{lossStats?.averageLossPerItem?.toFixed(2) || 0}€</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">% du CA</p>
                <p className="text-2xl font-bold text-purple-700">{lossStats?.lossPercentage || 0}%</p>
              </div>
            </div>

            {/* Pertes par catégorie */}
            {categoriesLoss.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Pertes par Catégorie</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoriesLoss.map(category => (
                    <div key={category.category} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{category.category}</span>
                        <span className="text-red-600 font-bold">{category.totalLoss.toFixed(2)}€</span>
                      </div>
                      <p className="text-sm text-gray-600">{category.itemCount} ingrédients</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liste détaillée des pertes */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Détail des Pertes (30 derniers jours)</h4>
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ingrédient</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Perte</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {losses.map((loss, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{loss.ingredientName}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{loss.quantity} {loss.unit}</td>
                        <td className="px-4 py-2 text-sm font-medium text-red-600">{loss.totalLoss.toFixed(2)}€</td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {new Date(loss.lossDate).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommandations */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Recommandations pour Réduire les Pertes</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Améliorer la rotation des stocks (FIFO - First In, First Out)</li>
                <li>• Mettre en place des alertes d'expiration automatiques</li>
                <li>• Négocier des livraisons plus fréquentes avec les fournisseurs</li>
                <li>• Utiliser les ingrédients proches de l'expiration en priorité</li>
                <li>• Former l'équipe sur la gestion des dates de péremption</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;