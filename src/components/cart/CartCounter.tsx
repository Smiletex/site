'use client';

import { useCart } from '@/components/cart/CartProvider';

/**
 * Badge du nombre d'articles dans le panier.
 * Lit le compteur depuis la source unique (CartProvider) : réactif, sans
 * polling ni MutationObserver.
 */
export default function CartCounter() {
  const { itemCount } = useCart();

  if (itemCount === 0) return null;

  return (
    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-indigo-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
      {itemCount}
    </span>
  );
}
