'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/lib/products';

interface ProductGalleryProps {
  images?: ProductImage[];
  variantImages?: ProductImage[];
  fallbackImageUrl?: string;
  productName: string;
  categoryBadge?: React.ReactNode;
  customizableBadge?: React.ReactNode;
}

export default function ProductGallery({
  images = [],
  variantImages = [],
  fallbackImageUrl = '/images/placeholder.jpg',
  productName,
  categoryBadge,
  customizableBadge
}: ProductGalleryProps) {
  // Combiner les images du produit général (sans variante) et les images de la variante sélectionnée
  // Les images du produit général sont celles qui ont variant_id = null
  const productGeneralImages = images.filter(img => img.variant_id === null);
  const allImages = [...variantImages, ...productGeneralImages];
  
  // État pour l'image actuellement sélectionnée
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Réinitialiser l'index de l'image sélectionnée quand les images changent
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [variantImages]);
  
  // Si aucune image n'est disponible, utiliser l'image de fallback
  const hasImages = allImages.length > 0;
  
  // Image actuellement affichée
  const currentImageUrl = hasImages 
    ? allImages[selectedImageIndex].image_url 
    : fallbackImageUrl;

  return (
    <div className="relative">
      <div className="relative h-96 md:h-[70vh] max-h-[600px] rounded-lg overflow-hidden">
        {/* Badges de catégorie et personnalisation */}
        {categoryBadge}
        {customizableBadge}
        
        {/* Image principale */}
        <Image
          src={currentImageUrl}
          alt={`${productName} - Image ${selectedImageIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
          className="rounded-lg"
          priority
        />
      </div>
      
      {/* Miniatures des images (uniquement si plus d'une image) */}
      {allImages.length > 1 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <div
              key={`${image.id}-${index}`}
              className={`relative w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                selectedImageIndex === index 
                  ? 'border-indigo-600 shadow-md' 
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <Image
                src={image.image_url}
                alt={`${productName} - Miniature ${index + 1}`}
                fill
                sizes="(max-width: 768px) 64px, 64px"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
