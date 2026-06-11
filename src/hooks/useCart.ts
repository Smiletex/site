'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  addToCart as addToCartUtil, 
  getCart as getCartUtil, 
  removeFromCart as removeFromCartUtil,
  updateCartItemQuantity as updateCartItemQuantityUtil,
  clearCart as clearCartUtil,
  calculateCartTotal,
  getLocalCart
} from '@/lib/cart';
import { CartItem, CartResponse } from '@/types/cart';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();

  // Initialiser le panier au chargement
  useEffect(() => {
    const initCart = async () => {
      try {
        // Utiliser directement le panier local
        const cartItems = getLocalCart();
        setCart(cartItems);
        setTotal(calculateCartTotal(cartItems));
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du panier:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initCart();
    
    // Écouter les changements du localStorage et l'événement personnalisé
    const handleStorageChange = () => {
      const cartItems = getLocalCart();
      setCart(cartItems);
      setTotal(calculateCartTotal(cartItems));
    };
    
    // Gestionnaire pour l'événement personnalisé cartUpdated
    const handleCartUpdate = (event: CustomEvent<any>) => {
      const updatedCart = event.detail;
      if (updatedCart) {
        setCart(updatedCart);
        setTotal(calculateCartTotal(updatedCart));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    };
  }, []);

  // Ajouter un article au panier
  const addToCart = async (item: CartItem) => {
    try {
      const updatedCart = await addToCartUtil(item);
      setCart(updatedCart);
      setTotal(calculateCartTotal(updatedCart));
      return updatedCart;
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      throw error;
    }
  };

  // Supprimer un article du panier
  const removeFromCart = async (itemId: string) => {
    try {
      const updatedCart = await removeFromCartUtil(itemId);
      setCart(updatedCart);
      setTotal(calculateCartTotal(updatedCart));
      return updatedCart;
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      throw error;
    }
  };

  // Mettre à jour la quantité d'un article
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const updatedCart = await updateCartItemQuantityUtil(itemId, quantity);
      setCart(updatedCart);
      setTotal(calculateCartTotal(updatedCart));
      return updatedCart;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      throw error;
    }
  };

  // Vider le panier
  const clearCart = async () => {
    try {
      // Vider le localStorage directement
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
        localStorage.setItem('cart', JSON.stringify([]));
      }
      
      // Appeler la fonction utilitaire qui gère aussi Supabase
      await clearCartUtil(user?.id);
      
      // Forcer la mise à jour de l'état local
      setCart([]);
      setTotal(0);
      
      // Log pour débogage
      console.log('Cart completely cleared from useCart hook');
      
      // Effectuer un rechargement complet de la page pour éliminer toute donnée en cache
      if (typeof window !== 'undefined') {
        // Attendre un court instant pour que les logs s'affichent
        setTimeout(() => {
          window.location.reload(); // Rechargement complet de la page
        }, 100);
      }
      
      return [];
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      throw error;
    }
  };

  // Créer une session de paiement Stripe
  const createCheckoutSession = async (shippingDetails?: any): Promise<CartResponse> => {
    try {
      // S'assurer que l'ID utilisateur est correctement transmis
      const userId = user?.id;
      
      console.log('Creating checkout session with user ID:', userId);
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          userId,
          shippingDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue lors de la création de la session de paiement');
      }

      // La commande est créée en "pending_payment" par /api/checkout.
      // Sa confirmation (statut payé, stock, email) est gérée par le webhook Stripe.
      return data as CartResponse;
    } catch (error) {
      console.error('Erreur lors de la création de la session de paiement:', error);
      throw error;
    }
  };

  return {
    cart,
    isLoading,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    createCheckoutSession,
    itemCount: cart.reduce((count, item) => count + item.quantity, 0),
  };
}
