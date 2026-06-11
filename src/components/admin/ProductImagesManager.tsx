'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/types/products';
import { uploadProductImage, addProductImage, deleteProductImage, setProductPrimaryImage, updateProductImagesOrder } from '@/lib/supabase/services/adminService';

interface ProductImagesManagerProps {
  productId: string;
  initialImages: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

// Composant pour une image
const ProductImageItem = ({ image, onDelete, onSetPrimary }: { 
  image: ProductImage, 
  onDelete: () => void, 
  onSetPrimary: () => void 
}) => {
  return (
    <div className="relative border rounded-md overflow-hidden group">

      <div className="relative h-32 w-32">
        <Image
          src={image.image_url}
          alt="Image produit"
          fill
          className="object-cover"
        />
        {image.is_primary && (
          <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-2 py-1">
            Principale
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        <button 
          type="button"
          onClick={onSetPrimary}
          className="bg-blue-500 text-white p-1 rounded-full m-1"
          title="Définir comme image principale"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button 
          type="button"
          onClick={onDelete}
          className="bg-red-500 text-white p-1 rounded-full m-1"
          title="Supprimer l'image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default function ProductImagesManager({ productId, initialImages, onImagesChange }: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages || []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pas de sensors pour la version simplifiée
  
  // Gérer le téléchargement d'une nouvelle image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    try {
      // Traiter chaque fichier sélectionné
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `product_${productId}_${Date.now()}_${i}_${file.name.replace(/\s+/g, '_')}`;
        
        // Télécharger l'image
        const imageUrl = await uploadProductImage(file, fileName);
        
        if (imageUrl) {
          // Créer l'entrée dans la base de données
          const newImage: Omit<ProductImage, 'id' | 'created_at' | 'updated_at'> = {
            product_id: productId,
            image_url: imageUrl,
            is_primary: images.length === 0, // Première image = image principale
            position: images.length, // Ajouter à la fin
            variant_id: null // Image du produit, pas d'une variante
          };
          
          const result = await addProductImage(newImage);
          
          if (result && result.id) {
            // Ajouter l'image à l'état local
            const addedImage: ProductImage = {
              ...newImage,
              id: result.id
            };
            
            const updatedImages = [...images, addedImage];
            setImages(updatedImages);
            onImagesChange(updatedImages);
          } else {
            setError("Erreur lors de l'ajout de l'image à la base de données");
          }
        } else {
          setError("Erreur lors du téléchargement de l'image");
        }
      }
    } catch (err) {
      console.error("Erreur lors du téléchargement des images:", err);
      setError("Une erreur est survenue lors du téléchargement des images");
    } finally {
      setUploading(false);
      // Réinitialiser le champ de fichier
      e.target.value = '';
    }
  };
  
  // Supprimer une image
  const handleDeleteImage = async (imageId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      try {
        const success = await deleteProductImage(imageId);
        
        if (success) {
          // Mettre à jour l'état local
          const updatedImages = images.filter(img => img.id !== imageId);
          
          // Si l'image supprimée était l'image principale et qu'il reste des images,
          // définir la première image restante comme principale
          if (updatedImages.length > 0 && images.find(img => img.id === imageId)?.is_primary) {
            const firstImage = updatedImages[0];
            await setProductPrimaryImage(productId, firstImage.id);
            
            // Mettre à jour l'état local pour refléter la nouvelle image principale
            updatedImages[0] = { ...firstImage, is_primary: true };
          }
          
          setImages(updatedImages);
          onImagesChange(updatedImages);
        } else {
          setError("Erreur lors de la suppression de l'image");
        }
      } catch (err) {
        console.error("Erreur lors de la suppression de l'image:", err);
        setError("Une erreur est survenue lors de la suppression de l'image");
      }
    }
  };
  
  // Définir une image comme principale
  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      const success = await setProductPrimaryImage(productId, imageId);
      
      if (success) {
        // Mettre à jour l'état local
        const updatedImages = images.map(img => ({
          ...img,
          is_primary: img.id === imageId
        }));
        
        setImages(updatedImages);
        onImagesChange(updatedImages);
      } else {
        setError("Erreur lors de la définition de l'image principale");
      }
    } catch (err) {
      console.error("Erreur lors de la définition de l'image principale:", err);
      setError("Une erreur est survenue lors de la définition de l'image principale");
    }
  };
  
  // Version simplifiée sans réordonnancement par glisser-déposer
  const updateImageOrder = async (imageId: string, newPosition: number) => {
    // Cette fonction n'est pas implémentée dans cette version simplifiée
    // Elle pourrait être ajoutée plus tard avec des boutons "monter" et "descendre"
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <label className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? 'Téléchargement...' : 'Ajouter des images'}
        </label>
        <p className="text-sm text-gray-500">
          Formats acceptés : JPG, PNG. Taille maximale : 5 MB
        </p>
      </div>
      
      <div className="mt-4">
        <h3 className="text-md font-medium mb-2">Images du produit ({images.length})</h3>
        
        {images.length === 0 ? (
          <p className="text-gray-500">Aucune image n'a été ajoutée pour ce produit.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <ProductImageItem
                key={image.id}
                image={image}
                onDelete={() => handleDeleteImage(image.id)}
                onSetPrimary={() => handleSetPrimaryImage(image.id)}
              />
            ))}
          </div>
        )}
        
        {images.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Cliquez sur l'icône <span className="text-blue-500">✓</span> pour définir une image comme principale. L'image principale est utilisée comme image par défaut du produit.
          </p>
        )}
      </div>
    </div>
  );
}
