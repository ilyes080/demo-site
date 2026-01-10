import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

export const useIngredients = () => {
  const queryClient = useQueryClient();

  // Récupérer les ingrédients
  const {
    data: ingredientsData,
    isLoading,
    error
  } = useQuery(
    'ingredients-v2', // Nouvelle clé pour forcer le rechargement
    () => axios.get('/inventory/ingredients').then(res => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Extraire les données selon le format de réponse
  const ingredients = ingredientsData?.ingredients || ingredientsData || [];
  const categorizedIngredients = ingredientsData?.categorized || {};
  const categories = ingredientsData?.categories || [];



  // Créer un nouvel ingrédient
  const createIngredientMutation = useMutation(
    (ingredientData) => axios.post('/inventory/ingredients', ingredientData),
    {
      onMutate: async (newIngredient) => {
        // Annuler les requêtes en cours pour éviter les conflits
        await queryClient.cancelQueries('ingredients-v2');
        
        // Sauvegarder l'état précédent
        const previousIngredients = queryClient.getQueryData('ingredients-v2');
        
        // Mise à jour optimiste - ajouter immédiatement à la liste
        const optimisticIngredient = {
          id: `temp-${Date.now()}`,
          ...newIngredient,
          isActive: true,
          isCustom: true
        };
        
        queryClient.setQueryData('ingredients-v2', old => {
          if (!old) return { ingredients: [optimisticIngredient], categorized: {}, categories: [] };
          
          // Si old est déjà la nouvelle structure
          if (old.ingredients) {
            const newIngredients = [...old.ingredients, optimisticIngredient];
            
            // Recalculer la catégorisation
            const categorizedIngredients = {};
            newIngredients.forEach(ingredient => {
              if (!categorizedIngredients[ingredient.category]) {
                categorizedIngredients[ingredient.category] = [];
              }
              categorizedIngredients[ingredient.category].push(ingredient);
            });

            const sortedCategories = Object.keys(categorizedIngredients).sort();
            const organizedIngredients = {};
            
            sortedCategories.forEach(category => {
              organizedIngredients[category] = categorizedIngredients[category].sort((a, b) => a.name.localeCompare(b.name));
            });

            return {
              ingredients: newIngredients,
              categorized: organizedIngredients,
              categories: sortedCategories
            };
          }
          
          // Si old est l'ancien format (juste un tableau)
          return { ingredients: [...old, optimisticIngredient], categorized: {}, categories: [] };
        });
        
        return { previousIngredients };
      },
      onError: (err, newIngredient, context) => {
        // Restaurer l'état précédent en cas d'erreur
        if (context?.previousIngredients) {
          queryClient.setQueryData('ingredients-v2', context.previousIngredients);
        }
        toast.error(err.response?.data?.message || 'Erreur lors de la création de l\'ingrédient');
      },
      onSuccess: (data, variables) => {
        // Remplacer l'ingrédient temporaire par le vrai
        queryClient.setQueryData('ingredients-v2', old => {
          if (!old) return { ingredients: [data.data], categorized: {}, categories: [] };
          
          // Si old est la nouvelle structure
          if (old.ingredients) {
            const updatedIngredients = old.ingredients.map(ing => 
              ing.id.toString().startsWith('temp-') && 
              ing.name === variables.name && 
              ing.category === variables.category
                ? data.data 
                : ing
            );
            
            // Recalculer la catégorisation
            const categorizedIngredients = {};
            updatedIngredients.forEach(ingredient => {
              if (!categorizedIngredients[ingredient.category]) {
                categorizedIngredients[ingredient.category] = [];
              }
              categorizedIngredients[ingredient.category].push(ingredient);
            });

            const sortedCategories = Object.keys(categorizedIngredients).sort();
            const organizedIngredients = {};
            
            sortedCategories.forEach(category => {
              organizedIngredients[category] = categorizedIngredients[category].sort((a, b) => a.name.localeCompare(b.name));
            });

            return {
              ingredients: updatedIngredients,
              categorized: organizedIngredients,
              categories: sortedCategories
            };
          }
          
          // Si old est l'ancien format
          return old.map(ing => 
            ing.id.toString().startsWith('temp-') && 
            ing.name === variables.name && 
            ing.category === variables.category
              ? data.data 
              : ing
          );
        });
        
        toast.success(`Ingrédient "${data.data.name}" créé avec succès`);
      },
      onSettled: () => {
        // Rafraîchir pour s'assurer de la cohérence des données
        queryClient.invalidateQueries('ingredients-v2');
      }
    }
  );

  // Fonction helper pour créer un ingrédient et retourner sa promesse
  const createIngredient = async (ingredientData) => {
    return createIngredientMutation.mutateAsync(ingredientData);
  };

  // Fonction helper pour vérifier si un ingrédient existe déjà
  const ingredientExists = (name, category) => {
    return ingredients.some(ing => 
      ing.name.toLowerCase() === name.toLowerCase() && 
      ing.category.toLowerCase() === category.toLowerCase()
    );
  };

  // Fonction helper pour obtenir les catégories uniques
  const getCategories = () => {
    const categories = [...new Set(ingredients.map(ing => ing.category))];
    return categories.sort();
  };

  // Fonction helper pour filtrer par catégorie
  const getIngredientsByCategory = (category) => {
    if (!category || category === 'all') return ingredients;
    return ingredients.filter(ing => ing.category === category);
  };

  return {
    // Données
    ingredients,
    categorizedIngredients,
    categories,
    isLoading,
    error,
    
    // Mutations
    createIngredient,
    isCreating: createIngredientMutation.isLoading,
    
    // Helpers
    ingredientExists,
    getCategories,
    getIngredientsByCategory,
    
    // Accès direct à la mutation si nécessaire
    createIngredientMutation
  };
};

export default useIngredients;