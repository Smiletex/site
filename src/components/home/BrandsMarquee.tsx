'use client';

import React from 'react';
import Image from 'next/image';

// Données des marques/fournisseurs
const brandsData = [
  { id: 1, name: 'Gildan', logo: '/images/brands/gildan.png', alt: 'Gildan - T-shirts de qualité' },
  { id: 2, name: 'B&C Collection', logo: '/images/brands/bc-collection.png', alt: 'B&C Collection - Vêtements promotionnels' },
  { id: 3, name: 'Fruit of the Loom', logo: '/images/brands/fruit-of-the-loom.png', alt: 'Fruit of the Loom - T-shirts classiques' },
  { id: 4, name: 'Russell', logo: '/images/brands/russell.png', alt: 'Russell - Vêtements de sport' },
  { id: 5, name: 'SOL\'S', logo: '/images/brands/sols.png', alt: 'SOL\'S - Textiles promotionnels' },
  { id: 6, name: 'Kariban', logo: '/images/brands/kariban.png', alt: 'Kariban - Vêtements personnalisables' },
  { id: 7, name: 'Bella+Canvas', logo: '/images/brands/bella-canvas.png', alt: 'Bella+Canvas - T-shirts premium' },
];

export default function BrandsMarquee() {
  return (
    <div className="relative overflow-hidden py-10 bg-white">
      {/* Éléments graphiques abstraits */}
      <div className="absolute left-1/4 top-1/2 w-64 h-64 rounded-full bg-[#FCEB14] opacity-5 blur-3xl transform -translate-y-1/2"></div>
      <div className="absolute right-1/3 top-1/2 w-56 h-56 rounded-full bg-indigo-200 opacity-10 blur-3xl transform -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-1/4 right-1/4 h-16 border-b-2 border-[#FCEB14] opacity-10 rounded-b-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            <span className="relative inline-block">
              Nos marques
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
            </span>
            <span className="ml-2">partenaires</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nous travaillons avec les meilleures marques de textiles pour vous garantir des produits de qualité.
          </p>
        </div>
        
        {/* Marquee animation - premier groupe */}
        <div className="relative">
          <div className="flex animate-marquee space-x-12 py-4">
            {brandsData.map((brand) => (
              <div key={brand.id} className="flex-shrink-0 w-32 h-20 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center p-4 hover:shadow-md transition-shadow duration-300 group">
                <div className="relative w-full h-full">
                  <Image 
                    src={brand.logo} 
                    alt={brand.alt} 
                    fill 
                    sizes="128px"
                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Marquee animation - deuxième groupe (en sens inverse) */}
        <div className="relative mt-4">
          <div className="flex animate-marquee-reverse space-x-12 py-4">
            {[...brandsData].reverse().map((brand) => (
              <div key={`reverse-${brand.id}`} className="flex-shrink-0 w-32 h-20 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center p-4 hover:shadow-md transition-shadow duration-300 group">
                <div className="relative w-full h-full">
                  <Image 
                    src={brand.logo} 
                    alt={brand.alt} 
                    fill 
                    sizes="128px"
                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
