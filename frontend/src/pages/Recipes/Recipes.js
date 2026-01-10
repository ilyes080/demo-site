import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from '../../utils/axios';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import CategorizedSelect from '../../components/UI/CategorizedSelect';
import SimpleCostCalculator from '../../components/Recipe/SimpleCostCalculator';
import SimpleProfitAnalyzer from '../../components/Analytics/SimpleProfitAnalyzer';

import useIngredients from '../../hooks/useIngredients';

const Recipes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const queryClient = useQueryClient();

  const { data: recipes, isLoading } = useQuery(
    'recipes',
    () => axios.get('/recipes').then(res => res.data)
  );

  const { ingredients, categorizedIngredients, categories: ingredientCategories, createIngredient, isCreating } = useIngredients();



  const createMutation = useMutation(
    (data) => axios.post('/recipes', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recipes');
        setShowModal(false);
        toast.success('Recette créée avec succès');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la création');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => axios.put(`/recipes/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recipes');
        setShowModal(false);
        setEditingRecipe(null);
        toast.success('Recette modifiée avec succès');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la modification');
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => axios.delete(`/recipes/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recipes');
        toast.success('Recette supprimée avec succès');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  );

  const recipesList = recipes?.recipes || [];
  const recipeCategories = [...new Set(recipesList.map(recipe => recipe.category))].filter(Boolean);

  const filteredRecipes = recipesList.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header simple */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Recettes</h1>
            <p className="text-gray-600">Gérez vos recettes et calculez leur rentabilité</p>
          </div>
          <button
            onClick={() => {
              setEditingRecipe(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter une recette
          </button>
        </div>
      </div>

      {/* Barre de recherche simple */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une recette..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Toutes catégories</option>
            {recipeCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenu principal */}
      {selectedRecipe ? (
        // Vue avec recette sélectionnée - Layout simplifié
        <div className="space-y-6">
          {/* Barre de navigation simple */}
          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedRecipe(null)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Retour aux recettes
              </button>
              <div className="text-gray-300">|</div>
              <h2 className="text-lg font-semibold text-gray-900">{selectedRecipe.name}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(selectedRecipe)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(selectedRecipe.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>

          {/* Analyse de la recette sélectionnée */}
          <RecipeAnalysisSimple recipe={selectedRecipe} />
        </div>
      ) : (
        // Vue grille des recettes
        <div>
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune recette trouvée</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par créer votre première recette.'
                }
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                Créer ma première recette
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCardSimple
                  key={recipe.id}
                  recipe={recipe}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSelect={setSelectedRecipe}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <RecipeModal
          recipe={editingRecipe}
          ingredients={ingredients || []}
          categorizedIngredients={categorizedIngredients}
          categories={ingredientCategories}
          onClose={() => {
            setShowModal(false);
            setEditingRecipe(null);
          }}
          onSubmit={async (data) => {
            if (editingRecipe) {
              updateMutation.mutate({ id: editingRecipe.id, data });
            } else {
              // Gérer les ingrédients personnalisés avant de créer la recette
              if (data.customIngredients && data.customIngredients.length > 0) {
                try {
                  // Créer tous les ingrédients personnalisés
                  const createdIngredients = await Promise.all(
                    data.customIngredients.map(customIng => 
                      createIngredient(customIng.ingredientData)
                    )
                  );
                  
                  // Remplacer les IDs temporaires par les vrais IDs
                  const updatedIngredients = data.ingredients.map(ing => {
                    if (ing.ingredientId && ing.ingredientId.startsWith('custom-')) {
                      const customIndex = data.customIngredients.findIndex(
                        custom => custom.tempId === ing.ingredientId
                      );
                      if (customIndex !== -1) {
                        return {
                          ...ing,
                          ingredientId: createdIngredients[customIndex].data.id
                        };
                      }
                    }
                    return ing;
                  });
                  
                  const recipeData = {
                    ...data,
                    ingredients: updatedIngredients
                  };
                  delete recipeData.customIngredients;
                  
                  createMutation.mutate(recipeData);
                } catch (error) {
                  // L'erreur est déjà gérée par la mutation
                }
              } else {
                createMutation.mutate(data);
              }
            }
          }}
          onCreateIngredient={(ingredientData) => createIngredient(ingredientData)}
          isLoading={createMutation.isLoading || updateMutation.isLoading || isCreating}
        />
      )}
    </div>
  );
};





// Composant de carte de recette simplifiée
const RecipeCardSimple = ({ recipe, onEdit, onDelete, onSelect }) => {
  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'medium': return 'Moyen';
      case 'hard': return 'Difficile';
      default: return 'Non défini';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(recipe)}
    >
      {/* Header avec nom et actions */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">{recipe.name}</h3>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(recipe);
            }}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded text-sm"
            title="Modifier"
          >
            Modifier
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(recipe.id);
            }}
            className="p-1 text-red-600 hover:bg-red-100 rounded text-sm"
            title="Supprimer"
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Informations principales */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
            {recipe.category || 'Sans catégorie'}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
            {getDifficultyText(recipe.difficulty)}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {recipe.preparationTime || '?'} min
          </span>
          <span className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-1" />
            {recipe.portions} portions
          </span>
        </div>
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {recipe.description}
        </p>
      )}

      {/* Coût estimé */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">Coût estimé:</span>
        <span className="font-semibold text-green-600">
          {recipe.estimatedCost ? `${recipe.estimatedCost}€` : 'À calculer'}
        </span>
      </div>

      {/* Bouton d'action */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onSelect(recipe);
        }}
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Analyser cette recette
      </button>
    </div>
  );
};

// Composant d'analyse simplifiée
const RecipeAnalysisSimple = ({ recipe }) => {
  const { ingredients } = useIngredients();

  return (
    <div className="space-y-4">
      {/* Header simple */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-4 text-white">
        <h2 className="text-xl font-bold">{recipe.name}</h2>
        <p className="text-blue-100">Analyse intelligente de rentabilité</p>
      </div>

      {/* Calculateur de coûts simplifié */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          Calcul des Coûts
        </h3>
        <SimpleCostCalculator 
          recipe={recipe} 
          ingredients={ingredients || []} 
        />
      </div>
      
      {/* Analyseur de bénéfices simplifié */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          Analyse des Bénéfices
        </h3>
        <SimpleProfitAnalyzer 
          recipes={[recipe]} 
        />
      </div>
    </div>
  );
};





const RecipeModal = ({ recipe, ingredients, categorizedIngredients = {}, categories: ingredientCategories = [], onClose, onSubmit, onCreateIngredient, isLoading }) => {
  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    category: recipe?.category || '',
    description: recipe?.description || '',
    portions: recipe?.portions || 1,
    preparationTime: recipe?.preparationTime || '',
    difficulty: recipe?.difficulty || 'medium',
    instructions: recipe?.instructions || '',
    ingredients: recipe?.Ingredients?.map(ing => ({
      ingredientId: ing.id,
      quantity: ing.RecipeIngredient?.quantity || 0,
      unit: ing.RecipeIngredient?.unit || 'g',
      notes: ing.RecipeIngredient?.notes || ''
    })) || []
  });

  const [showCustomIngredient, setShowCustomIngredient] = useState({});
  const [customIngredients, setCustomIngredients] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Préparer les ingrédients personnalisés pour la soumission
    const customIngredientsArray = Object.entries(customIngredients)
      .filter(([tempId, data]) => data.name && data.category && data.unit)
      .map(([tempId, data]) => ({
        tempId,
        ingredientData: data
      }));
    
    const submitData = {
      ...formData,
      customIngredients: customIngredientsArray
    };
    
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ingredientId: '', quantity: 0, unit: '', notes: '' }]
    });
  };



  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    
    if (field === 'ingredientId') {
      if (value === 'custom') {
        // Créer un ID temporaire pour l'ingrédient personnalisé
        const tempId = `custom-${Date.now()}-${index}`;
        newIngredients[index] = { ...newIngredients[index], [field]: tempId };
        
        // Initialiser les données de l'ingrédient personnalisé
        setShowCustomIngredient(prev => ({ ...prev, [index]: true }));
        setCustomIngredients(prev => ({
          ...prev,
          [tempId]: {
            name: '',
            category: '',
            unit: 'kg',
            allergens: []
          }
        }));
      } else {
        // Nettoyer les données personnalisées si on change vers un ingrédient existant
        const oldValue = newIngredients[index].ingredientId;
        if (oldValue && oldValue.startsWith('custom-')) {
          setCustomIngredients(prev => {
            const newCustom = { ...prev };
            delete newCustom[oldValue];
            return newCustom;
          });
        }
        setShowCustomIngredient(prev => ({ ...prev, [index]: false }));
        
        // Mettre à jour l'ingrédient
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        
        // Ajuster automatiquement l'unité selon le type d'ingrédient
        if (value && ingredients && ingredients.length > 0) {
          const selectedIngredient = ingredients.find(ing => ing.id == value);
          
          if (selectedIngredient) {
            const name = selectedIngredient.name.toLowerCase();
            const category = selectedIngredient.category || '';
            
            // Détection si c'est liquide (même logique que dans le select)
            let isLiquid = false;
            
            // Détection par unité de base (plus fiable)
            if (selectedIngredient.unit === 'L') {
              isLiquid = true;
            }
            
            // Détection par mots-clés dans le nom
            const liquidKeywords = ['huile', 'crème', 'sauce', 'lait', 'vinaigre', 'jus', 'bouillon', 'vin', 'bière', 'eau', 'sirop'];
            if (liquidKeywords.some(keyword => name.includes(keyword))) {
              isLiquid = true;
            }
            
            // Détection par catégorie (seulement Boissons)
            if (category === 'Boissons') {
              isLiquid = true;
            }
            
            // Ajuster l'unité automatiquement
            const currentUnit = newIngredients[index].unit;
            if (isLiquid && ['g', 'kg'].includes(currentUnit)) {
              newIngredients[index].unit = 'ml'; // Unité liquide par défaut
            } else if (!isLiquid && ['ml', 'cl', 'l'].includes(currentUnit)) {
              newIngredients[index].unit = 'g'; // Unité solide par défaut
            }
          }
        }
      }
    } else {
      newIngredients[index] = { ...newIngredients[index], [field]: value };
    }
    
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const updateCustomIngredient = (tempId, field, value) => {
    setCustomIngredients(prev => ({
      ...prev,
      [tempId]: {
        ...prev[tempId],
        [field]: field === 'allergens' 
          ? value.split(',').map(a => a.trim()).filter(a => a)
          : value
      }
    }));
  };

  const removeIngredient = (index) => {
    const ingredientToRemove = formData.ingredients[index];
    
    // Nettoyer les données personnalisées si nécessaire
    if (ingredientToRemove.ingredientId && ingredientToRemove.ingredientId.startsWith('custom-')) {
      setCustomIngredients(prev => {
        const newCustom = { ...prev };
        delete newCustom[ingredientToRemove.ingredientId];
        return newCustom;
      });
    }
    
    setShowCustomIngredient(prev => {
      const newShow = { ...prev };
      delete newShow[index];
      // Réindexer les clés
      const reindexed = {};
      Object.keys(newShow).forEach(key => {
        const keyIndex = parseInt(key);
        if (keyIndex > index) {
          reindexed[keyIndex - 1] = newShow[key];
        } else if (keyIndex < index) {
          reindexed[key] = newShow[key];
        }
      });
      return reindexed;
    });
    
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-96 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {recipe ? 'Modifier la recette' : 'Nouvelle recette'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations de base */}
                <div className="space-y-4">
                  <div>
                    <label className="label">Nom de la recette *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="input"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Catégorie</label>
                    <input
                      type="text"
                      name="category"
                      className="input"
                      value={formData.category}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="input"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Portions *</label>
                      <input
                        type="number"
                        name="portions"
                        min="1"
                        required
                        className="input"
                        value={formData.portions}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="label">Temps (min)</label>
                      <input
                        type="number"
                        name="preparationTime"
                        className="input"
                        value={formData.preparationTime}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Difficulté</label>
                    <select
                      name="difficulty"
                      className="input"
                      value={formData.difficulty}
                      onChange={handleChange}
                    >
                      <option value="easy">Facile</option>
                      <option value="medium">Moyen</option>
                      <option value="hard">Difficile</option>
                    </select>
                  </div>
                </div>

                {/* Ingrédients */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="label">Ingrédients</label>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="btn btn-secondary text-sm"
                    >
                      Ajouter
                    </button>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="space-y-3">
                        {/* Ligne principale avec ingrédient */}
                        <div className="flex gap-2 items-center">
                          <CategorizedSelect
                            className="input flex-1"
                            value={ingredient.ingredientId}
                            onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                            categorizedIngredients={categorizedIngredients}
                            categories={ingredientCategories}
                            placeholder="Sélectionner un ingrédient"
                          />
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="btn btn-danger text-sm px-2 py-1"
                          >
                            ×
                          </button>
                        </div>
                        
                        {/* Encadrés séparés pour quantité, unité et notes */}
                        <div className="grid grid-cols-3 gap-3 ml-4">
                          {/* Encadré Quantité */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <label className="block text-sm font-medium text-blue-700 mb-2">
                              Quantité
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Ex: 250"
                              className="input w-full border-blue-300 focus:border-blue-500"
                              value={ingredient.quantity}
                              onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                            />
                          </div>
                          
                          {/* Encadré Unité de mesure */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <label className="block text-sm font-medium text-green-700 mb-2">
                              Unité de mesure
                            </label>
                            <select
                              className="input w-full border-green-300 focus:border-green-500"
                              value={ingredient.unit || ''}
                              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                            >
                              {(() => {
                                // Si aucun ingrédient sélectionné, afficher option vide
                                if (!ingredient.ingredientId) {
                                  return [
                                    <option key="empty" value="" disabled>Sélectionnez d'abord un ingrédient</option>
                                  ];
                                }
                                
                                // Détection intelligente simple
                                let isLiquid = false;
                                
                                if (ingredients && ingredients.length > 0) {
                                  const selectedIngredient = ingredients.find(ing => ing.id == ingredient.ingredientId);
                                  
                                  if (selectedIngredient) {
                                    const name = selectedIngredient.name.toLowerCase();
                                    const category = selectedIngredient.category || '';
                                    
                                    // Détection par unité de base (plus fiable)
                                    if (selectedIngredient.unit === 'L') {
                                      isLiquid = true;
                                    }
                                    
                                    // Détection par mots-clés dans le nom (plus précise)
                                    const liquidKeywords = ['huile', 'crème', 'sauce', 'lait', 'vinaigre', 'jus', 'bouillon', 'vin', 'bière', 'eau', 'sirop'];
                                    if (liquidKeywords.some(keyword => name.includes(keyword))) {
                                      isLiquid = true;
                                    }
                                    
                                    // Détection par catégorie (seulement Boissons)
                                    if (category === 'Boissons') {
                                      isLiquid = true;
                                    }
                                  }
                                }
                                
                                // Retourner les bonnes options
                                if (isLiquid) {
                                  return [
                                    <option key="ml" value="ml">Millilitres (ml)</option>,
                                    <option key="cl" value="cl">Centilitres (cl)</option>,
                                    <option key="l" value="l">Litres (L)</option>
                                  ];
                                } else {
                                  return [
                                    <option key="g" value="g">Grammes (g)</option>,
                                    <option key="kg" value="kg">Kilogrammes (kg)</option>
                                  ];
                                }
                              })()}
                            </select>
                          </div>
                          
                          {/* Encadré Notes */}
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <label className="block text-sm font-medium text-yellow-700 mb-2">
                              Notes
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: bien mélanger"
                              className="input w-full border-yellow-300 focus:border-yellow-500"
                              value={ingredient.notes || ''}
                              onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Formulaire pour nouvel ingrédient */}
                        {showCustomIngredient[index] && ingredient.ingredientId && ingredient.ingredientId.startsWith('custom-') && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 ml-4">
                            <h5 className="text-sm font-medium text-blue-900 mb-2">Créer un nouvel ingrédient</h5>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="label text-xs">Nom *</label>
                                <input
                                  type="text"
                                  className="input text-sm"
                                  placeholder="Ex: Truffe blanche"
                                  value={customIngredients[ingredient.ingredientId]?.name || ''}
                                  onChange={(e) => updateCustomIngredient(ingredient.ingredientId, 'name', e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <label className="label text-xs">Catégorie *</label>
                                <select
                                  className="input text-sm"
                                  value={customIngredients[ingredient.ingredientId]?.category || ''}
                                  onChange={(e) => updateCustomIngredient(ingredient.ingredientId, 'category', e.target.value)}
                                >
                                  <option value="">Choisir</option>
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
                                <label className="label text-xs">Unité *</label>
                                <select
                                  className="input text-sm"
                                  value={customIngredients[ingredient.ingredientId]?.unit || 'kg'}
                                  onChange={(e) => updateCustomIngredient(ingredient.ingredientId, 'unit', e.target.value)}
                                >
                                  <option value="kg">kg</option>
                                  <option value="g">g</option>
                                  <option value="L">L</option>
                                  <option value="mL">mL</option>
                                  <option value="pièce">pièce</option>
                                  <option value="botte">botte</option>
                                  <option value="sachet">sachet</option>
                                  <option value="boîte">boîte</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="label text-xs">Allergènes</label>
                                <input
                                  type="text"
                                  className="input text-sm"
                                  placeholder="Ex: gluten, lait"
                                  value={customIngredients[ingredient.ingredientId]?.allergens?.join(', ') || ''}
                                  onChange={(e) => updateCustomIngredient(ingredient.ingredientId, 'allergens', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="label">Instructions</label>
                <textarea
                  name="instructions"
                  rows={4}
                  className="input"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Étapes de préparation..."
                />
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : (recipe ? 'Modifier' : 'Créer')}
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

export default Recipes;