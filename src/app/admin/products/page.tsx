'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types/products';
import { fetchAllProducts } from '@/lib/supabase/services/productService';
import { deleteProduct } from '@/lib/supabase/services/adminService';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Charger tous les produits au chargement de la page
  useEffect(() => {
    loadProducts();
  }, []);
  
  // Filtrer les produits lorsque la recherche change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = products.filter(product => {
      // Recherche par référence fournisseur
      if (product.supplier_reference && product.supplier_reference.toLowerCase().includes(query)) {
        return true;
      }
      // Recherche secondaire par nom de produit
      if (product.name.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    });
    
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Fonction pour charger les produits
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllProducts();
      setProducts(data);
      setFilteredProducts(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un produit
  const handleDeleteProduct = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Réinitialiser les erreurs précédentes
      
      console.log(`Tentative de suppression du produit avec l'ID: ${id}`);
      
      // D'abord, s'assurer que les fonctions de suppression forcée sont disponibles
      try {
        const setupResponse = await fetch('/api/admin/products/force-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer Admin123`, // Utiliser le mot de passe admin défini dans .env.local
          },
        });
        
        if (!setupResponse.ok) {
          console.warn('Erreur lors de la création des fonctions de suppression forcée:', await setupResponse.text());
          // Continuer quand même
        }
      } catch (setupErr) {
        console.warn('Exception lors de la création des fonctions de suppression forcée:', setupErr);
        // Continuer quand même
      }
      
      // Essayer d'abord avec l'API sécurisée
      try {
        const response = await fetch('/api/admin/products/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer Admin123`, // Utiliser le mot de passe admin défini dans .env.local
          },
          body: JSON.stringify({ id }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          console.log(`Produit ${id} supprimé avec succès via l'API`);
          // Recharger la liste des produits
          await loadProducts();
          return;
        } else {
          console.warn(`L'API a échoué avec l'erreur: ${data.error || 'Inconnue'}. Tentative avec la méthode de secours.`);
        }
      } catch (apiErr) {
        console.warn(`Erreur lors de l'appel à l'API de suppression:`, apiErr);
        // Continuer avec la méthode de secours
      }
      
      // Méthode de secours: utiliser la fonction directe
      const success = await deleteProduct(id);
      
      if (success) {
        console.log(`Produit ${id} supprimé avec succès via la méthode directe`);
        // Recharger la liste des produits
        await loadProducts();
      } else {
        console.error(`Échec de la suppression du produit ${id} - Toutes les méthodes ont échoué`);
        setError('Erreur lors de la suppression du produit. Veuillez réessayer ou contacter l\'administrateur.');
      }
    } catch (err) {
      console.error(`Exception lors de la suppression du produit ${id}:`, err);
      setError(`Erreur lors de la suppression du produit: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Gestion des Produits</h1>
        <div className="flex space-x-3">
          <Link 
            href="/admin/schema" 
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Gestion du schéma
          </Link>
          <Link 
            href="/admin/products/import" 
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Importer des produits
          </Link>
          <Link 
            href="/admin/products/add" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
          >
            Ajouter un produit
          </Link>
        </div>
      </div>
      
      {/* Zone de recherche par référence fournisseur */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par référence fournisseur ou nom de produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}
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
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48 lg:w-56">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {products.length === 0 ? 
                      'Aucun produit trouvé. Commencez par en ajouter un !' : 
                      'Aucun produit ne correspond à votre recherche.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No img
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 max-w-[150px] truncate" title={product.name}>{product.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.base_price.toFixed(2)} €</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-[100px] truncate" title={product.category_id}>{product.category_id}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.is_featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_featured ? 'En vedette' : 'Standard'}
                        </span>
                        {product.is_new && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Nouveau
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap md:flex-nowrap gap-2">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-md transition-colors flex items-center flex-1 justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className={`px-3 py-1.5 rounded-md transition-colors flex items-center flex-1 justify-center ${
                            deleteConfirm === product.id
                              ? 'bg-red-600 text-white font-medium'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {deleteConfirm === product.id ? 'Confirmer' : 'Supprimer'}
                        </button>
                      </div>
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
