'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import TechniqueModal from './TechniqueModal';

// Données détaillées pour chaque technique
const techniquesData = [
  {
    id: 'dtf',
    title: 'Le transfert DTF',
    image: '/images/dtf.jpg',
    description: 'Technologie innovante pour des impressions textiles de haute qualité.',
    details: 'Le transfert DTF (Direct to Film) est une méthode d\'impression qui consiste à imprimer votre design sur un film spécial, puis à le transférer sur le textile à l\'aide d\'une poudre adhésive et d\'une presse à chaud.',
    advantages: [
      'Couleurs éclatantes et détails précis',
      'Durabilité exceptionnelle au lavage',
      'Compatible avec presque tous types de textiles',
      'Idéal pour les petites et moyennes séries'
    ],
    useCases: [
      'T-shirts personnalisés avec designs complexes',
      'Vêtements de sport et techniques',
      'Textiles foncés nécessitant des couleurs vives',
      'Designs avec dégradés et détails fins'
    ]
  },
  {
    id: 'dtg',
    title: 'L\'impression DTG',
    image: '/images/dtg.png',
    description: 'Impressions détaillées directement sur les vêtements.',
    details: 'L\'impression DTG (Direct to Garment) utilise une imprimante spécialisée pour appliquer l\'encre directement sur le textile, comme une imprimante classique sur du papier, mais adaptée aux tissus.',
    advantages: [
      'Reproduction fidèle des photos et illustrations',
      'Pas de limite de couleurs',
      'Toucher doux et respirant',
      'Idéal pour les pièces uniques ou petites séries'
    ],
    useCases: [
      'Reproductions d\'œuvres d\'art sur textile',
      'T-shirts avec photos ou designs photoréalistes',
      'Prototypes et échantillons',
      'Vêtements personnalisés à l\'unité'
    ]
  },
  {
    id: 'broderie',
    title: 'La broderie',
    image: '/images/broderie.png',
    description: 'Élégance et durabilité pour vos textiles.',
    details: 'La broderie consiste à créer un motif en cousant des fils colorés directement dans le tissu. Cette technique traditionnelle apporte une finition premium et professionnelle à vos textiles.',
    advantages: [
      'Aspect luxueux et professionnel',
      'Extrêmement durable dans le temps',
      'Résistante aux lavages intensifs',
      'Relief et texture uniques'
    ],
    useCases: [
      'Logos d\'entreprise sur polos et chemises',
      'Vêtements de travail et uniformes',
      'Articles promotionnels haut de gamme',
      'Casquettes et accessoires textiles'
    ]
  },
  {
    id: 'flocage',
    title: 'Le flocage',
    image: '/images/flocage.jpg',
    description: 'Texture veloutée et en relief pour des designs distinctifs.',
    details: 'Le flocage est une technique qui consiste à appliquer de fines particules de fibres synthétiques sur un adhésif préalablement imprimé sur le textile, créant ainsi un effet velouté au toucher.',
    advantages: [
      'Texture unique et toucher agréable',
      'Effet premium et distinctif',
      'Bonne durabilité',
      'Excellent rendu sur les designs simples'
    ],
    useCases: [
      'Vêtements de sport avec numéros et noms',
      'T-shirts avec logos et slogans',
      'Textiles promotionnels',
      'Designs minimalistes nécessitant un impact visuel fort'
    ]
  }
];

export default function TechniquesMarquage() {
  const [selectedTechnique, setSelectedTechnique] = useState<typeof techniquesData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (technique: typeof techniquesData[0]) => {
    setSelectedTechnique(technique);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="py-16 md:py-24 text-black relative overflow-hidden">
      {/* Éléments graphiques abstraits évoquant le sourire */}
      <div className="absolute left-0 top-0 w-64 h-64 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
      <div className="absolute right-0 bottom-0 w-72 h-72 rounded-full bg-indigo-300 opacity-10 blur-3xl"></div>
      <div className="absolute left-1/4 right-1/4 bottom-1/3 h-32 border-b-8 border-[#FCEB14] opacity-5 rounded-b-full"></div>
      
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="relative inline-block">
              Nos techniques de
              <span className="relative inline-block text-indigo-600 ml-2">
                marquage
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
              </span>
            </span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Découvrez nos différentes techniques pour personnaliser vos textiles. Cliquez pour plus de détails.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Ligne courbe évoquant un sourire */}
          <div className="absolute -top-8 left-1/4 right-1/4 h-16 border-t-4 border-[#FCEB14] opacity-10 rounded-t-full"></div>
          
          {techniquesData.map((technique) => (
            <div 
              key={technique.id} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 hover:shadow-indigo-200/50 group"
              onClick={() => openModal(technique)}
            >
              <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                <Image
                  src={technique.image}
                  alt={technique.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/0 to-transparent group-hover:from-indigo-900/30 transition-all duration-300"></div>
              </div>
              <h3 className="text-xl font-bold text-indigo-700 mb-2 transition-colors duration-300 group-hover:text-indigo-600">{technique.title}</h3>
              <p className="text-gray-700">{technique.description}</p>
              <div className="mt-4 h-1 w-12 bg-[#FCEB14] rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
              <p className="text-indigo-600 mt-3 font-medium">En savoir plus →</p>
            </div>
          ))}
        </div>
      </div>

      {selectedTechnique && (
        <TechniqueModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          technique={selectedTechnique} 
        />
      )}
    </section>
  );
}
