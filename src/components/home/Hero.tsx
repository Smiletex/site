'use client';

import Image from "next/image";
import Link from "next/link";

// Composant pour les courbes souriantes
const SmileCurve = ({ className, color = "text-white", rotate = false }: { className: string; color?: string; rotate?: boolean }) => (
  <svg 
    viewBox="0 0 1200 120" 
    preserveAspectRatio="none" 
    className={`${className} ${color} ${rotate ? 'transform rotate-180' : ''}`}
  >
    <path 
      d="M0,120 L1200,120 L1200,60 C1000,100 800,120 600,80 C400,40 200,60 0,80 L0,120 Z" 
      fill="currentColor" 
    />
  </svg>
);

export default function Hero() {
  return (
    <section className="relative bg-indigo-800 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <Image 
          src="/images/hero-bg.png" 
          alt="Fond Smiletex" 
          fill 
          className="object-cover"
          priority
          quality={75}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-600 opacity-50"></div>
        {/* Éléments graphiques abstraits */}
        <div className="absolute right-0 top-1/4 w-64 h-64 rounded-full bg-indigo-300 opacity-10 blur-3xl"></div>
        <div className="absolute left-1/4 bottom-1/3 w-48 h-48 rounded-full bg-indigo-300 opacity-20 blur-3xl"></div>
      </div>
      <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenue chez <span className="relative inline-block">
              <span className="text-white text-5xl md:text-7xl tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] font-semibold">Smiletex</span>
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-indigo-100">
            Découvrez notre collection de vêtements personnalisables et créez votre style unique.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/products" className="group relative overflow-hidden bg-white text-indigo-800 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-indigo-900/20 transition-all duration-300">
              Personnaliser en ligne
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
            </Link>
            <Link href="/devis" className="group relative overflow-hidden bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:border-[#FCEB14] hover:text-[#FCEB14] transition-all duration-300">
              Devis rapide 24h
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
            </Link>
          </div>
        </div>
      </div>
      {/* Courbe souriante en bas du hero */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <SmileCurve className="w-full h-16" color="text-indigo-50" />
      </div>
    </section>
  );
}