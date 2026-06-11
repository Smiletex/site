'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
};

export default function ProductCategories() {
  // Définition des catégories
  const categories = [
    { id: 't-shirt', name: 'T-shirts' },
    { id: 'polo', name: 'Polos' },
    { id: 'sweat', name: 'Sweats' },
    { id: 'pull', name: 'Pulls' },
    { id: 'veste', name: 'Vestes' },
    { id: 'workwear', name: 'Tenues de travail' },
    { id: 'accessoire', name: 'Accessoires' },
    { id: 'bas', name: 'Bas' }
  ];
  
  // Fonction pour obtenir l'image correspondante à chaque catégorie
  const getCategoryImage = (categoryId: string): string => {
    // Correspondance entre les IDs de catégories et les images existantes
    const imageMapping: {[key: string]: string} = {
      't-shirt': '/images/t-shirt.jpg',
      'polo': '/images/polo.jpg',
      'sweat': '/images/sweat.jpg',
      'pull': '/images/sweatshirt.jpg', // Utiliser sweatshirt comme fallback pour pull
      'veste': '/images/veste.jpg',
      'workwear': '/images/workwear.jpg',
      'accessoire': '/images/casquette.png', // Utiliser casquette comme exemple d'accessoire
      'bas': '/images/pantalon.png' // Utiliser pantalon comme exemple de bas
    };
    
    // Retourner l'image correspondante ou une image par défaut
    return imageMapping[categoryId] || '/images/placeholder.jpg';
  };

  return (
    <>
      {/* Catégories de produits */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Éléments graphiques abstraits */}
        <div className="absolute left-1/4 top-1/3 w-64 h-64 rounded-full bg-indigo-200 opacity-5 blur-3xl"></div>
        <div className="absolute right-1/3 bottom-1/4 w-72 h-72 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
        <div className="absolute right-1/2 top-1/2 w-96 h-32 rounded-b-full border-b-8 border-indigo-200 opacity-5 transform rotate-6"></div>
        
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="relative inline-block">
                Catégories de
              </span>
              <span className="ml-2 relative inline-block text-indigo-600">
                vêtements personnalisés
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
              </span>
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Découvrez notre sélection de vêtements personnalisables par catégorie.
            </p>
          </div>
          
          {/* Grille de catégories - 4 par ligne sur desktop, 2 sur mobile */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {categories.map((category) => (
              <Link 
                href="/products" 
                key={category.id} 
                className="group relative overflow-hidden rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                {/* Image de fond représentant la catégorie */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={getCategoryImage(category.id)}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={category.id === 't-shirt'}
                    loading={category.id === 't-shirt' ? 'eager' : 'lazy'}
                    quality={category.id === 't-shirt' ? 80 : 70}
                  />
                  
                  {/* Dégradé pour assurer la lisibilité du texte */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                  
                  {/* Nom de la catégorie en bas */}
                  <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 md:p-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-[#FCEB14] transition-colors duration-300">
                      {category.name}
                    </h3>
                    <div className="flex items-center mt-0.5 sm:mt-1">
                      <span className="text-xs sm:text-sm text-white/90 group-hover:text-white transition-colors duration-300">
                        Découvrir
                      </span>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-white/90 group-hover:text-[#FCEB14] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Indicateur visuel au survol - masqué sur mobile, visible sur desktop */}
                  <div className="hidden sm:block absolute top-3 right-3 md:top-4 md:right-4 bg-white/0 text-white/0 rounded-full p-1.5 md:p-2 transform scale-90 opacity-0 group-hover:bg-white/90 group-hover:text-indigo-600 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      <div className="text-center mt-8 mb-16 relative">
        {/* Formes abstraites évoquant le sourire */}
        <div className="absolute left-1/3 -top-8 w-1/3 h-16 border-t-4 border-indigo-200 opacity-10 rounded-t-full"></div>
        
        <Link 
          href="/products" 
          className="inline-block bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-8 rounded-xl text-lg shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
        >
          <span className="relative z-10">
            Voir tous les produits
          </span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
        </Link>
      </div>
    </>
  );
}
