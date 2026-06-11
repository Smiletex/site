'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProductVariant, ProductImage } from '@/types/products';
import { uploadProductImage, addProductImage, deleteProductImage, setVariantPrimaryImage, updateProductVariant, addProductVariant, deleteProductVariant } from '@/lib/supabase/services/adminService';

interface ProductVariantsManagerProps {
  productId: string;
  initialVariants: ProductVariant[];
  initialImages: ProductImage[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  onImagesChange: (images: ProductImage[]) => void;
}

// Composant pour une image de variante
const VariantImageItem = ({ 
  image, 
  onDelete, 
  onSetPrimary 
}: { 
  image: ProductImage, 
  onDelete: () => void, 
  onSetPrimary: () => void 
}) => {
  return (
    <div className="relative border rounded-md overflow-hidden group">
      <div className="relative h-24 w-24">
        <Image
          src={image.image_url}
          alt="Image variante"
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
        {!image.is_primary && (
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
        )}
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

export default function ProductVariantsManager({ 
  productId, 
  initialVariants, 
  initialImages,
  onVariantsChange, 
  onImagesChange 
}: ProductVariantsManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants || []);
  const [images, setImages] = useState<ProductImage[]>(initialImages || []);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Nouvelle variante
  const [newVariant, setNewVariant] = useState<{
    size: string;
    color: string;
    color_url: string;
    stock_quantity: number;
    price_adjustment: number;
  }>({
    size: '',
    color: '',
    color_url: '',
    stock_quantity: 0,
    price_adjustment: 0
  });
  
  // Sélectionner la première variante par défaut
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    }
  }, [variants, selectedVariant]);
  
  // Filtrer les images pour la variante sélectionnée
  const variantImages = selectedVariant 
    ? images.filter(img => img.variant_id === selectedVariant.id)
    : [];
  
  // Gérer le téléchargement d'une nouvelle image pour une variante
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedVariant) {
      setError("Veuillez d'abord sélectionner une variante");
      return;
    }
    
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    try {
      // Traiter chaque fichier sélectionné
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `variant_${selectedVariant.id}_${Date.now()}_${i}_${file.name.replace(/\s+/g, '_')}`;
        
        // Télécharger l'image
        const imageUrl = await uploadProductImage(file, fileName);
        
        if (imageUrl) {
          // Créer l'entrée dans la base de données
          const newImage: Omit<ProductImage, 'id' | 'created_at' | 'updated_at'> = {
            product_id: productId,
            variant_id: selectedVariant.id,
            image_url: imageUrl,
            is_primary: variantImages.length === 0, // Première image = image principale
            position: variantImages.length // Ajouter à la fin
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
            setSuccess("Image ajoutée avec succès");
            
            // Masquer le message de succès après 3 secondes
            setTimeout(() => setSuccess(null), 3000);
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
          
          // Si l'image supprimée était l'image principale et qu'il reste des images pour cette variante,
          // définir la première image restante comme principale
          const deletedImage = images.find(img => img.id === imageId);
          if (deletedImage?.is_primary && selectedVariant) {
            const remainingVariantImages = updatedImages.filter(img => img.variant_id === selectedVariant.id);
            
            if (remainingVariantImages.length > 0) {
              const firstImage = remainingVariantImages[0];
              await setVariantPrimaryImage(selectedVariant.id, firstImage.id);
              
              // Mettre à jour l'état local pour refléter la nouvelle image principale
              const finalImages = updatedImages.map(img => 
                img.id === firstImage.id ? { ...img, is_primary: true } : img
              );
              
              setImages(finalImages);
              onImagesChange(finalImages);
              return;
            }
          }
          
          setImages(updatedImages);
          onImagesChange(updatedImages);
          setSuccess("Image supprimée avec succès");
          
          // Masquer le message de succès après 3 secondes
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError("Erreur lors de la suppression de l'image");
        }
      } catch (err) {
        console.error("Erreur lors de la suppression de l'image:", err);
        setError("Une erreur est survenue lors de la suppression de l'image");
      }
    }
  };
  
  // Définir une image comme principale pour une variante
  const handleSetPrimaryImage = async (imageId: string) => {
    if (!selectedVariant) return;
    
    try {
      const success = await setVariantPrimaryImage(selectedVariant.id, imageId);
      
      if (success) {
        // Mettre à jour l'état local
        const updatedImages = images.map(img => ({
          ...img,
          is_primary: img.id === imageId && img.variant_id === selectedVariant.id
        }));
        
        setImages(updatedImages);
        onImagesChange(updatedImages);
        setSuccess("Image principale définie avec succès");
        
        // Masquer le message de succès après 3 secondes
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Erreur lors de la définition de l'image principale");
      }
    } catch (err) {
      console.error("Erreur lors de la définition de l'image principale:", err);
      setError("Une erreur est survenue lors de la définition de l'image principale");
    }
  };
  
  // Mettre à jour une variante
  const handleUpdateVariant = async (variant: ProductVariant, field: string, value: any) => {
    try {
      const updatedVariant = { ...variant, [field]: value };
      const success = await updateProductVariant(variant.id, { [field]: value });
      
      if (success) {
        // Mettre à jour l'état local
        const updatedVariants = variants.map(v => 
          v.id === variant.id ? updatedVariant : v
        );
        
        setVariants(updatedVariants);
        onVariantsChange(updatedVariants);
        
        // Si c'est la variante sélectionnée, mettre à jour également
        if (selectedVariant && selectedVariant.id === variant.id) {
          setSelectedVariant(updatedVariant);
        }
        
        setSuccess(`Variante mise à jour: ${field}`);
        
        // Masquer le message de succès après 3 secondes
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Erreur lors de la mise à jour de la variante");
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la variante:", err);
      setError("Une erreur est survenue lors de la mise à jour de la variante");
    }
  };
  
  // Ajouter une nouvelle variante
  const handleAddVariant = async () => {
    try {
      if (!newVariant.size) {
        setError("La taille est requise");
        return;
      }
      
      const variantToAdd: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'> = {
        product_id: productId,
        size: newVariant.size,
        color: newVariant.color || null,
        color_url: newVariant.color_url || null,
        stock_quantity: newVariant.stock_quantity,
        price_adjustment: newVariant.price_adjustment
      };
      
      const result = await addProductVariant(variantToAdd);
      
      if (result && result.id) {
        // Ajouter la variante à l'état local
        const addedVariant: ProductVariant = {
          ...variantToAdd,
          id: result.id
        };
        
        const updatedVariants = [...variants, addedVariant];
        setVariants(updatedVariants);
        onVariantsChange(updatedVariants);
        
        // Sélectionner la nouvelle variante
        setSelectedVariant(addedVariant);
        
        // Réinitialiser le formulaire
        setNewVariant({
          size: '',
          color: '',
          color_url: '',
          stock_quantity: 0,
          price_adjustment: 0
        });
        
        setSuccess("Nouvelle variante ajoutée avec succès");
        
        // Masquer le message de succès après 3 secondes
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Erreur lors de l'ajout de la variante");
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout de la variante:", err);
      setError("Une erreur est survenue lors de l'ajout de la variante");
    }
  };
  
  // Supprimer une variante
  const handleDeleteVariant = async (variantId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette variante ? Toutes les images associées seront également supprimées.")) {
      try {
        const success = await deleteProductVariant(variantId);
        
        if (success) {
          // Supprimer également toutes les images associées à cette variante
          const variantImages = images.filter(img => img.variant_id === variantId);
          for (const img of variantImages) {
            await deleteProductImage(img.id);
          }
          
          // Mettre à jour l'état local
          const updatedVariants = variants.filter(v => v.id !== variantId);
          const updatedImages = images.filter(img => img.variant_id !== variantId);
          
          setVariants(updatedVariants);
          onVariantsChange(updatedVariants);
          
          setImages(updatedImages);
          onImagesChange(updatedImages);
          
          // Si c'était la variante sélectionnée, sélectionner la première variante restante
          if (selectedVariant && selectedVariant.id === variantId) {
            setSelectedVariant(updatedVariants.length > 0 ? updatedVariants[0] : null);
          }
          
          setSuccess("Variante supprimée avec succès");
          
          // Masquer le message de succès après 3 secondes
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError("Erreur lors de la suppression de la variante");
        }
      } catch (err) {
        console.error("Erreur lors de la suppression de la variante:", err);
        setError("Une erreur est survenue lors de la suppression de la variante");
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {/* Liste des variantes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Variantes du produit ({variants.length})</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taille
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Couleur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ajustement Prix (€)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {variants.map((variant) => (
                <tr 
                  key={variant.id} 
                  className={`${selectedVariant?.id === variant.id ? 'bg-indigo-50' : 'hover:bg-gray-50'} cursor-pointer`}
                  onClick={() => setSelectedVariant(variant)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {variant.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      {variant.color_url ? (
                        <div className="h-6 w-6 rounded-full border border-gray-300 overflow-hidden mr-2">
                          <Image 
                            src={variant.color_url} 
                            alt={variant.color || ''} 
                            width={24} 
                            height={24}
                            className="object-cover"
                          />
                        </div>
                      ) : variant.color ? (
                        <div 
                          className="h-6 w-6 rounded-full border border-gray-300 mr-2" 
                          style={{ backgroundColor: variant.color }}
                        />
                      ) : null}
                      {variant.color || 'Non spécifiée'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price_adjustment}
                      onChange={(e) => handleUpdateVariant(variant, 'price_adjustment', parseFloat(e.target.value) || 0)}
                      className="w-20 p-1 border rounded-md"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVariant(variant.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Ajouter une nouvelle variante */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Ajouter une nouvelle variante</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taille *
            </label>
            <input
              type="text"
              value={newVariant.size}
              onChange={(e) => setNewVariant({...newVariant, size: e.target.value})}
              className="w-full p-2 border rounded-md"
              placeholder="Ex: S, M, L, XL"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur
            </label>
            <input
              type="text"
              value={newVariant.color || ''}
              onChange={(e) => setNewVariant({...newVariant, color: e.target.value})}
              className="w-full p-2 border rounded-md"
              placeholder="Ex: Rouge, Bleu"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de couleur
            </label>
            <input
              type="text"
              value={newVariant.color_url || ''}
              onChange={(e) => setNewVariant({...newVariant, color_url: e.target.value})}
              className="w-full p-2 border rounded-md"
              placeholder="URL d'image de couleur"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ajustement Prix (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={newVariant.price_adjustment}
              onChange={(e) => setNewVariant({...newVariant, price_adjustment: parseFloat(e.target.value) || 0})}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <button
            type="button"
            onClick={handleAddVariant}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Ajouter la variante
          </button>
        </div>
      </div>
      
    </div>
  );
}
