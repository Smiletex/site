'use client';

import Image from "next/image";
import Link from "next/link";

export default function Inspiration() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Éléments graphiques abstraits */}
      {/* Formes abstraites évoquant le sourire */}
      <div className="absolute left-0 top-1/3 w-64 h-64 rounded-full bg-indigo-200 opacity-5 blur-3xl"></div>
      <div className="absolute right-0 bottom-1/4 w-72 h-72 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
      <div className="absolute left-1/4 right-1/4 top-1/3 h-32 border-b-8 border-indigo-200 opacity-5 rounded-b-full"></div>
      
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="relative inline-block">
              Inspirez
            </span>
            <span className="relative inline-block text-indigo-600">
              -vous
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
            </span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Découvrez nos créations et laissez-vous inspirer pour votre prochain projet personnalisé.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 min-w-max md:min-w-0 relative">
            {/* Ligne courbe évoquant un sourire */}
            <div className="absolute -top-8 left-1/4 right-1/4 h-16 border-t-4 border-[#FCEB14] opacity-10 rounded-t-full"></div>
            <div className="w-72 md:w-auto relative aspect-square overflow-hidden rounded-xl shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/50">
              <Image
                src="/images/inspiration.jpg"
                alt="Inspiration 1"
                fill
                sizes="(max-width: 640px) 288px, (max-width: 1024px) 50vw, 25vw"
                quality={75}
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white font-medium">
                  T-shirts personnalisés
                </span>
              </div>
              {/* Forme abstraite de sourire */}
              <div className="absolute -left-4 -top-4 w-16 h-16 rounded-br-full border-4 border-indigo-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div className="w-72 md:w-auto relative aspect-square overflow-hidden rounded-xl shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/50">
              <Image
                src="/images/inspiration (1).jpg"
                alt="Inspiration 2"
                fill
                sizes="(max-width: 640px) 288px, (max-width: 1024px) 50vw, 25vw"
                quality={75}
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white font-medium">
                  Sweatshirts élégants
                </span>
              </div>
              {/* Forme abstraite de sourire */}
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-bl-full border-4 border-indigo-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div className="w-72 md:w-auto relative aspect-square overflow-hidden rounded-xl shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/50">
              <Image
                src="/images/inspiration (2).jpg"
                alt="Inspiration 3"
                fill
                sizes="(max-width: 640px) 288px, (max-width: 1024px) 50vw, 25vw"
                quality={75}
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white font-medium">
                  Accessoires tendance
                </span>
              </div>
              {/* Forme abstraite de sourire */}
              <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-tr-full border-4 border-indigo-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div className="w-72 md:w-auto relative aspect-square overflow-hidden rounded-xl shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/50">
              <Image
                src="/images/inspiration (3).jpg"
                alt="Inspiration 4"
                fill
                sizes="(max-width: 640px) 288px, (max-width: 1024px) 50vw, 25vw"
                quality={75}
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white font-medium">
                  Collections entreprise
                </span>
              </div>
              {/* Forme abstraite de sourire */}
              <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-tl-full border-4 border-indigo-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12 relative">
          {/* Formes abstraites évoquant le sourire */}
          <div className="absolute left-1/3 -top-8 w-1/3 h-16 border-t-4 border-indigo-200 opacity-10 rounded-t-full"></div>
          
          <Link 
            href="/inspiration" 
            className="inline-block bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-8 rounded-xl text-lg shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">
              Plus d'inspiration
            </span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
