'use client';

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

export default function WhyChooseUs() {
  return (
    <section className="py-16 md:py-24 bg-indigo-50 relative overflow-hidden">
      {/* Éléments graphiques abstraits évoquant le sourire */}
      <div className="absolute left-0 top-0 w-64 h-64 rounded-full bg-indigo-200 opacity-5 blur-3xl"></div>
      <div className="absolute right-0 bottom-0 w-72 h-72 rounded-full bg-indigo-300 opacity-10 blur-3xl"></div>
      <div className="absolute left-1/4 right-1/4 bottom-1/3 h-32 border-b-8 border-indigo-200 opacity-5 rounded-b-full"></div>
      <div className="absolute right-1/4 top-1/4 w-32 h-32 border-4 border-indigo-200 opacity-5 rounded-full"></div>
      
      {/* Courbe souriante en haut de la section */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden">
        <SmileCurve className="w-full h-16" color="text-white" rotate={true} />
      </div>
      
      <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="relative inline-block">
              Pourquoi choisir
            </span>
            <span className="relative inline-block text-indigo-600 ml-2">
              Smiletex
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
            </span>
            <span className="ml-1">?</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Nous nous engageons à vous offrir une expérience d'achat exceptionnelle avec des produits de qualité.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Ligne courbe évoquant un sourire */}
          <div className="absolute -top-8 left-1/4 right-1/4 h-16 border-t-4 border-[#FCEB14] opacity-10 rounded-t-full"></div>
          <div className="bg-white p-8 rounded-xl shadow-md text-center transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
            <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-indigo-200 relative overflow-hidden">
              <div className="absolute w-full h-3 bg-[#FCEB14]/20 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-indigo-600 mb-4 transition-colors duration-300 group-hover:text-indigo-700">Qualité supérieure</h3>
            <p className="text-gray-700">
              Tous nos produits sont fabriqués avec des matériaux de haute qualité pour garantir confort et durabilité.
            </p>
            <div className="mt-4 h-1 w-12 bg-indigo-400 mx-auto rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md text-center transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
            <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-indigo-200 relative overflow-hidden">
              <div className="absolute w-full h-3 bg-[#FCEB14]/20 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-indigo-600 mb-4 transition-colors duration-300 group-hover:text-indigo-700">Personnalisation unique</h3>
            <p className="text-gray-700">
              Créez des vêtements qui vous ressemblent avec nos options de personnalisation avancées.
            </p>
            <div className="mt-4 h-1 w-12 bg-indigo-400 mx-auto rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md text-center transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
            <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-indigo-200 relative overflow-hidden">
              <div className="absolute w-full h-3 bg-[#FCEB14]/20 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-indigo-600 mb-4 transition-colors duration-300 group-hover:text-indigo-700">Service client dédié</h3>
            <p className="text-gray-700">
              Notre équipe est à votre écoute pour vous accompagner dans tous vos projets de personnalisation.
            </p>
            <div className="mt-4 h-1 w-12 bg-indigo-400 mx-auto rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
