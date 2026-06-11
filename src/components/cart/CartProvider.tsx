'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductCustomization } from '@/types/customization';
import { calculateCustomizationPrice } from '@/lib/customization';

// Type pour un élément du panier
export type CartItem = {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl: string;
  customization?: ProductCustomization;
  shippingType?: 'normal' | 'fast' | 'urgent';
};

// Type pour le contexte du panier
type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string, size?: string, color?: string, customization?: ProductCustomization) => void;
  updateQuantity: (itemId: string, quantity: number, size?: string, color?: string, customization?: ProductCustomization) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  itemCount: number;
};

// Créer le contexte
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte du panier
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext doit être utilisé à l\'intérieur d\'un CartProvider');
  }
  return context;
};

// Générer une clé unique pour un élément du panier
const getCartItemKey = (item: CartItem): string => {
  let key = `${item.id}-${item.size || 'default'}-${item.color || 'default'}`;
  
  // Si l'élément a une personnalisation, ajouter un identifiant unique
  if (item.customization) {
    key += `-custom-${Date.now()}`;
  }
  
  return key;
};

// Vérifier si deux éléments du panier sont identiques (même produit, taille, couleur et sans personnalisation)
const areItemsEqual = (item1: CartItem, item2: CartItem): boolean => {
  // Si l'un des éléments a une personnalisation, ils ne sont jamais considérés comme identiques
  if (item1.customization || item2.customization) {
    return false;
  }
  
  return (
    item1.id === item2.id &&
    item1.size === item2.size &&
    item1.color === item2.color
  );
};

// Composant Provider
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  // Ajout d'un état pour forcer les mises à jour
  const [updateCounter, setUpdateCounter] = useState(0);

  // Charger le panier depuis le localStorage au chargement
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      }
    }
  }, []);

  // Fonction pour forcer la mise à jour du panier
  const forceUpdate = () => {
    // Incrémenter le compteur pour forcer une mise à jour
    setUpdateCounter(prev => prev + 1);
    
    // Récupérer le panier depuis le localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as CartItem[];
        setCartItems(parsedCart);
        
        // Mettre à jour les compteurs directement
        const count = parsedCart.reduce((total: number, item: CartItem) => total + item.quantity, 0);
        setCartCount(count);
        
        const total = parsedCart.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
        setCartTotal(total);
        
        const items = parsedCart.length;
        setItemCount(items);
        
        console.log('Panier mis à jour avec force:', { items, count, total });
      } catch (error) {
        console.error('Erreur lors du chargement forcé du panier:', error);
      }
    } else {
      // Si le panier est vide
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      setItemCount(0);
      console.log('Panier vidé avec force');
    }
  };

  // Mettre à jour le localStorage lorsque le panier change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Calculer le nombre total d'articles
    const count = cartItems.reduce((total: number, item: CartItem) => total + item.quantity, 0);
    setCartCount(count);
    
    // Calculer le prix total
    // Note: Le prix de la personnalisation est déjà inclus dans item.price
    // lors de l'ajout au panier, donc nous n'avons pas besoin de le recalculer ici
    const total = cartItems.reduce((sum: number, item: CartItem) => {
      return sum + (item.price * item.quantity);
    }, 0);
    setCartTotal(total);
    
    // Calculer le nombre d'articles
    const items = cartItems.length;
    setItemCount(items);
    
    console.log('Mise à jour du panier:', { items, count, total });
  }, [cartItems, updateCounter]);

  // Ajouter un article au panier
  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      // Chercher si l'article existe déjà dans le panier
      const existingItemIndex = prevItems.findIndex(
        prevItem => areItemsEqual(prevItem, item)
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Si l'article existe, mettre à jour la quantité
        updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
      } else {
        // Sinon, ajouter le nouvel article
        updatedItems = [...prevItems, { ...item }];
      }
      
      // Mettre à jour le localStorage directement
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      // Forcer la mise à jour du compteur
      setTimeout(() => forceUpdate(), 0);
      
      return updatedItems;
    });
  };

  // Supprimer un article du panier
  const removeFromCart = (itemId: string, size?: string, color?: string, customization?: ProductCustomization) => {
    setCartItems(prevItems => {
      let updatedItems;
      if (customization) {
        // Pour les articles personnalisés, supprimer l'article exact
        updatedItems = prevItems.filter(item => 
          !(item.id === itemId && 
            item.size === size && 
            item.color === color && 
            item.customization === customization)
        );
      } else {
        // Pour les articles standard, supprimer en fonction de l'ID, de la taille et de la couleur
        updatedItems = prevItems.filter(item => 
          !(item.id === itemId && 
            item.size === size && 
            item.color === color && 
            !item.customization)
        );
      }
      
      // Mettre à jour le localStorage directement
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      // Forcer la mise à jour du compteur
      setTimeout(() => forceUpdate(), 0);
      
      return updatedItems;
    });
  };

  // Mettre à jour la quantité d'un article
  const updateQuantity = (itemId: string, quantity: number, size?: string, color?: string, customization?: ProductCustomization) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (customization) {
          // Pour les articles personnalisés, mettre à jour l'article exact
          if (item.id === itemId && 
              item.size === size && 
              item.color === color && 
              item.customization === customization) {
            return { ...item, quantity };
          }
        } else {
          // Pour les articles standard, mettre à jour en fonction de l'ID, de la taille et de la couleur
          if (item.id === itemId && 
              item.size === size && 
              item.color === color && 
              !item.customization) {
            return { ...item, quantity };
          }
        }
        return item;
      });
      
      // Mettre à jour le localStorage directement
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      // Forcer la mise à jour du compteur
      setTimeout(() => forceUpdate(), 0);
      
      return updatedItems;
    });
  };

  // Vider le panier
  const clearCart = () => {
    setCartItems([]);
    
    // Vider le localStorage directement
    localStorage.removeItem('cart');
    
    // Forcer la mise à jour du compteur
    setTimeout(() => forceUpdate(), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
