'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, Category } from '@/types/products';
import { fetchCategories } from '@/lib/supabase/services/productService';
import { updateProduct, uploadProductImage } from '@/lib/supabase/services/adminService';
import ProductForm from '@/components/admin/ProductForm';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  // Utiliser React.use pour accéder aux paramètres (Next.js 14+)
  const id = params.id;
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Charger le produit et les catégories au chargement de la page
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les catégories
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
        
        // Charger le produit
        const response = await fetch(`/api/admin/products/${id}`, {
          headers: {
            'Authorization': `Bearer Admin123`, // Utiliser le mot de passe admin défini dans .env.local
          },
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Réponse de l\'API:', errorData);
          throw new Error(`Erreur lors du chargement du produit: ${response.status}`);
        }
        
        const data = await response.json();
        setProduct(data.product);
        
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement du produit. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  const handleSubmit = async (updatedProduct: Partial<Product>) => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Mettre à jour le produit
      const success = await updateProduct(id, updatedProduct);
      
      if (success) {
        setSuccess(true);
        
        // Rediriger vers la liste des produits après un court délai
        setTimeout(() => {
          router.push('/admin/products');
        }, 2000);
      } else {
        setError('Erreur lors de la mise à jour du produit. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du produit:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 text-black">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modifier un produit</h1>
        <Link href="/admin/products" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
          Retour à la liste
        </Link>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Produit mis à jour avec succès ! Redirection en cours...
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : product ? (
        <ProductForm
          initialProduct={product}
          categories={categories}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-red-600">Produit non trouvé</p>
        </div>
      )}
    </div>
  );
}
