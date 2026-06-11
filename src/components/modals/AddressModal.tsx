'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CustomerProfile, fetchCustomerProfile, upsertCustomerProfile } from '@/lib/supabase/services/userService';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddressModal({ isOpen, onClose, onSuccess }: AddressModalProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<CustomerProfile>({
    id: '',
    first_name: '',
    last_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'France'
  });

  useEffect(() => {
    if (user && isOpen) {
      const fetchProfile = async () => {
        try {
          // Récupérer le profil depuis Supabase
          const customerProfile = await fetchCustomerProfile(user.id);
          
          if (customerProfile) {
            setProfile({
              ...customerProfile,
              id: user.id
            });
          } else {
            // Si le profil n'existe pas encore, on initialise avec l'ID utilisateur
            setProfile({
              id: user.id,
              first_name: '',
              last_name: '',
              phone: '',
              address_line1: '',
              address_line2: '',
              city: '',
              postal_code: '',
              country: 'France'
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
        }
      };
      
      fetchProfile();
    }
  }, [user, isOpen]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Vérifier que les champs obligatoires sont remplis
      if (!profile.first_name || !profile.last_name || !profile.address_line1 || !profile.city || !profile.postal_code) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Préparer les données du profil
      const customerProfile: CustomerProfile = {
        ...profile,
        id: user.id,
        updated_at: new Date().toISOString()
      };

      // Enregistrer dans Supabase
      const updatedProfile = await upsertCustomerProfile(customerProfile);
      
      if (!updatedProfile) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      // Mise à jour réussie
      onSuccess();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde du profil:', err);
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 text-black">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Adresse de livraison</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom *</label>
                <input
                  type="text"
                  name="first_name"
                  value={profile.first_name || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nom *</label>
                <input
                  type="text"
                  name="last_name"
                  value={profile.last_name || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse ligne 1 *</label>
                <input
                  type="text"
                  name="address_line1"
                  value={profile.address_line1 || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Numéro et nom de rue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse ligne 2</label>
                <input
                  type="text"
                  name="address_line2"
                  value={profile.address_line2 || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Complément d'adresse (optionnel)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ville *</label>
                <input
                  type="text"
                  name="city"
                  value={profile.city || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Code postal *</label>
                <input
                  type="text"
                  name="postal_code"
                  value={profile.postal_code || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Pays *</label>
                <input
                  type="text"
                  name="country"
                  value={profile.country || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isSaving ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer l\'adresse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
