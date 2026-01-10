import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Restaurants = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const queryClient = useQueryClient();

  const { data: restaurants, isLoading } = useQuery(
    'restaurants',
    () => axios.get('/api/restaurants').then(res => res.data)
  );

  const createMutation = useMutation(
    (data) => axios.post('/api/restaurants', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('restaurants');
        setShowModal(false);
        toast.success('Restaurant créé avec succès');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la création');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => axios.put(`/api/restaurants/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('restaurants');
        setShowModal(false);
        setEditingRestaurant(null);
        toast.success('Restaurant modifié avec succès');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la modification');
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => axios.delete(`/api/restaurants/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('restaurants');
        toast.success('Restaurant supprimé avec succès');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  );

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce restaurant ?')) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-600">Gérez vos établissements</p>
        </div>
        <button
          onClick={() => {
            setEditingRestaurant(null);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nouveau restaurant</span>
        </button>
      </div>

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants?.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <RestaurantModal
          restaurant={editingRestaurant}
          onClose={() => {
            setShowModal(false);
            setEditingRestaurant(null);
          }}
          onSubmit={(data) => {
            if (editingRestaurant) {
              updateMutation.mutate({ id: editingRestaurant.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      )}
    </div>
  );
};

const RestaurantCard = ({ restaurant, onEdit, onDelete }) => {
  const getTypeLabel = (type) => {
    switch (type) {
      case 'chain': return 'Chaîne';
      case 'gastronomy': return 'Gastronomique';
      default: return 'Standard';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'chain': return 'bg-blue-100 text-blue-800';
      case 'gastronomy': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <BuildingStorefrontIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{restaurant.name}</h3>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(restaurant.type)}`}>
              {getTypeLabel(restaurant.type)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(restaurant)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(restaurant.id)}
            className="p-2 text-gray-400 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {restaurant.address && (
          <p><strong>Adresse:</strong> {restaurant.address}</p>
        )}
        {restaurant.phone && (
          <p><strong>Téléphone:</strong> {restaurant.phone}</p>
        )}
        {restaurant.email && (
          <p><strong>Email:</strong> {restaurant.email}</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Créé le:</span>
          <span className="font-medium">
            {new Date(restaurant.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
    </div>
  );
};

const RestaurantModal = ({ restaurant, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    type: restaurant?.type || 'standard',
    address: restaurant?.address || '',
    phone: restaurant?.phone || '',
    email: restaurant?.email || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
                  {restaurant ? 'Modifier le restaurant' : 'Nouveau restaurant'}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Nom du restaurant *</label>
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
                  <label className="label">Type *</label>
                  <select
                    name="type"
                    required
                    className="input"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="standard">Standard</option>
                    <option value="chain">Chaîne</option>
                    <option value="gastronomy">Gastronomique</option>
                  </select>
                </div>

                <div>
                  <label className="label">Adresse</label>
                  <textarea
                    name="address"
                    rows={3}
                    className="input"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input"
                    value={formData.email}
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
                {isLoading ? <LoadingSpinner size="sm" /> : (restaurant ? 'Modifier' : 'Créer')}
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

export default Restaurants;