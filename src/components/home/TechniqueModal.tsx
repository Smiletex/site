'use client';

import React from 'react';
import Image from 'next/image';

type TechniqueModalProps = {
  isOpen: boolean;
  onClose: () => void;
  technique: {
    title: string;
    image: string;
    description: string;
    details: string;
    advantages: string[];
    useCases: string[];
  };
};

export default function TechniqueModal({ isOpen, onClose, technique }: TechniqueModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative">
          {/* Éléments graphiques abstraits évoquant le sourire */}
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-[#FCEB14] opacity-5 blur-xl"></div>
          <div className="absolute left-0 bottom-0 w-24 h-24 rounded-full bg-indigo-300 opacity-10 blur-xl"></div>
          <div className="absolute left-1/4 right-1/4 bottom-10 h-16 border-b-4 border-[#FCEB14] opacity-5 rounded-b-full"></div>
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-2xl leading-6 font-bold mb-4 relative inline-block" id="modal-title">
                  <span className="text-indigo-700">{technique.title}</span>
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
                </h3>
                
                <div className="relative h-56 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={technique.image}
                    alt={technique.title}
                    fill
                    className="object-cover rounded-lg transition-transform duration-500 hover:scale-105"
                  />
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700 mb-4">
                    {technique.description}
                  </p>
                  
                  <p className="text-gray-700 mb-4">
                    {technique.details}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg mb-2 text-indigo-600">Avantages :</h4>
                    <ul className="space-y-1">
                      {technique.advantages.map((advantage, index) => (
                        <li key={index} className="text-gray-700 pl-5 relative">
                          <div className="absolute left-0 top-2 w-3 h-3 bg-[#FCEB14] opacity-70 rounded-full"></div>
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-indigo-600">Applications idéales :</h4>
                    <ul className="space-y-1">
                      {technique.useCases.map((useCase, index) => (
                        <li key={index} className="text-gray-700 pl-5 relative">
                          <div className="absolute left-0 top-2 w-3 h-3 bg-[#FCEB14] opacity-70 rounded-full"></div>
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse relative">
            <button 
              type="button" 
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium text-base hover:shadow-lg transition-all duration-300 sm:ml-3 sm:w-auto sm:text-sm group relative overflow-hidden"
              onClick={onClose}
            >
              <span className="relative z-10">Fermer</span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
