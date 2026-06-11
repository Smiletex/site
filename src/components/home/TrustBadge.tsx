'use client';

import React from 'react';
import Image from 'next/image';

export default function TrustBadge() {
  return (
    <div className="relative py-6 px-4 sm:px-8 bg-indigo-50 border-b border-gray-200 text-black overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-100 rounded-full opacity-30"></div>
      <div className="absolute -top-8 right-20 w-24 h-24 bg-indigo-100 rounded-full opacity-30"></div>
      <div className="absolute bottom-0 left-1/4 right-1/4 h-12 border-b-2 border-indigo-200 opacity-20 rounded-b-full"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 max-w-7xl mx-auto">
        {/* Badges de confiance */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-10 w-full md:w-auto">
          {/* Badge Imprimé en France */}
          <div className="group flex items-center space-x-3 transition-all duration-300 hover:translate-y-[-2px] w-full sm:w-auto">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-200 group-hover:shadow-md group-hover:border-indigo-400 transition-all duration-300 group-hover:after:content-[''] group-hover:after:absolute group-hover:after:bottom-0 group-hover:after:left-0 group-hover:after:w-full group-hover:after:h-0.5 group-hover:after:bg-indigo-400 group-hover:after:opacity-60 relative overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-800">Imprimé à Lyon</span>
              <span className="text-xs text-gray-500">Production locale et responsable</span>
            </div>
          </div>
          
          {/* Badge Qualité garantie */}
          <div className="group flex items-center space-x-3 transition-all duration-300 hover:translate-y-[-2px] w-full sm:w-auto">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-200 group-hover:shadow-md group-hover:border-indigo-400 transition-all duration-300 group-hover:after:content-[''] group-hover:after:absolute group-hover:after:bottom-0 group-hover:after:left-0 group-hover:after:w-full group-hover:after:h-0.5 group-hover:after:bg-indigo-400 group-hover:after:opacity-60 relative overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-800">Qualité garantie</span>
              <span className="text-xs text-gray-500">Matériaux premium sélectionnés</span>
            </div>
          </div>
          
          {/* Badge Prix dégressifs */}
          <div className="group flex items-center space-x-3 transition-all duration-300 hover:translate-y-[-2px] w-full sm:w-auto">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-200 group-hover:shadow-md group-hover:border-indigo-400 transition-all duration-300 group-hover:after:content-[''] group-hover:after:absolute group-hover:after:bottom-0 group-hover:after:left-0 group-hover:after:w-full group-hover:after:h-0.5 group-hover:after:bg-indigo-400 group-hover:after:opacity-60 relative overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8l-8 8" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <circle cx="9" cy="9" r="1" />
                <circle cx="15" cy="15" r="1" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-800">Prix dégressifs</span>
              <span className="text-xs text-gray-500">Économisez sur les grandes quantités</span>
            </div>
          </div>
        </div>
        
        {/* Trustpilot */}
        <div className="relative group self-center md:self-auto mt-4 md:mt-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-400 opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
          <div className="relative bg-white p-3 rounded-lg shadow-sm group-hover:shadow-md transition duration-300">
            <Image 
              src="/images/trustpilot.png" 
              alt="Trustpilot" 
              width={180} 
              height={45}
              className="h-auto w-auto max-w-[140px] sm:max-w-[180px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
