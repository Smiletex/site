'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CartItem } from '@/types/cart';

/**
 * Source UNIQUE de vérité du panier.
 *
 * Remplace les anciennes implémentations concurrentes (CartProvider + hook
 * useCart/lib/cart) qui partageaient la même clé localStorage avec des identités
 * d'articles divergentes (E1). Ici :
 *  - chaque article a un id STABLE dérivé de sa configuration (produit, variante,
 *    taille, couleur, personnalisation) : deux ajouts identiques fusionnent, deux
 *    personnalisations différentes restent distinctes. Plus de Date.now().
 *  - mises à jour immuables, persistées dans localStorage (clé `cart`).
 *
 * Note : le prix porté par les articles est indicatif (affichage). Le prix
 * réellement facturé est TOUJOURS recalculé côté serveur au checkout (cf B1).
 */

const STORAGE_KEY = 'cart';

function hashString(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

/** Identité stable d'un article (indépendante de la quantité). */
function computeItemId(item: CartItem): string {
  const custom = item.customization ? JSON.stringify(item.customization) : '';
  return [
    item.productId,
    item.variantId ?? '',
    item.size ?? '',
    item.color ?? '',
    hashString(custom),
  ].join('|');
}

interface CheckoutOptions {
  email?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartItems: CartItem[];
  isLoading: boolean;
  total: number;
  cartTotal: number;
  itemCount: number;
  cartCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  createCheckoutSession: (
    options?: CheckoutOptions
  ) => Promise<{ orderId?: string; url?: string; error?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans un CartProvider');
  return ctx;
};

// Alias rétro-compatible (anciens consommateurs).
export const useCartContext = useCart;

function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement initial (client uniquement) + synchro inter-onglets.
  useEffect(() => {
    setCart(loadFromStorage());
    setIsLoading(false);

    const onExternalChange = () => setCart(loadFromStorage());
    window.addEventListener('storage', onExternalChange);
    window.addEventListener('cartUpdated', onExternalChange);
    return () => {
      window.removeEventListener('storage', onExternalChange);
      window.removeEventListener('cartUpdated', onExternalChange);
    };
  }, []);

  // Persistance : une seule source écrit le localStorage.
  const persist = useCallback((next: CartItem[]) => {
    setCart(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      // Notifier les composants hors contexte (ex. compteur dans un autre arbre).
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, []);

  const addToCart = useCallback(
    (item: CartItem) => {
      const id = computeItemId(item);
      setCart((prev) => {
        const index = prev.findIndex((it) => it.id === id);
        const next =
          index >= 0
            ? prev.map((it, i) =>
                i === index ? { ...it, quantity: it.quantity + item.quantity } : it
              )
            : [...prev, { ...item, id }];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event('cartUpdated'));
        }
        return next;
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (id: string) => {
      setCart((prev) => {
        const next = prev.filter((it) => it.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event('cartUpdated'));
        }
        return next;
      });
    },
    []
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, quantity } : it));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event('cartUpdated'));
      }
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const createCheckoutSession = useCallback(
    async (options?: CheckoutOptions) => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          userId: user?.id,
          email: options?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }
      return data as { orderId?: string; url?: string };
    },
    [cart, user]
  );

  const total = useMemo(
    () => cart.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [cart]
  );
  const itemCount = useMemo(
    () => cart.reduce((sum, it) => sum + it.quantity, 0),
    [cart]
  );

  const value: CartContextType = {
    cart,
    cartItems: cart,
    isLoading,
    total,
    cartTotal: total,
    itemCount,
    cartCount: itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    createCheckoutSession,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
