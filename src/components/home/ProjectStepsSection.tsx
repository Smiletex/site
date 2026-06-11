'use client';

import ProjectSteps from "@/components/product/ProjectSteps";

export default function ProjectStepsSection() {
  return (
    <section className="py-16 md:py-24 bg-white text-gray-800 relative overflow-hidden">
      {/* Éléments graphiques abstraits */}
      <div className="absolute left-0 top-1/3 w-64 h-64 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
      <div className="absolute right-0 bottom-1/4 w-72 h-72 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <div className="inline-block mb-3 bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full text-sm font-semibold tracking-wide shadow-sm">
            NOTRE PROCESSUS
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            <span className="relative inline-block">
              Les 5 étapes de
              <span className="ml-2 relative inline-block text-indigo-600">
                votre projet
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
              </span>
            </span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            De la commande à la livraison, nous vous accompagnons à chaque étape de votre projet de personnalisation textile.
          </p>
        </div>
        
        <ProjectSteps />
      </div>
    </section>
  );
}
