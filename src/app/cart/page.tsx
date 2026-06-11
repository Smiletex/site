'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/modals/AuthModal';
import AddressModal from '@/components/modals/AddressModal';
import { fetchCustomerProfile } from '@/lib/supabase/services/userService';

// Fonction utilitaire pour vérifier si une couleur est un code hexadécimal
const isHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Fonction utilitaire pour vérifier si une couleur est une URL d'image
const isImageUrl = (color: string): boolean => {
  return color?.startsWith('http') || color?.startsWith('/') || false;
};

export default function CartPage() {
  const { cart, isLoading, total, removeFromCart, updateQuantity, clearCart, createCheckoutSession } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  // Calculer les frais de livraison en fonction du type choisi par l'utilisateur
  const calculateShippingCost = () => {
    if (cart.length === 0) return 0;
    
    // Vérifier si au moins un article a un type de livraison spécifique
    const hasUrgentShipping = cart.some(item => item.shippingType === 'urgent');
    const hasFastShipping = cart.some(item => item.shippingType === 'fast');
    
    // Priorité à la livraison la plus rapide
    if (hasUrgentShipping) return 14.99;
    if (hasFastShipping) return 9.99;
    return 4.99; // Livraison classique par défaut
  };
  
  const shippingCost = calculateShippingCost();
  const subtotal = total;
  const totalWithShipping = subtotal + shippingCost;

  // Vérifier si l'utilisateur a une adresse renseignée
  useEffect(() => {
    const checkUserAddress = async () => {
      if (user) {
        try {
          const profile = await fetchCustomerProfile(user.id);
          // Vérifier si les champs d'adresse obligatoires sont remplis
          if (profile && profile.address_line1 && profile.city && profile.postal_code) {
            setHasAddress(true);
          } else {
            setHasAddress(false);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'adresse:', error);
          setHasAddress(false);
        }
      }
    };
    
    checkUserAddress();
  }, [user]);

  // Fonction pour procéder au paiement
  const handleCheckout = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      // Ouvrir le modal d'authentification si l'utilisateur n'est pas connecté
      setIsAuthModalOpen(true);
      return;
    }
    
    // Vérifier si l'utilisateur a une adresse renseignée
    if (!hasAddress) {
      // Ouvrir le modal d'adresse si l'utilisateur n'a pas d'adresse
      setIsAddressModalOpen(true);
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Créer une session de paiement Stripe
      const response = await createCheckoutSession();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Rediriger vers la page de paiement Stripe
      if (response.url) {
        if (typeof window !== "undefined") window.location.href = response.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error) {
      console.error('Erreur lors du checkout:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la session de paiement.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction appelée après une authentification réussie
  const handleAuthSuccess = async () => {
    setIsAuthModalOpen(false);
    
    // Vérifier si l'utilisateur a une adresse renseignée
    if (!hasAddress) {
      // Ouvrir le modal d'adresse si l'utilisateur n'a pas d'adresse
      setIsAddressModalOpen(true);
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Créer une session de paiement Stripe directement sans rappeler handleCheckout
      const response = await createCheckoutSession();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Rediriger vers la page de paiement Stripe
      if (response.url) {
        if (typeof window !== "undefined") window.location.href = response.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error) {
      console.error('Erreur lors du checkout après authentification:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la session de paiement.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Fonction appelée après l'enregistrement réussi de l'adresse
  const handleAddressSuccess = async () => {
    setIsAddressModalOpen(false);
    setHasAddress(true);
    
    try {
      setIsProcessing(true);
      
      // Créer une session de paiement Stripe
      const response = await createCheckoutSession();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Rediriger vers la page de paiement Stripe
      if (response.url) {
        if (typeof window !== "undefined") window.location.href = response.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error) {
      console.error('Erreur lors du checkout après enregistrement de l\'adresse:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la session de paiement.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement de votre panier...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Éléments graphiques abstraits */}
        <div className="absolute left-0 top-0 w-96 h-96 rounded-full bg-indigo-100 opacity-30 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-[#FCEB14] opacity-10 blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8 relative inline-block">
          Votre Panier smiletex
          <svg className="absolute -bottom-1 left-0 w-full" height="3" viewBox="0 0 100 3" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,3 L0,3 Z" fill="#FCEB14" />
          </svg>
        </h1>
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center relative overflow-hidden">
          {/* Élément graphique abstrait */}
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-[#FCEB14] opacity-5 blur-xl"></div>
          
          <p className="text-gray-600 mb-6">Votre panier est vide</p>
          <Link href="/products" className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group inline-block">
            Découvrir nos produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Éléments graphiques abstraits */}
      <div className="absolute left-0 top-0 w-96 h-96 rounded-full bg-indigo-100 opacity-30 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-[#FCEB14] opacity-10 blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      <div className="max-w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 relative inline-block">
          Votre Panier
          <svg className="absolute -bottom-1 left-0 w-full" height="3" viewBox="0 0 100 3" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,3 L0,3 Z" fill="#FCEB14" />
          </svg>
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Liste des articles */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100 relative overflow-hidden">
                {/* Élément graphique abstrait */}
                <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-[#FCEB14] opacity-5 blur-xl"></div>
                
                <div className="flex justify-between items-center relative">
                  <h2 className="text-lg font-bold text-indigo-900 relative inline-block">
                    Articles ({cart.length})
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
                  </h2>
                  <button 
                    onClick={() => {
                      // Appeler clearCart est suffisant car cette fonction déclenche déjà l'événement cartUpdated
                      clearCart();
                    }}
                    className="text-sm text-red-600 hover:text-red-800 flex items-center transition-colors font-bold"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Vider le panier
                  </button>
                </div>
              </div>
              
              {/* Liste des produits */}
              {cart.map((item) => (
                <div key={item.id} className="border-b border-gray-200 last:border-0 p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    {/* Image du produit - Taille adaptée et centrée sur mobile */}
                    <div className="relative h-32 w-32 mx-auto sm:mx-0 sm:h-28 sm:w-28 rounded-lg overflow-hidden mb-4 sm:mb-0 sm:mr-5 flex-shrink-0 border border-gray-200 shadow-sm">
                      <Image
                        src={item.imageUrl || '/images/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      {/* Informations produit - Réorganisées pour mobile */}
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div className="text-center sm:text-left mb-2 sm:mb-0">
                          <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                          
                          {/* Informations sur la couleur et la taille */}
                          <p className="mt-1 text-sm text-gray-800">
                            {item.color && item.size && (
                              <span className="font-semibold flex items-center">
                                {isHexColor(item.color) ? (
                                  <span 
                                    className="inline-block w-5 h-5 mr-2 rounded-full border border-gray-300" 
                                    style={{ backgroundColor: item.color }}
                                    title={item.color}
                                  ></span>
                                ) : isImageUrl(item.color) ? (
                                  <span className="inline-block w-5 h-5 mr-2 rounded-full border border-gray-300 overflow-hidden">
                                    <Image 
                                      src={item.color} 
                                      alt="Couleur" 
                                      width={20} 
                                      height={20} 
                                      className="object-cover"
                                    />
                                  </span>
                                ) : (
                                  <span className="mr-2 text-xs bg-gray-100 px-2 py-1 rounded-full">{item.color}</span>
                                )}
                                {item.size}
                              </span>
                            )}
                          </p>
                          
                          {/* Informations sur la personnalisation - Version responsive */}
                          {item.customization && item.customization.customizations && item.customization.customizations.length > 0 && (
                            <div className="mt-2 bg-indigo-50 p-2 rounded-md border border-indigo-100 text-xs">
                              <p className="font-semibold text-indigo-800 mb-1">Personnalisation :</p>
                              
                              {/* Version mobile */}
                              <ul className="space-y-2 sm:hidden">
                                {item.customization.customizations.map((custom, index) => (
                                  <li key={index} className="bg-white p-2 rounded border border-indigo-100">
                                    {/* Badge de face et type plus compact */}
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="font-medium text-indigo-800 text-xs">
                                        {custom.position_avant ? 'Devant' : custom.position_arriere ? 'Derrière' : custom.face === 'devant' ? 'Devant' : 'Derrière'}
                                      </span>
                                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${custom.type === 'text' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                        {custom.type === 'text' ? 'Texte' : 'Image'}
                                      </span>
                                    </div>
                                    
                                    {/* Texte personnalisé avec style adapté pour mobile */}
                                    {custom.type === 'text' && custom.texte && (
                                      <p className="text-indigo-700 italic text-xs bg-indigo-50 p-1 rounded">« {custom.texte} »</p>
                                    )}
                                    
                                    {/* Badges plus compacts et adaptés au mobile */}
                                    <div className="mt-1.5 flex flex-wrap gap-1 text-gray-600">
                                      {custom.position_avant && (
                                        <span className="inline-flex items-center px-1 py-0.5 rounded-full bg-gray-100 text-xs">
                                          {custom.position_avant.replace('devant-', '').replace('-', ' ')}
                                        </span>
                                      )}
                                      {custom.position_arriere && (
                                        <span className="inline-flex items-center px-1 py-0.5 rounded-full bg-gray-100 text-xs">
                                          {custom.position_arriere.replace('dos-', '').replace('-', ' ')}
                                        </span>
                                      )}
                                      {!custom.position_avant && !custom.position_arriere && custom.position && (
                                        <span className="inline-flex items-center px-1 py-0.5 rounded-full bg-gray-100 text-xs">
                                          {custom.position.replace('-', ' ')}
                                        </span>
                                      )}
                                      {custom.type_impression && (
                                        <span className="inline-flex items-center px-1 py-0.5 rounded-full bg-gray-100 text-xs">
                                          {custom.type_impression}
                                        </span>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                              
                              {/* Version desktop (inchangée) */}
                              <ul className="space-y-2 hidden sm:block">
                                {item.customization.customizations.map((custom, index) => (
                                  <li key={index} className="bg-white p-1.5 rounded border border-indigo-100">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-indigo-800">
                                        {custom.position_avant ? 'Devant' : custom.position_arriere ? 'Derrière' : custom.face === 'devant' ? 'Devant' : 'Derrière'}
                                      </span>
                                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${custom.type === 'text' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                        {custom.type === 'text' ? 'Texte' : 'Image'}
                                      </span>
                                    </div>
                                    
                                    {custom.type === 'text' && custom.texte && (
                                      <p className="mt-1 text-indigo-700 italic">« {custom.texte} »</p>
                                    )}
                                    
                                    <div className="mt-1 flex flex-wrap gap-1 text-gray-600">
                                      {custom.position_avant && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100">
                                          Position avant: {custom.position_avant.replace('devant-', '').replace('-', ' ')}
                                        </span>
                                      )}
                                      {custom.position_arriere && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100">
                                          Position arrière: {custom.position_arriere.replace('dos-', '').replace('-', ' ')}
                                        </span>
                                      )}
                                      {!custom.position_avant && !custom.position_arriere && custom.position && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100">
                                          Position: {custom.position.replace('-', ' ')}
                                        </span>
                                      )}
                                      {custom.type_impression && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100">
                                          Technique: {custom.type_impression}
                                        </span>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* Badge pour le type de livraison - Responsive */}
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${item.shippingType === 'urgent' ? 'bg-yellow-100 text-yellow-800' : item.shippingType === 'fast' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                              <svg className="w-3 h-3 mr-1 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span className="hidden sm:inline">
                                {item.shippingType === 'urgent' ? 'Express (1 semaine)' : 
                                 item.shippingType === 'fast' ? 'Prioritaire (2 semaines)' : 
                                 'Classique (3 semaines)'}
                              </span>
                              <span className="sm:hidden">
                                {item.shippingType === 'urgent' ? 'Express' : 
                                 item.shippingType === 'fast' ? 'Prioritaire' : 
                                 'Classique'}
                              </span>
                            </span>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-indigo-700 text-center sm:text-right mb-4 sm:mb-0">{item.price.toFixed(2)} €</p>
                      </div>
                      
                      {/* Contrôles de quantité et bouton supprimer - Réorganisés pour mobile */}
                      <div className="mt-3 sm:mt-5 flex flex-col sm:flex-row justify-center sm:justify-between items-center space-y-4 sm:space-y-0">
                        <div className="flex items-center border-2 border-indigo-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow transition-all duration-300">
                          <button
                            onClick={() => {
                              updateQuantity(item.id, Math.max(1, item.quantity - 1));
                              // Forcer une actualisation du compteur du panier
                              const updatedCart = [...cart];
                              const itemIndex = updatedCart.findIndex(cartItem => cartItem.id === item.id);
                              if (itemIndex !== -1) {
                                updatedCart[itemIndex].quantity = Math.max(1, item.quantity - 1);
                              }
                              const event = new CustomEvent('cartUpdated', { detail: updatedCart });
                              if (typeof window !== "undefined") window.dispatchEvent(event);
                            }}
                            className="px-4 py-2 text-indigo-700 hover:bg-indigo-100 transition-colors relative overflow-hidden group"
                            aria-label="Diminuer la quantité"
                          >
                            <span className="font-bold text-lg">-</span>
                          </button>
                          <span className="px-4 py-2 text-gray-900 font-bold text-lg border-l border-r border-indigo-200">{item.quantity}</span>
                          <button
                            onClick={() => {
                              updateQuantity(item.id, item.quantity + 1);
                              // Forcer une actualisation du compteur du panier
                              const updatedCart = [...cart];
                              const itemIndex = updatedCart.findIndex(cartItem => cartItem.id === item.id);
                              if (itemIndex !== -1) {
                                updatedCart[itemIndex].quantity = item.quantity + 1;
                              }
                              const event = new CustomEvent('cartUpdated', { detail: updatedCart });
                              if (typeof window !== "undefined") window.dispatchEvent(event);
                            }}
                            className="px-4 py-2 text-indigo-700 hover:bg-indigo-100 transition-colors relative overflow-hidden group"
                            aria-label="Augmenter la quantité"
                          >
                            <span className="font-bold text-lg">+</span>
                          </button>
                        </div>
                        
                        <div>
                          <button
                            onClick={() => {
                              removeFromCart(item.id);
                              // Forcer une actualisation du compteur du panier en déclenchant un événement personnalisé
                              const updatedCart = cart.filter(cartItem => cartItem.id !== item.id);
                              const event = new CustomEvent('cartUpdated', { detail: updatedCart });
                              if (typeof window !== "undefined") window.dispatchEvent(event);
                            }}
                            className="text-base font-bold text-indigo-700 hover:text-indigo-900 transition-colors flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Résumé de la commande */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 sticky top-6 overflow-hidden">
              {/* Éléments graphiques abstraits */}
              <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-[#FCEB14] opacity-5 blur-xl"></div>
              <div className="absolute left-1/4 bottom-0 w-24 h-24 rounded-full bg-indigo-200 opacity-10 blur-lg"></div>
              
              <h2 className="text-lg font-bold text-gray-900 mb-5 relative inline-block">
                Résumé de la commande
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-800 font-medium">Prix HT</p>
                  <p className="text-gray-900 font-bold">{(subtotal / 1.2).toFixed(2)} €</p>
                </div>

                <div className="flex justify-between">
                  <p className="text-gray-800 font-medium">TVA (20%)</p>
                  <p className="text-gray-900 font-bold">{(subtotal - subtotal / 1.2).toFixed(2)} €</p>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-gray-800 font-medium">Sous-total TTC</p>
                  <p className="text-gray-900 font-bold">{subtotal.toFixed(2)} €</p>
                </div>
                
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-800 font-medium">Frais de livraison</p>
                    {/* Afficher le type de livraison choisi avec badge coloré */}
                    {cart.length > 0 && (
                      <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cart.some(item => item.shippingType === 'urgent') ? 'bg-yellow-100 text-yellow-800' : cart.some(item => item.shippingType === 'fast') ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                        {cart.some(item => item.shippingType === 'urgent') ? 
                          'Express (1 semaine)' : 
                          cart.some(item => item.shippingType === 'fast') ? 
                          'Prioritaire (2 semaines)' : 
                          'Classique (3 semaines)'}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 font-bold">{shippingCost.toFixed(2)} €</p>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-4 flex justify-between">
                  <p className="text-xl font-bold text-gray-900 relative inline-block">
                    Total
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
                  </p>
                  <p className="text-xl font-bold text-indigo-700">{totalWithShipping.toFixed(2)} €</p>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full mt-6 py-4 px-4 rounded-xl font-bold text-lg text-white transition-all relative overflow-hidden group ${
                  isProcessing ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement en cours...
                  </span>
                ) : (
                  "Procéder au paiement"
                )}
              </button>
              
              <div className="mt-6">
                <Link
                  href="/products"
                  className="flex items-center justify-center text-base font-bold text-indigo-700 hover:text-indigo-900 transition-colors relative overflow-hidden group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continuer vos achats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal d'authentification */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess} 
      />
      
      {/* Modal d'adresse */}
      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSuccess={handleAddressSuccess} 
      />
    </div>
  );
}
