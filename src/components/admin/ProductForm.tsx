'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, Category, ProductImage, ProductVariant } from '@/types/products';
import { uploadProductImage } from '@/lib/supabase/services/adminService';
import ProductAllImagesManager from './ProductAllImagesManager';
import ProductVariantsManager from './ProductVariantsManager';

interface ProductFormProps {
  initialProduct?: Partial<Product>;
  categories: Category[];
  onSubmit: (product: Partial<Product>) => Promise<void>;
  isSubmitting: boolean;
}

export default function ProductForm({ initialProduct, categories, onSubmit, isSubmitting }: ProductFormProps) {
  const [product, setProduct] = useState<Partial<Product>>(
    initialProduct || {
      name: '',
      description: '',
      base_price: 0,
      category_id: '',
      is_featured: false,
      is_new: true,
      image_url: '',
      weight_gsm: null,
      supplier_reference: ''
    }
  );
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product.image_url || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProduct({ ...product, [name]: checked });
    } else if (type === 'number') {
      setProduct({ ...product, [name]: parseFloat(value) });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Créer une URL temporaire pour la prévisualisation
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedProduct = { ...product };
    
    // Si une nouvelle image a été sélectionnée, la télécharger d'abord
    if (imageFile) {
      setUploadingImage(true);
      try {
        const fileName = `product_${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
        const imageUrl = await uploadProductImage(imageFile, fileName);
        
        if (imageUrl) {
          updatedProduct.image_url = imageUrl;
        }
      } catch (err) {
        console.error('Erreur lors du téléchargement de l\'image:', err);
        alert('Erreur lors du téléchargement de l\'image. Veuillez réessayer.');
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }
    
    // Soumettre le produit
    await onSubmit(updatedProduct);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Informations de base</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du produit *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={product.name || ''}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
              Prix de base (€) *
            </label>
            <input
              type="number"
              id="base_price"
              name="base_price"
              value={product.base_price || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={product.category_id || ''}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
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
              value={product.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Images et variantes du produit */}
      {initialProduct?.id ? (
        <div className="space-y-6">
          {/* Toutes les images du produit */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Images du produit</h2>
            <p className="text-sm text-gray-500 mb-4">
              Gérez toutes les images du produit, regroupées par variante.
            </p>
            
            <ProductAllImagesManager
              productId={initialProduct.id}
              initialImages={initialProduct.images || []}
              variants={initialProduct.variants || []}
              onImagesChange={(updatedImages: ProductImage[]) => {
                // Mettre à jour l'image principale du produit si nécessaire
                const primaryImage = updatedImages.find((img: ProductImage) => img.is_primary && img.variant_id === null);
                if (primaryImage) {
                  setProduct(prev => ({
                    ...prev,
                    image_url: primaryImage.image_url
                  }));
                }
                
                // Mettre à jour le produit avec toutes les images
                setProduct(prev => ({
                  ...prev,
                  images: updatedImages
                }));
              }}
            />
          </div>
          
          {/* Gestion des variantes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Variantes du produit</h2>
            <p className="text-sm text-gray-500 mb-4">
              Gérez les différentes variantes (tailles, couleurs) de votre produit.
            </p>
            
            <ProductVariantsManager
              productId={initialProduct.id}
              initialVariants={initialProduct.variants || []}
              initialImages={initialProduct.images || []}
              onVariantsChange={(updatedVariants: ProductVariant[]) => {
                // Mettre à jour le produit avec les variantes
                setProduct(prev => ({
                  ...prev,
                  variants: updatedVariants
                }));
              }}
              onImagesChange={(updatedVariantImages: ProductImage[]) => {
                // Conserver les images générales du produit
                const generalImages = (initialProduct.images || []).filter(img => img.variant_id === null);
                const allImages = [...generalImages, ...updatedVariantImages];
                
                // Mettre à jour le produit avec toutes les images
                setProduct(prev => ({
                  ...prev,
                  images: allImages
                }));
              }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Image principale</h2>
          <p className="text-sm text-gray-500 mb-4">
            Ajoutez une image principale pour votre produit. Vous pourrez ajouter d'autres images et gérer les variantes après avoir créé le produit.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Image principale
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
                    alt="Prévisualisation du produit"
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
        </div>
      )}
      
      {/* Caractéristiques techniques */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Caractéristiques techniques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="weight_gsm" className="block text-sm font-medium text-gray-700 mb-1">
              Grammage (g/m²)
            </label>
            <input
              type="number"
              id="weight_gsm"
              name="weight_gsm"
              value={product.weight_gsm ?? ''}
              onChange={handleChange}
              min="0"
              className="w-full p-2 border rounded-md"
              placeholder="Ex: 180"
            />
            <p className="text-xs text-gray-500 mt-1">
              Poids du tissu en grammes par mètre carré
            </p>
          </div>
          
          <div>
            <label htmlFor="supplier_reference" className="block text-sm font-medium text-gray-700 mb-1">
              Référence Fournisseur
            </label>
            <input
              type="text"
              id="supplier_reference"
              name="supplier_reference"
              value={product.supplier_reference || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="Ex: REF-12345"
            />
            <p className="text-xs text-gray-500 mt-1">
              Référence du produit chez le fournisseur
            </p>
          </div>
        </div>
      </div>
      
      {/* Options supplémentaires */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Options supplémentaires</h2>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={product.is_featured || false}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
              Produit en vedette
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_new"
              name="is_new"
              checked={product.is_new || false}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="is_new" className="ml-2 block text-sm text-gray-700">
              Nouveau produit
            </label>
          </div>
        </div>
      </div>
      
      {/* Bouton de soumission */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || uploadingImage}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting || uploadingImage ? 'Enregistrement...' : 'Enregistrer le produit'}
        </button>
      </div>
    </form>
  );
}
