'use client';

export default function Testimonials() {
  return (
    <section className="py-8 md:py-24 relative overflow-hidden">
      {/* Éléments graphiques abstraits */}
      <div className="absolute right-1/4 top-1/3 w-56 h-56 rounded-full bg-indigo-200 opacity-5 blur-3xl"></div>
      <div className="absolute left-1/3 bottom-1/4 w-64 h-64 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
      
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="relative inline-block">
              Ce que disent
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
            </span>
            <span className="ml-2">nos clients</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Découvrez les témoignages de nos clients satisfaits.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
            {/* Forme abstraite de sourire */}
            <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full border-8 border-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className="text-amber-400 ml-1 first:ml-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              ))}
            </div>
            <p className="text-gray-700 mb-4 relative">
              <span className="absolute -left-4 top-0 text-4xl text-indigo-200 opacity-50">"</span>
              <span className="relative">J'adore mes nouveaux t-shirts personnalisés de Smiletex ! La qualité est exceptionnelle et le service client est impeccable.</span>
            </p>
            <div className="font-bold text-gray-900 flex items-center">
              <span className="inline-block w-8 h-0.5 bg-indigo-400 mr-2"></span>
              Sophie Martin
            </div>
            
            {/* Indicateur de sourire subtil */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
            {/* Forme abstraite de sourire */}
            <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full border-8 border-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className="text-amber-400 ml-1 first:ml-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              ))}
            </div>
            <p className="text-gray-700 mb-4 relative">
              <span className="absolute -left-4 top-0 text-4xl text-indigo-200 opacity-50">"</span>
              <span className="relative">La personnalisation est incroyable ! J'ai pu créer exactement ce que je voulais et la livraison a été plus rapide que prévu.</span>
            </p>
            <div className="font-bold text-gray-900 flex items-center">
              <span className="inline-block w-8 h-0.5 bg-indigo-400 mr-2"></span>
              Thomas Dubois
            </div>
            
            {/* Indicateur de sourire subtil */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-200/50 group">
            {/* Forme abstraite de sourire */}
            <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full border-8 border-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className="text-amber-400 ml-1 first:ml-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              ))}
            </div>
            <p className="text-gray-700 mb-4 relative">
              <span className="absolute -left-4 top-0 text-4xl text-indigo-200 opacity-50">"</span>
              <span className="relative">Smiletex offre un excellent rapport qualité-prix. Les vêtements sont confortables et les designs sont superbes !</span>
            </p>
            <div className="font-bold text-gray-900 flex items-center">
              <span className="inline-block w-8 h-0.5 bg-indigo-400 mr-2"></span>
              Julie Lefèvre
            </div>
            
            {/* Indicateur de sourire subtil */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
