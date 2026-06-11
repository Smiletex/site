'use client';

import React, { useState, useEffect } from 'react';

/**
 * Composant indépendant pour afficher le nombre d'articles dans le panier
 * Ce composant lit directement le localStorage et se met à jour automatiquement
 */
export default function CartCounter() {
  const [count, setCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Fonction pour obtenir le nombre d'articles dans le panier
  const getCartCount = () => {
    if (typeof window === 'undefined') return 0;
    
    try {
      const cartString = localStorage.getItem('cart');
      if (!cartString) return 0;
      
      const cart = JSON.parse(cartString);
      return Array.isArray(cart) ? cart.length : 0;
    } catch (error) {
      console.error('Erreur lors de la lecture du panier:', error);
      return 0;
    }
  };

  useEffect(() => {
    // Marquer comme côté client
    setIsClient(true);
    // Mettre à jour le compteur au chargement
    setCount(getCartCount());
    
    // Fonction pour mettre à jour le compteur
    const updateCount = () => {
      const newCount = getCartCount();
      if (newCount !== count) {
        setCount(newCount);
      }
    };
    
    // Vérifier régulièrement le panier
    const interval = setInterval(updateCount, 300);
    
    // Écouter les changements du localStorage
    const handleStorageChange = () => {
      updateCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Créer un observateur de mutations pour surveiller les changements du DOM
    // Cela peut aider à détecter les changements dans le panier qui ne déclenchent pas d'événements storage
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(() => {
        updateCount();
      });
      
      // Observer le body pour détecter les changements
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorageChange);
        observer.disconnect();
      };
    }
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [count]);

  // Ne rien afficher côté serveur ou s'il n'y a pas d'articles dans le panier
  if (!isClient || count === 0) return null;

  return (
    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-indigo-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
      {count}
    </span>
  );
}
