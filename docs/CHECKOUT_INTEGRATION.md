# Documentation de l'Intégration du Checkout avec Stripe

Ce document détaille l'intégration du processus de paiement avec Stripe dans l'application e-commerce smiletex.

> **Note importante**: La configuration complète du webhook Stripe nécessite que votre site soit accessible en ligne. Cette étape devra être finalisée après le déploiement de l'application. Pour le moment, le code est en place mais la configuration finale du webhook sera effectuée ultérieurement.

## Architecture de l'Intégration

L'intégration du checkout avec Stripe suit le flux suivant :

1. L'utilisateur ajoute des produits à son panier
2. Sur la page du panier, l'utilisateur clique sur "Payer"
3. Le système crée une session de paiement Stripe via l'API
4. L'utilisateur est redirigé vers la page de paiement Stripe
5. Après le paiement, l'utilisateur est redirigé vers une page de succès
6. Un webhook Stripe met à jour le statut de la commande et les stocks (à configurer après déploiement)

## Composants Principaux

### 1. Client Stripe (`src/lib/stripe/client.ts`)

Ce fichier initialise le client Stripe côté navigateur :

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default stripePromise;
```

### 2. API de Checkout (`src/app/api/checkout/route.ts`)

Cette API crée une session de paiement Stripe avec les articles du panier :

```typescript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  const { items, userId = 'guest' } = await request.json();
  
  // Créer les line items pour Stripe
  const lineItems = items.map((item: any) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.name,
        images: [item.imageUrl],
        metadata: {
          productId: item.productId,
          variantId: item.variantId,
        },
      },
      unit_amount: item.price * 100, // Stripe utilise les centimes
    },
    quantity: item.quantity,
  }));

  // Créer la session Stripe
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
    metadata: {
      userId,
      orderItems: JSON.stringify(items),
    },
  });

  return NextResponse.json({ sessionId: session.id, url: session.url });
}
```

### 3. Webhook Stripe (`src/app/api/webhook/route.ts`)

Ce webhook traite les événements Stripe pour mettre à jour les commandes et les stocks :

```typescript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature') as string;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Gérer les différents événements Stripe
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Mettre à jour le statut de la commande
      await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('stripe_session_id', session.id);
      
      // Mettre à jour les stocks
      if (session.metadata?.orderItems) {
        const orderItems = JSON.parse(session.metadata.orderItems);
        
        for (const item of orderItems) {
          // Mettre à jour le stock de chaque variante
          const { data: variant } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', item.variantId)
            .single();
          
          const newStock = Math.max(0, variant.stock - item.quantity);
          
          await supabase
            .from('product_variants')
            .update({ stock: newStock })
            .eq('id', item.variantId);
        }
      }
      break;
  }

  return NextResponse.json({ received: true });
}
```

### 4. Page de Succès (`src/app/checkout/success/page.tsx`)

Cette page affiche la confirmation après un paiement réussi :

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartContext } from '@/components/CartProvider';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCartContext();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Récupérer les détails de la commande
      fetch(`/api/orders/session?sessionId=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setOrder(data.order);
          clearCart(); // Vider le panier après un paiement réussi
        })
        .catch(err => console.error('Erreur lors de la récupération de la commande:', err))
        .finally(() => setLoading(false));
    }
  }, [sessionId, clearCart]);

  if (loading) {
    return <div className="container mx-auto p-6">Chargement de votre commande...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-600 mb-2">Commande confirmée !</h1>
          <p className="text-gray-600">
            Merci pour votre achat. Votre commande a été traitée avec succès.
          </p>
        </div>
        
        {order && (
          <div className="border-t pt-4">
            <h2 className="font-semibold text-lg mb-2">Détails de la commande</h2>
            <p><span className="font-medium">Numéro de commande:</span> {order.id}</p>
            <p><span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
            <p><span className="font-medium">Statut:</span> {order.status}</p>
            <p><span className="font-medium">Total:</span> {order.total_amount}€</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5. Contexte du Panier (`src/components/CartProvider.tsx`)

Ce composant fournit un contexte global pour gérer l'état du panier :

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart, saveCart, addItemToCart, removeItemFromCart, updateItemQuantity } from '@/lib/cart';

// Type pour les articles du panier
export type CartItem = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl: string;
};

// Type pour le contexte du panier
type CartContextType = {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
};

// Création du contexte
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

// Composant Provider
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le panier au montage du composant
  useEffect(() => {
    const loadCart = async () => {
      const cart = await getCart();
      setItems(cart);
      setIsLoading(false);
    };
    
    loadCart();
  }, []);

  // Sauvegarder le panier à chaque modification
  useEffect(() => {
    if (!isLoading) {
      saveCart(items);
    }
  }, [items, isLoading]);

  // Calculer le nombre total d'articles
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  // Calculer le prix total
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Ajouter un article au panier
  const addToCart = (item: CartItem) => {
    setItems(prevItems => addItemToCart(prevItems, item));
  };

  // Supprimer un article du panier
  const removeFromCart = (itemId: string) => {
    setItems(prevItems => removeItemFromCart(prevItems, itemId));
  };

  // Mettre à jour la quantité d'un article
  const updateQuantity = (itemId: string, quantity: number) => {
    setItems(prevItems => updateItemQuantity(prevItems, itemId, quantity));
  };

  // Vider le panier
  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};
```

## Flux de Paiement

1. **Initialisation du Paiement** : Sur la page du panier, l'utilisateur clique sur "Payer" ce qui déclenche une requête à l'API `/api/checkout`.

2. **Création de la Session** : L'API crée une session Stripe avec les articles du panier et renvoie l'URL de redirection.

3. **Redirection vers Stripe** : L'utilisateur est redirigé vers la page de paiement Stripe où il saisit ses informations de carte.

4. **Traitement du Paiement** : Stripe traite le paiement et redirige l'utilisateur vers la page de succès avec l'ID de session.

5. **Confirmation et Mise à Jour** : Le webhook Stripe reçoit l'événement de paiement réussi et met à jour le statut de la commande et les stocks (à configurer après déploiement).

6. **Affichage de la Confirmation** : La page de succès récupère les détails de la commande et les affiche à l'utilisateur.

## Tests et Débogage

Pour tester l'intégration Stripe :

1. Utilisez les cartes de test Stripe (ex: 4242 4242 4242 4242)
2. Vérifiez les webhooks avec Stripe CLI
3. Consultez les journaux d'événements dans le tableau de bord Stripe

## Considérations de Sécurité

- Toutes les clés secrètes Stripe sont stockées dans les variables d'environnement
- Les webhooks vérifient la signature pour s'assurer que les événements proviennent bien de Stripe
- Les paiements sont traités côté serveur pour éviter les manipulations côté client
