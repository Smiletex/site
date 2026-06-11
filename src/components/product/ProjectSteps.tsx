'use client';

import React from 'react';

const ProjectSteps = () => {
  return (
    <div className="relative">
      {/* Ligne courbe évoquant un sourire */}
      <div className="absolute -top-8 left-1/4 right-1/4 h-12 sm:h-16 border-t-2 sm:border-t-4 border-[#FCEB14] opacity-10 rounded-t-full"></div>
      
      {/* Parcours des étapes - version desktop */}
      <div className="hidden md:flex flex-nowrap justify-between items-start relative">
        {/* Ligne de connexion */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-indigo-100 z-0"></div>
        
        {/* Étape 1 */}
        <div className="flex flex-col items-center z-10 w-1/5 px-2">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4 relative group transition-all duration-300 hover:bg-indigo-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </div>
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-[#FCEB14] rounded-full flex items-center justify-center text-indigo-800 font-bold shadow-sm z-20 border-2 border-white">
              1
            </div>
          </div>
          <h3 className="text-md font-bold text-indigo-700 text-center mb-1">Personnalisation en ligne</h3>
          <p className="text-xs text-gray-600 text-center">Sélectionnez et personnalisez vos produits</p>
          
          {/* Flèche vers la droite */}
          <div className="absolute right-0 top-12 transform translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
            <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
        
        {/* Étape 2 */}
        <div className="flex flex-col items-center z-10 w-1/5 px-2">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4 relative group transition-all duration-300 hover:bg-indigo-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-[#FCEB14] rounded-full flex items-center justify-center text-indigo-800 font-bold shadow-sm z-20 border-2 border-white">
              2
            </div>
          </div>
          <h3 className="text-md font-bold text-indigo-700 text-center mb-1">Paiement en ligne</h3>
          <p className="text-xs text-gray-600 text-center">Réglez votre commande de manière sécurisée</p>
          
          {/* Flèche vers la droite */}
          <div className="absolute right-0 top-12 transform translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
            <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
        
        {/* Étape 3 */}
        <div className="flex flex-col items-center z-10 w-1/5 px-2">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4 relative group transition-all duration-300 hover:bg-indigo-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-[#FCEB14] rounded-full flex items-center justify-center text-indigo-800 font-bold shadow-sm z-20 border-2 border-white">
              3
            </div>
          </div>
          <h3 className="text-md font-bold text-indigo-700 text-center mb-1">Validation du BAT</h3>
          <p className="text-xs text-gray-600 text-center">Notre équipe de PAO vous enverra un bon à tirer</p>
          
          {/* Flèche vers la droite */}
          <div className="absolute right-0 top-12 transform translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
            <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
        
        {/* Étape 4 */}
        <div className="flex flex-col items-center z-10 w-1/5 px-2">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4 relative group transition-all duration-300 hover:bg-indigo-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-[#FCEB14] rounded-full flex items-center justify-center text-indigo-800 font-bold shadow-sm z-20 border-2 border-white">
              4
            </div>
          </div>
          <h3 className="text-md font-bold text-indigo-700 text-center mb-1">Production</h3>
          <p className="text-xs text-gray-600 text-center">1 à 3 semaines ouvrables selon vos besoins</p>
          
          {/* Flèche vers la droite */}
          <div className="absolute right-0 top-12 transform translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
            <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
        
        {/* Étape 5 */}
        <div className="flex flex-col items-center z-10 w-1/5 px-2">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4 relative group transition-all duration-300 hover:bg-indigo-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-[#FCEB14] rounded-full flex items-center justify-center text-indigo-800 font-bold shadow-sm z-20 border-2 border-white">
              5
            </div>
          </div>
          <h3 className="text-md font-bold text-indigo-700 text-center mb-1">Livraison</h3>
          <p className="text-xs text-gray-600 text-center">Retrait sur place ou livraison à votre adresse</p>
        </div>
      </div>
      
      {/* Version mobile avec défilement horizontal - améliorée */}
      <div className="md:hidden mt-6">
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex flex-nowrap items-start relative snap-x snap-mandatory" style={{ minWidth: "min-content" }}>
            {/* Ligne de connexion */}
            <div className="absolute top-12 left-0 right-0 h-1 bg-indigo-100 z-0"></div>
            
            {/* Étape 1 */}
            <div className="flex flex-col items-center z-10 w-[140px] sm:w-[160px] px-1 sm:px-2 snap-start">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-2 sm:mb-3 relative group transition-all duration-300 hover:bg-indigo-100 snap-center">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                  <svg className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 bg-[#FCEB14] rounded-full flex items-center justify-center text-indigo-800 font-bold shadow-sm z-20 border-2 border-white text-[10px] sm:text-xs">
                  1
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-indigo-700 text-center mb-1">Personnalisation</h3>
              <p className="text-[10px] sm:text-xs text-gray-600 text-center">Sélectionnez vos produits</p>
              
              {/* Flèche vers la droite */}
              <div className="absolute right-0 top-10 transform translate-x-1/2 -translate-y-1/2 z-10">
                <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            {/* Étape 2 */}
            <div className="flex flex-col items-center z-10 w-[140px] sm:w-[160px] px-1 sm:px-2 snap-start">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-2 sm:mb-3 relative group transition-all duration-300 hover:bg-indigo-100 snap-center">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                  <svg className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 bg-[#FCEB14] rounded-full flex items-center justify-center text-indigo-800 font-bold shadow-sm z-20 border-2 border-white text-[10px] sm:text-xs">
                  2
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-indigo-700 text-center mb-1">Paiement en ligne</h3>
              <p className="text-[10px] sm:text-xs text-gray-600 text-center">Paiement sécurisé</p>
              
              {/* Flèche vers la droite */}
              <div className="absolute right-0 top-10 transform translate-x-1/2 -translate-y-1/2 z-10">
                <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            {/* Étape 3 */}
            <div className="flex flex-col items-center z-10 w-[140px] sm:w-[160px] px-1 sm:px-2 snap-start">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-2 sm:mb-3 relative group transition-all duration-300 hover:bg-indigo-100 snap-center">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                  <svg className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                </div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 bg-[#FCEB14] rounded-full flex items-center justify-center text-indigo-800 font-bold shadow-sm z-20 border-2 border-white text-[10px] sm:text-xs">
                  3
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-indigo-700 text-center mb-1">Paiement</h3>
              <p className="text-[10px] sm:text-xs text-gray-600 text-center">Paiement sécurisé</p>
              
              {/* Flèche vers la droite */}
              <div className="absolute right-0 top-10 transform translate-x-1/2 -translate-y-1/2 z-10">
                <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            {/* Étape 4 */}
            <div className="flex flex-col items-center z-10 w-[140px] sm:w-[160px] px-1 sm:px-2 snap-start">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-2 sm:mb-3 relative group transition-all duration-300 hover:bg-indigo-100 snap-center">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                  <svg className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                </div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 bg-[#FCEB14] rounded-full flex items-center justify-center text-indigo-800 font-bold shadow-sm z-20 border-2 border-white text-[10px] sm:text-xs">
                  4
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-indigo-700 text-center mb-1">Production</h3>
              <p className="text-[10px] sm:text-xs text-gray-600 text-center">Fabrication rapide</p>
              
              {/* Flèche vers la droite */}
              <div className="absolute right-0 top-10 transform translate-x-1/2 -translate-y-1/2 z-10">
                <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            {/* Étape 5 */}
            <div className="flex flex-col items-center z-10 w-[140px] sm:w-[160px] px-1 sm:px-2 snap-start">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-2 sm:mb-3 relative group transition-all duration-300 hover:bg-indigo-100 snap-center">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                  <svg className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                  </svg>
                </div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 bg-[#FCEB14] rounded-full flex items-center justify-center text-indigo-800 font-bold shadow-sm z-20 border-2 border-white text-[10px] sm:text-xs">
                  5
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-indigo-700 text-center mb-1">Livraison</h3>
              <p className="text-[10px] sm:text-xs text-gray-600 text-center">Retrait ou livraison</p>
            </div>
          </div>
        </div>
        
        {/* Indicateurs de défilement */}
        <div className="mt-3 flex justify-center">
          <div className="text-[10px] sm:text-xs text-indigo-600 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Faites glisser pour voir toutes les étapes</span>
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSteps;
