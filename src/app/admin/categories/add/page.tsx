'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category } from '@/types/products';
import { fetchCategories } from '@/lib/supabase/services/productService';
import { addCategory, uploadProductImage } from '@/lib/supabase/services/adminService';

type CategoryFormData = {
  name: string;
  description: string;
  parent_id: string;
  image_file: File | null;
};

export default function AddCategoryPage() {
  const router = useRouter();
  
  // États pour le formulaire de catégorie
  const [categoryData, setCategoryData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent_id: '',
    image_file: null,
  });
  
  // États pour les catégories parentes
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  
  // États pour le chargement et les erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Charger les catégories au chargement de la page
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setParentCategories(data);
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    };
    
    loadCategories();
  }, []);
  
  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoryData({ ...categoryData, [name]: value });
  };
  
  // Gérer le téléchargement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryData({ ...categoryData, image_file: file });
      
      // Créer une prévisualisation de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Valider les données
      if (!categoryData.name) {
        throw new Error('Veuillez remplir le nom de la catégorie');
      }
      
      // Télécharger l'image si elle existe
      let imageUrl = '';
      if (categoryData.image_file) {
        try {
          // Télécharger directement vers Supabase Storage
          const fileName = `category-${Date.now()}-${categoryData.image_file.name.replace(/\s+/g, '-')}`;
          const supabaseUrl = await uploadProductImage(categoryData.image_file, fileName);
          if (supabaseUrl) {
            imageUrl = supabaseUrl;
          } else {
            console.warn('Impossible de télécharger l\'image, continuation sans image');
          }
        } catch (uploadError) {
          console.warn('Erreur lors du téléchargement de l\'image, continuation sans image:', uploadError);
        }
      }
      
      // Créer la catégorie
      const categoryToAdd = {
        name: categoryData.name,
        description: categoryData.description,
        image_url: imageUrl,
        parent_id: categoryData.parent_id || undefined,
      };
      
      const newCategory = await addCategory(categoryToAdd);
      if (!newCategory) {
        throw new Error('Erreur lors de la création de la catégorie');
      }
      
      // Succès !
      setSuccess(true);
      
      // Rediriger vers la liste des catégories après 2 secondes
      setTimeout(() => {
        router.push('/admin/categories');
      }, 2000);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ajouter une Catégorie</h1>
        <Link
          href="/admin/categories"
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Retour à la liste
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Catégorie ajoutée avec succès ! Redirection en cours...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Nom de la Catégorie *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={categoryData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parent_id">
              Catégorie Parente
            </label>
            <select
              id="parent_id"
              name="parent_id"
              value={categoryData.parent_id}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={categoryData.description}
              onChange={handleChange}
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
              Image de la Catégorie
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Prévisualisation"
                  className="h-32 w-auto object-contain"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer la Catégorie'}
          </button>
        </div>
      </form>
    </div>
  );
}
