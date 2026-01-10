import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  ComputerDesktopIcon,
  CalendarIcon,
  DocumentMagnifyingGlassIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const GastronomyTools = () => {
  const [activeTab, setActiveTab] = useState('costing');

  const { data: gastronomyData, isLoading } = useQuery(
    'gastronomyData',
    () => axios.get('/api/gastronomy/dashboard').then(res => res.data)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: 'costing', name: 'Costing Précis', icon: ComputerDesktopIcon },
    { id: 'seasonal', name: 'Menus Saisonniers', icon: CalendarIcon },
    { id: 'traceability', name: 'Traçabilité', icon: DocumentMagnifyingGlassIcon },
    { id: 'profitability', name: 'Rentabilité', icon: ChartPieIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Outils Gastronomiques</h1>
        <p className="text-gray-600">
          Optimisation des coûts et qualité premium
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'costing' && <PreciseCosting data={gastronomyData} />}
        {activeTab === 'seasonal' && <SeasonalMenus data={gastronomyData} />}
        {activeTab === 'traceability' && <Traceability data={gastronomyData} />}
        {activeTab === 'profitability' && <ProfitabilityAnalysis data={gastronomyData} />}
      </div>
    </div>
  );
};

const PreciseCosting = ({ data }) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const recipes = data?.recipes || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Calcul de coûts précis</h3>
        <button className="btn btn-primary">
          Nouvelle analyse
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des recettes */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recettes à analyser</h4>
          <div className="space-y-2">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedRecipe?.id === recipe.id
                    ? 'bg-primary-50 border-primary-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{recipe.name}</p>
                    <p className="text-sm text-gray-600">{recipe.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{recipe.costPerPortion}€</p>
                    <p className="text-sm text-gray-600">par portion</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détail du costing */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {selectedRecipe ? `Costing - ${selectedRecipe.name}` : 'Sélectionnez une recette'}
          </h4>
          
          {selectedRecipe ? (
            <div className="space-y-4">
              {/* Résumé */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Coût total</p>
                    <p className="text-xl font-bold text-gray-900">{selectedRecipe.totalCost}€</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prix de vente suggéré</p>
                    <p className="text-xl font-bold text-green-600">{selectedRecipe.suggestedPrice}€</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Marge brute</p>
                    <p className="text-xl font-bold text-blue-600">{selectedRecipe.margin}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Portions</p>
                    <p className="text-xl font-bold text-gray-900">{selectedRecipe.portions}</p>
                  </div>
                </div>
              </div>

              {/* Détail des ingrédients */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Détail des coûts</h5>
                <div className="space-y-2">
                  {selectedRecipe.ingredients?.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{ingredient.name}</p>
                        <p className="text-sm text-gray-600">{ingredient.quantity} {ingredient.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{ingredient.cost}€</p>
                        <p className="text-sm text-gray-600">{ingredient.costPerUnit}€/{ingredient.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full btn btn-primary">
                Recalculer avec prix actuels
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Sélectionnez une recette pour voir le détail des coûts
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SeasonalMenus = ({ data }) => {
  const seasonalIngredients = data?.seasonalIngredients || [];
  const currentSeason = data?.currentSeason || 'Hiver';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Menus Saisonniers</h3>
          <p className="text-sm text-gray-600">Saison actuelle: {currentSeason}</p>
        </div>
        <button className="btn btn-primary">
          Créer menu saisonnier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingrédients de saison */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Ingrédients de saison</h4>
          <div className="space-y-3">
            {seasonalIngredients.map((ingredient, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">{ingredient.name}</p>
                  <p className="text-sm text-green-700">Pic de saison</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-900">{ingredient.price}€</p>
                  <p className="text-xs text-green-700">-{ingredient.discount}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions de plats */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Suggestions de plats</h4>
          <div className="space-y-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <p className="font-medium">Velouté de potimarron</p>
              <p className="text-sm text-gray-600">Coût: 3.20€ | Marge: 75%</p>
              <div className="mt-2">
                <span className="inline-flex px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  Automne/Hiver
                </span>
              </div>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg">
              <p className="font-medium">Risotto aux champignons</p>
              <p className="text-sm text-gray-600">Coût: 4.80€ | Marge: 68%</p>
              <div className="mt-2">
                <span className="inline-flex px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  Automne
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendrier saisonnier */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Calendrier des saisons</h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-900">Hiver (Actuel)</h5>
              <div className="mt-2 flex flex-wrap gap-1">
                {['Potimarron', 'Endives', 'Poireaux', 'Champignons'].map((item) => (
                  <span key={item} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-500">Printemps (Prochain)</h5>
              <div className="mt-2 flex flex-wrap gap-1">
                {['Asperges', 'Radis', 'Petits pois', 'Fraises'].map((item) => (
                  <span key={item} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Traceability = ({ data }) => {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const batches = data?.batches || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Traçabilité des produits</h3>
        <button className="btn btn-primary">
          Enregistrer lot
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des lots */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Lots récents</h4>
          <div className="space-y-2">
            {batches.map((batch) => (
              <div
                key={batch.id}
                onClick={() => setSelectedBatch(batch)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedBatch?.id === batch.id
                    ? 'bg-primary-50 border-primary-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{batch.ingredient}</p>
                    <p className="text-sm text-gray-600">Lot: {batch.batchNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{batch.supplier}</p>
                    <p className="text-sm text-gray-600">{batch.receivedDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détail du lot */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {selectedBatch ? `Traçabilité - ${selectedBatch.ingredient}` : 'Sélectionnez un lot'}
          </h4>
          
          {selectedBatch ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Numéro de lot</p>
                  <p className="font-medium">{selectedBatch.batchNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fournisseur</p>
                  <p className="font-medium">{selectedBatch.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de réception</p>
                  <p className="font-medium">{selectedBatch.receivedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date d'expiration</p>
                  <p className="font-medium">{selectedBatch.expiryDate}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBatch.certifications?.map((cert, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Utilisation</p>
                <div className="space-y-2">
                  {selectedBatch.usage?.map((use, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm">{use.recipe}</span>
                      <span className="text-sm text-gray-600">{use.quantity} {use.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Sélectionnez un lot pour voir sa traçabilité
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfitabilityAnalysis = ({ data }) => {
  const dishes = data?.dishes || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Analyse de rentabilité</h3>
        <button className="btn btn-primary">
          Nouvelle analyse
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top performers */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Top rentabilité</h4>
          <div className="space-y-3">
            {dishes.slice(0, 5).map((dish, index) => (
              <div key={dish.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{dish.name}</p>
                    <p className="text-sm text-gray-600">{dish.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{dish.margin}%</p>
                  <p className="text-sm text-gray-600">{dish.profit}€</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analyse des coûts */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Répartition des coûts</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Matières premières</span>
                <span className="text-sm font-medium">32%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Main d'œuvre</span>
                <span className="text-sm font-medium">28%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Charges fixes</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Marge nette</span>
                <span className="text-sm font-medium">15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommandations */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recommandations</h4>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border-l-4 border-green-500">
              <p className="font-medium text-green-900">Optimiser les portions</p>
              <p className="text-sm text-green-700">Réduire de 5% les portions du plat X pour améliorer la marge de 3%</p>
            </div>
            
            <div className="p-3 bg-blue-50 border-l-4 border-blue-500">
              <p className="font-medium text-blue-900">Négocier les prix</p>
              <p className="text-sm text-blue-700">Renégocier le prix du saumon avec le fournisseur A</p>
            </div>
            
            <div className="p-3 bg-orange-50 border-l-4 border-orange-500">
              <p className="font-medium text-orange-900">Ajuster les prix</p>
              <p className="text-sm text-orange-700">Augmenter le prix du menu dégustation de 5€</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GastronomyTools;