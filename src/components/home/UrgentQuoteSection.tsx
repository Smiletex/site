'use client';

import { useState } from 'react';

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

// Composant pour le formulaire de devis urgent
function UrgentQuoteForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    projectType: '',
    message: '',
    urgentDelivery: false // Option de livraison express décochée par défaut
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Logique d'envoi du formulaire (simulée pour l'exemple)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Réinitialiser le formulaire après envoi réussi
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        projectType: '',
        message: '',
        urgentDelivery: true
      });
      
      setSubmitStatus('success');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du formulaire:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête du formulaire */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-indigo-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Formulaire de devis express
        </h3>
        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
          Réponse sous 24h garantie
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="relative group">
          <label 
            htmlFor="firstName" 
            className={`block text-sm font-medium transition-all duration-200 ${focusedField === 'firstName' || formData.firstName ? 'text-indigo-600' : 'text-gray-700'}`}
          >
            Prénom<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              placeholder="Votre prénom"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              onFocus={() => setFocusedField('firstName')}
              onBlur={() => setFocusedField(null)}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border transition-all duration-300 bg-gray-50 focus:bg-white"
            />
            <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full w-full"></div>
          </div>
        </div>

        <div className="relative group">
          <label 
            htmlFor="lastName" 
            className={`block text-sm font-medium transition-all duration-200 ${focusedField === 'lastName' || formData.lastName ? 'text-indigo-600' : 'text-gray-700'}`}
          >
            Nom<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              placeholder="Votre nom"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              onFocus={() => setFocusedField('lastName')}
              onBlur={() => setFocusedField(null)}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border transition-all duration-300 bg-gray-50 focus:bg-white"
            />
            <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full w-full"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="relative group">
          <label 
            htmlFor="email" 
            className={`block text-sm font-medium transition-all duration-200 ${focusedField === 'email' || formData.email ? 'text-indigo-600' : 'text-gray-700'}`}
          >
            Email<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Votre adresse email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 pl-10 border transition-all duration-300 bg-gray-50 focus:bg-white"
            />
            <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full w-full"></div>
          </div>
        </div>

        <div className="relative group">
          <label 
            htmlFor="phone" 
            className={`block text-sm font-medium transition-all duration-200 ${focusedField === 'phone' || formData.phone ? 'text-indigo-600' : 'text-gray-700'}`}
          >
            Téléphone<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              placeholder="Votre numéro de téléphone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 pl-10 border transition-all duration-300 bg-gray-50 focus:bg-white"
            />
            <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full w-full"></div>
          </div>
        </div>
      </div>

      {/* Le champ Type de projet a été supprimé */}

      <div className="relative group">
        <label 
          htmlFor="message" 
          className={`block text-sm font-medium transition-all duration-200 ${focusedField === 'message' || formData.message ? 'text-indigo-600' : 'text-gray-700'}`}
        >
          Votre message<span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            placeholder="Décrivez votre projet en détail (ex: 5 t-shirts et 2 pulls avec logo d'entreprise, délai souhaité...)"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            onFocus={() => setFocusedField('message')}
            onBlur={() => setFocusedField(null)}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border transition-all duration-300 bg-gray-50 focus:bg-white"
          />
          <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full w-full"></div>
        </div>
      </div>
      
      {/* Option de livraison express */}
      <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
        <input
          type="checkbox"
          id="urgentDelivery"
          name="urgentDelivery"
          checked={formData.urgentDelivery}
          onChange={(e) => setFormData(prev => ({ ...prev, urgentDelivery: e.target.checked }))}
          className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-400"
        />
        <div className="flex-1">
          <label htmlFor="urgentDelivery" className="text-sm font-medium text-gray-700 flex items-center cursor-pointer">
            <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full mr-2 shadow-sm">
              Express
            </span>
            Livraison express (1 semaine)
          </label>
          <p className="text-xs text-gray-500 mt-0.5">Priorité maximale pour votre projet avec un délai de production d'une semaine.</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 relative overflow-hidden group transform hover:scale-[1.01] active:scale-[0.98]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#FCEB14]/20 to-transparent w-1/2 blur-xl transform transition-transform duration-500 ease-out translate-x-[-200%] group-hover:translate-x-[200%]"></div>
        <span className="relative z-10 flex items-center justify-center">
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Demander un devis express
            </>
          )}
        </span>
        <span className="absolute bottom-0 left-0 w-full h-1 bg-yellow-500 transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
      </button>

      {submitStatus === 'success' && (
        <div className="mt-6 p-5 bg-green-50 rounded-xl border border-green-100 shadow-sm relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-green-100/50"></div>
          <div className="absolute -left-3 -top-3 w-12 h-12 rounded-full bg-green-500/10 animate-pulse"></div>
          <h4 className="text-green-800 font-semibold mb-1 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Demande envoyée avec succès !
          </h4>
          <p className="text-green-700 pl-8">Nous vous contacterons sous 24h pour discuter de votre projet.</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mt-6 p-5 bg-red-50 rounded-xl border border-red-100 shadow-sm relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-red-100/50"></div>
          <div className="absolute -left-3 -top-3 w-12 h-12 rounded-full bg-red-500/10 animate-pulse"></div>
          <h4 className="text-red-800 font-semibold mb-1 flex items-center">
            <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Une erreur est survenue
          </h4>
          <p className="text-red-700 pl-8">Veuillez réessayer ou nous contacter directement par téléphone au <span className="font-medium">01 23 45 67 89</span>.</p>
        </div>
      )}
    </form>
  );
}

export default function UrgentQuoteSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-indigo-50 to-white text-gray-800 relative overflow-hidden">
      {/* Éléments graphiques abstraits améliorés */}
      <div className="absolute left-0 top-1/4 w-72 h-72 rounded-full bg-indigo-200 opacity-5 blur-3xl animate-pulse-slow"></div>
      <div className="absolute right-0 bottom-1/4 w-64 h-64 rounded-full bg-indigo-200 opacity-10 blur-3xl animate-pulse-slow"></div>
      <div className="absolute left-1/3 bottom-1/2 w-48 h-48 rounded-full bg-indigo-300 opacity-5 blur-3xl animate-pulse-slow"></div>
      
      {/* Courbe souriante en haut de la section */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden">
        <SmileCurve className="w-full h-16" color="text-white" rotate={true} />
      </div>
      
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <div className="inline-block mb-3 bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full text-sm font-semibold tracking-wide shadow-sm">
            DEVIS EXPRESS
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            <span className="relative inline-block">
              Besoin de nous contacter
              <span className="relative inline-block text-indigo-700 ml-2">
                rapidement
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
              </span> ?
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Remplissez ce formulaire et recevez votre devis personnalisé sous 24h !
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 text-black relative backdrop-blur-sm bg-white/90">
          {/* Éléments décoratifs */}
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full border-4 border-indigo-200 opacity-20"></div>
          <div className="absolute -left-3 -bottom-3 w-24 h-24 rounded-full border-4 border-indigo-200 opacity-20"></div>
          <div className="absolute right-1/4 -bottom-6 w-12 h-12 rounded-full bg-indigo-200 opacity-10"></div>
          
          {/* Badge de priorité */}
          <div className="absolute -top-5 left-10 bg-gradient-to-r from-[#FCEB14] to-yellow-500 text-indigo-900 text-xs font-bold px-4 py-1 rounded-full shadow-md transform -rotate-2">
            Prioritaire
          </div>
          
          <UrgentQuoteForm />
        </div>
      </div>
    </section>
  );
}
