'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Category } from '@/types/products';
import { fetchCategories } from '@/lib/supabase/services/productService';
import { deleteCategory } from '@/lib/supabase/services/adminService';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Charger toutes les catégories au chargement de la page
  useEffect(() => {
    loadCategories();
  }, []);

  // Fonction pour charger les catégories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer une catégorie
  const handleDeleteCategory = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      setLoading(true);
      const success = await deleteCategory(id);
      if (success) {
        // Recharger la liste des catégories
        await loadCategories();
      } else {
        setError('Erreur lors de la suppression de la catégorie');
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la catégorie');
      console.error(err);
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  // Fonction pour obtenir le nom de la catégorie parente
  const getParentCategoryName = (parentId: string | undefined): string => {
    if (!parentId) return 'Aucune';
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Inconnue';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-black text-2xl font-bold">Gestion des Catégories</h1>
        <Link
          href="/admin/categories/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Ajouter une catégorie
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie Parente
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune catégorie trouvée. Commencez par en ajouter une !
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No img
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {category.description || 'Aucune description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getParentCategoryName(category.parent_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/categories/edit/${category.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className={`${
                          deleteConfirm === category.id
                            ? 'text-red-600 font-bold'
                            : 'text-gray-600 hover:text-red-900'
                        }`}
                      >
                        {deleteConfirm === category.id ? 'Confirmer' : 'Supprimer'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
