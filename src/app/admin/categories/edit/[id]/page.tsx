'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types/products';
import { fetchCategories } from '@/lib/supabase/services/productService';
import { updateCategory, uploadProductImage } from '@/lib/supabase/services/adminService';

interface EditCategoryPageProps {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const id = params.id;
  const router = useRouter();
  
  // États pour le formulaire de catégorie
  const [categoryData, setCategoryData] = useState<{
    name: string;
    description: string;
    parent_id: string;
    image_url: string;
  }>({
    name: '',
    description: '',
    parent_id: '',
    image_url: '',
  });
  
  // État pour l'image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // États pour les catégories parentes
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  
  // États pour le chargement et les erreurs
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Charger la catégorie et les catégories parentes au chargement de la page
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger toutes les catégories pour le sélecteur de parent
        const allCategories = await fetchCategories();
        
        // Filtrer la catégorie actuelle pour éviter de sélectionner la catégorie elle-même comme parent
        const filteredCategories = allCategories.filter(cat => cat.id !== id);
        setParentCategories(filteredCategories);
        
        // Charger les détails de la catégorie (authentifié via la session admin / cookie).
        const response = await fetch(`/api/admin/categories/${id}`);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Réponse de l\'API:', errorData);
          throw new Error(`Erreur lors du chargement de la catégorie: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.category) {
          setCategoryData({
            name: data.category.name || '',
            description: data.category.description || '',
            parent_id: data.category.parent_id || '',
            image_url: data.category.image_url || '',
          });
          
          if (data.category.image_url) {
            setImagePreview(data.category.image_url);
          }
        } else {
          throw new Error('Catégorie non trouvée');
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement de la catégorie. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({ ...prev, [name]: value }));
  };
  
  // Gérer le téléchargement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Créer une prévisualisation de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      let imageUrl = categoryData.image_url;
      
      // Si une nouvelle image a été sélectionnée, la télécharger
      if (imageFile) {
        const fileName = `category_${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
        const uploadedImageUrl = await uploadProductImage(imageFile, fileName);
        
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        } else {
          setError('Erreur lors du téléchargement de l\'image. Veuillez réessayer.');
          setSubmitting(false);
          return;
        }
      }
      
      // Préparer les données de mise à jour
      const updateData = {
        name: categoryData.name,
        description: categoryData.description,
        parent_id: categoryData.parent_id || undefined, // Utiliser undefined au lieu de null
        image_url: imageUrl,
      };
      
      // Mettre à jour la catégorie
      const success = await updateCategory(id, updateData);
      
      if (success) {
        setSuccess(true);
        
        // Rediriger vers la liste des catégories après un court délai
        setTimeout(() => {
          router.push('/admin/categories');
        }, 2000);
      } else {
        setError('Erreur lors de la mise à jour de la catégorie. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la catégorie:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 text-black">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modifier une catégorie</h1>
        <Link href="/admin/categories" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
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
          Catégorie mise à jour avec succès ! Redirection en cours...
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la catégorie *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={categoryData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie parente
              </label>
              <select
                id="parent_id"
                name="parent_id"
                value={categoryData.parent_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Aucune (catégorie principale)</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={categoryData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formats acceptés : JPG, PNG. Taille maximale : 5 MB
              </p>
            </div>
            
            <div className="flex items-center justify-center">
              {imagePreview ? (
                <div className="relative h-40 w-40 border rounded-md overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Prévisualisation de la catégorie"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 w-40 border rounded-md flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">Aucune image</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
