import React from 'react';
import { useQuery } from 'react-query';
import axios from '../../utils/axios';
import ProfitabilityCopilot from '../../components/AI/ProfitabilityCopilot';
import useIngredients from '../../hooks/useIngredients';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AICopilotPage = () => {
  const { data: recipes, isLoading: recipesLoading } = useQuery(
    'recipes',
    () => axios.get('/recipes').then(res => res.data)
  );

  const { ingredients, isLoading: ingredientsLoading } = useIngredients();

  if (recipesLoading || ingredientsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const recipesList = recipes?.recipes || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Copilote IA de Rentabilité</h1>
        <p className="text-gray-600 mt-2">
          Analyse intelligente de vos recettes avec recommandations personnalisées pour optimiser votre rentabilité
        </p>
      </div>

      <ProfitabilityCopilot 
        recipes={recipesList} 
        ingredients={ingredients || []} 
      />
    </div>
  );
};

export default AICopilotPage;