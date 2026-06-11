'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProductImage, ProductVariant } from '@/types/products';
import { uploadProductImage, addProductImage, deleteProductImage, setProductPrimaryImage, setVariantPrimaryImage, replaceProductImage } from '@/lib/supabase/services/adminService';
import { supabase } from '@/lib/supabase/client';

interface ProductAllImagesManagerProps {
  productId: string;
  initialImages: ProductImage[];
  variants: ProductVariant[];
  onImagesChange: (images: ProductImage[]) => void;
}

// Composant pour une image
const ImageItem = ({ 
  image, 
  onDelete, 
  onSetPrimary,
  onReplace,
  isPrimary,
  variantName = null
}: { 
  image: ProductImage, 
  onDelete: () => void, 
  onSetPrimary: () => void,
  onReplace: () => void,
  isPrimary: boolean,
  variantName?: string | null
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
        {isPrimary && (
          <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-2 py-1">
            Principale
          </div>
        )}
        {variantName && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 text-center">
            {variantName}
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        {!isPrimary && (
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
          onClick={onReplace}
          className="bg-yellow-500 text-white p-1 rounded-full m-1"
          title="Remplacer l'image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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

export default function ProductAllImagesManager({ 
  productId, 
  initialImages, 
  variants,
  onImagesChange 
}: ProductAllImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages || []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Organiser les variantes par couleur (en utilisant color_url ou color)
  const variantsByColor: { [colorKey: string]: ProductVariant[] } = {};
  const colorKeyMap: { [colorKey: string]: string } = {}; // Pour stocker le nom d'affichage de chaque clé de couleur
  
  variants.forEach(variant => {
    // Créer une clé unique pour chaque couleur
    // Priorité à color_url, puis color, puis "Sans couleur"
    let colorKey = '';
    let displayName = '';
    
    if (variant.color_url) {
      colorKey = `url:${variant.color_url}`;
      displayName = variant.color || 'Couleur personnalisée';
    } else if (variant.color) {
      colorKey = `color:${variant.color}`;
      displayName = variant.color;
    } else {
      colorKey = 'no-color';
      displayName = 'Sans couleur';
    }
    
    // Stocker le nom d'affichage
    colorKeyMap[colorKey] = displayName;
    
    // Ajouter la variante au groupe de couleur
    if (!variantsByColor[colorKey]) {
      variantsByColor[colorKey] = [];
    }
    variantsByColor[colorKey].push(variant);
  });
  
  // Nous n'utilisons plus les images générales du produit
  // const generalImages = images.filter(img => img.variant_id === null);
  
  // Obtenir les images par couleur de variante
  const imagesByColor: { [colorKey: string]: ProductImage[] } = {};
  Object.keys(variantsByColor).forEach(colorKey => {
    const variantIds = variantsByColor[colorKey].map(v => v.id);
    imagesByColor[colorKey] = images.filter(img => img.variant_id && variantIds.includes(img.variant_id));
  });
  
  // Gérer le téléchargement d'une nouvelle image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Vérifier qu'une variante est sélectionnée
    if (!selectedVariantId) {
      setError("Veuillez sélectionner une variante avant d'ajouter des images");
      e.target.value = '';
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Traiter chaque fichier sélectionné
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `variant_${selectedVariantId}_${Date.now()}_${i}_${file.name.replace(/\s+/g, '_')}`;
        
        // Télécharger l'image
        const imageUrl = await uploadProductImage(file, fileName);
        
        if (imageUrl) {
          // Créer l'entrée dans la base de données
          const newImage: Omit<ProductImage, 'id' | 'created_at' | 'updated_at'> = {
            product_id: productId,
            variant_id: selectedVariantId,
            image_url: imageUrl,
            is_primary: !images.some(img => img.variant_id === selectedVariantId && img.is_primary),
            position: images.length
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
          const deletedImage = images.find(img => img.id === imageId);
          const updatedImages = images.filter(img => img.id !== imageId);
          
          // Si l'image supprimée était l'image principale, définir une nouvelle image principale
          if (deletedImage?.is_primary) {
            const variantId = deletedImage.variant_id;
            const remainingImages = updatedImages.filter(img => img.variant_id === variantId);
            
            if (remainingImages.length > 0) {
              const firstImage = remainingImages[0];
              
              if (variantId) {
                await setVariantPrimaryImage(variantId, firstImage.id);
              } else {
                await setProductPrimaryImage(productId, firstImage.id);
              }
              
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
  
  // Définir une image comme principale
  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      const image = images.find(img => img.id === imageId);
      if (!image) return;
      
      let success = false;
      
      if (image.variant_id) {
        // Image de variante
        success = await setVariantPrimaryImage(image.variant_id, imageId);
      } else {
        // Image générale du produit
        success = await setProductPrimaryImage(productId, imageId);
      }
      
      if (success) {
        // Mettre à jour l'état local
        const updatedImages = images.map(img => ({
          ...img,
          is_primary: img.variant_id === image.variant_id && img.id === imageId
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
  
  // Préparer le remplacement d'une image
  const handlePrepareReplace = (imageId: string) => {
    setReplacingImageId(imageId);
    // Déclencher le clic sur l'input de fichier caché
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Remplacer une image
  const handleReplaceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!replacingImageId) return;
    
    const files = e.target.files;
    if (!files || files.length === 0) {
      setReplacingImageId(null);
      return;
    }
    
    const file = files[0];
    setUploading(true);
    setError(null);
    
    try {
      // Remplacer l'image
      const success = await replaceProductImage(replacingImageId, file);
      
      if (success) {
        // Récupérer l'URL de la nouvelle image
        const { data: updatedImage } = await supabase
          .from('product_images')
          .select('*')
          .eq('id', replacingImageId)
          .single();
        
        if (updatedImage) {
          // Mettre à jour l'état local
          const updatedImages = images.map(img => 
            img.id === replacingImageId ? { ...img, image_url: updatedImage.image_url } : img
          );
          
          setImages(updatedImages);
          onImagesChange(updatedImages);
          setSuccess("Image remplacée avec succès");
          
          // Masquer le message de succès après 3 secondes
          setTimeout(() => setSuccess(null), 3000);
        }
      } else {
        setError("Erreur lors du remplacement de l'image");
      }
    } catch (err) {
      console.error("Erreur lors du remplacement de l'image:", err);
      setError("Une erreur est survenue lors du remplacement de l'image");
    } finally {
      setUploading(false);
      setReplacingImageId(null);
      // Réinitialiser le champ de fichier
      e.target.value = '';
    }
  };
  
  // Obtenir le nom de la variante pour l'affichage
  const getVariantName = (variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return '';
    return `${variant.size}${variant.color ? ` - ${variant.color}` : ''}`;
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
      
      {/* Sélecteur de couleur et de taille pour l'upload */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <span className="relative">
            Sélectionner une couleur
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400 rounded-full"></span>
          </span>
        </h3>
        
        {/* Boutons de couleur */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.keys(variantsByColor).map((colorKey) => {
            const colorVariants = variantsByColor[colorKey];
            const displayName = colorKeyMap[colorKey];
            const firstVariant = colorVariants[0];
            
            // Déterminer si c'est une couleur hexadécimale ou une URL d'image
            const isHexColor = firstVariant.color && /^#[0-9A-F]{6}$/i.test(firstVariant.color);
            const isImageUrl = firstVariant.color_url && (firstVariant.color_url.startsWith('http://') || firstVariant.color_url.startsWith('https://'));
            
            // Déterminer si cette couleur est sélectionnée
            const isSelected = colorVariants.some(v => v.id === selectedVariantId);
            
            return (
              <div key={colorKey} className="text-center">
                <button
                  type="button"
                  className={`p-2 transition-all ${isSelected ? 'scale-110 transform' : ''}`}
                  onClick={() => {
                    // Sélectionner la première variante de cette couleur
                    setSelectedVariantId(colorVariants[0].id);
                  }}
                  title={displayName}
                >
                  {isHexColor ? (
                    <div 
                      className={`w-12 h-12 rounded-full border-2 ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300 hover:border-indigo-400'}`} 
                      style={{ backgroundColor: firstVariant.color || undefined }}
                    />
                  ) : isImageUrl ? (
                    <div 
                      className={`w-12 h-12 rounded-full border-2 overflow-hidden ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300 hover:border-indigo-400'}`}
                    >
                      <Image 
                        src={firstVariant.color_url || ''} 
                        alt={displayName} 
                        width={48} 
                        height={48} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 border-2 ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300 hover:border-indigo-400'}`}>
                      <span className={`text-sm ${isSelected ? 'font-bold text-indigo-700' : 'text-gray-700'}`}>
                        {displayName.substring(0, 3)}
                      </span>
                    </div>
                  )}
                </button>
                <p className="text-xs mt-1 font-medium text-gray-700">{displayName}</p>
              </div>
            );
          })}
        </div>
        
        {/* Sélecteur de taille (visible uniquement si une couleur est sélectionnée) */}
        {selectedVariantId && (
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <span className="relative">
                Sélectionner une taille
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400 rounded-full"></span>
              </span>
            </h3>
            
            {/* Trouver la couleur sélectionnée */}
            {(() => {
              const selectedVariant = variants.find(v => v.id === selectedVariantId);
              if (!selectedVariant) return null;
              
              // Trouver toutes les variantes de la même couleur
              const selectedColorKey = Object.keys(variantsByColor).find(key => 
                variantsByColor[key].some(v => v.id === selectedVariantId)
              );
              
              if (!selectedColorKey) return null;
              
              const colorVariants = variantsByColor[selectedColorKey];
              
              return (
                <div className="flex flex-wrap gap-3 mb-6">
                  {colorVariants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      className={`px-4 py-2 border-2 rounded-md transition-all ${variant.id === selectedVariantId ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-gray-300 hover:border-indigo-400 text-gray-700'}`}
                      onClick={() => setSelectedVariantId(variant.id)}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
        
        {/* Bouton d'ajout d'images */}
        <div className="flex items-center space-x-4 mt-6">
          <label className={`inline-block px-4 py-2 ${selectedVariantId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'} text-white rounded-md cursor-pointer transition-all`}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading || !selectedVariantId}
            />
            {uploading ? 'Téléchargement...' : 'Ajouter des images'}
          </label>
          <p className="text-sm text-gray-500">
            Formats acceptés : JPG, PNG. Taille maximale : 5 MB
          </p>
        </div>
      </div>
      
      {/* La section "Images du produit" a été supprimée car elle n'est pas utilisée */}
      
      {/* Input caché pour le remplacement d'image */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleReplaceImage}
      />
      
      {/* Images par couleur de variante */}
      {Object.keys(variantsByColor).map((colorKey) => {
        const colorImages = imagesByColor[colorKey] || [];
        if (colorImages.length === 0) return null;
        
        // Obtenir le nom d'affichage de la couleur
        const displayName = colorKeyMap[colorKey];
        
        // Afficher un aperçu de la couleur si disponible
        const firstVariant = variantsByColor[colorKey][0];
        const hasColorPreview = firstVariant.color_url || (firstVariant.color && firstVariant.color.startsWith('#'));
        
        return (
          <div key={colorKey} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              {hasColorPreview && (
                <span className="inline-block mr-2">
                  {firstVariant.color_url ? (
                    <div className="h-6 w-6 rounded-full border border-gray-300 overflow-hidden">
                      <Image 
                        src={firstVariant.color_url} 
                        alt={displayName} 
                        width={24} 
                        height={24}
                        className="object-cover"
                      />
                    </div>
                  ) : firstVariant.color && firstVariant.color.startsWith('#') ? (
                    <div 
                      className="h-6 w-6 rounded-full border border-gray-300" 
                      style={{ backgroundColor: firstVariant.color }}
                    />
                  ) : null}
                </span>
              )}
              Images pour {displayName}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {colorImages.map((image) => (
                <ImageItem
                  key={image.id}
                  image={image}
                  isPrimary={image.is_primary}
                  variantName={getVariantName(image.variant_id as string)}
                  onDelete={() => handleDeleteImage(image.id)}
                  onSetPrimary={() => handleSetPrimaryImage(image.id)}
                  onReplace={() => handlePrepareReplace(image.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
