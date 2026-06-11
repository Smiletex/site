'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl: string;
  customization: unknown;
}

interface OrderSummary {
  orderId: string;
  status: string;
  total: number;
  shippingCost: number;
  shippingAddress?: {
    name?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      postal_code?: string;
      country?: string;
    };
  } | null;
  items: OrderItem[];
}

/** Vide le panier local (UX) sans recharger la page. */
function clearLocalCart() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdated'));
  window.dispatchEvent(new Event('storage'));
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccess />
    </Suspense>
  );
}

function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    // Le panier local est vidé côté client (le webhook vide le panier serveur).
    clearLocalCart();

    if (!sessionId) {
      setError('Session de paiement introuvable.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 5; // ~10s : le temps que le webhook confirme le paiement.

    const load = async () => {
      try {
        const res = await fetch(`/api/orders/session/${sessionId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Commande introuvable');
        if (cancelled) return;

        setOrder(data as OrderSummary);
        setIsLoading(false);

        // Le webhook est asynchrone : si le paiement n'est pas encore confirmé,
        // on réinterroge quelques fois sans jamais modifier la commande.
        if (data.status !== 'paid' && attempts < MAX_ATTEMPTS) {
          attempts += 1;
          setTimeout(load, 2000);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">Une erreur est survenue</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order?.status === 'paid';

  return (
    <div className="min-h-screen bg-gray-50 py-12" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-green-600 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Commande confirmée !</h1>
              <p className="mt-2 text-gray-600">
                Merci pour votre commande. Vous recevrez un email de confirmation.
              </p>
              <div className="mt-4">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: isPaid ? '#DEF7EC' : '#FDF6B2',
                    color: isPaid ? '#03543F' : '#723B13',
                  }}
                >
                  {isPaid ? 'Paiement confirmé' : 'Confirmation du paiement en cours...'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif de la commande</h2>

              <div className="space-y-6">
                {(order?.items ?? []).map((item) => (
                  <div key={item.id} className="flex items-center border-b border-gray-200 pb-4">
                    <div className="relative h-24 w-24 rounded overflow-hidden">
                      <Image
                        src={item.imageUrl || '/images/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-6 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {[item.size, item.color].filter(Boolean).join(', ')}
                      </p>
                      <div className="mt-2 flex justify-between">
                        <p className="text-sm text-gray-500">Quantité : {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">
                          {(item.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4">
                  <div className="flex justify-between text-base">
                    <p className="text-gray-600">Sous-total</p>
                    <p className="font-medium text-gray-900">
                      {((order?.total ?? 0) - (order?.shippingCost ?? 0)).toFixed(2)} €
                    </p>
                  </div>
                  <div className="flex justify-between text-base mt-2">
                    <p className="text-gray-600">Frais de livraison</p>
                    <p className="font-medium text-gray-900">
                      {(order?.shippingCost ?? 0).toFixed(2)} €
                    </p>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-900">Total</p>
                    <p className="text-indigo-600">{(order?.total ?? 0).toFixed(2)} €</p>
                  </div>

                  {order?.shippingAddress && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Adresse de livraison</h3>
                      <p className="text-gray-600">{order.shippingAddress.name}</p>
                      <p className="text-gray-600">{order.shippingAddress.address?.line1}</p>
                      {order.shippingAddress.address?.line2 && (
                        <p className="text-gray-600">{order.shippingAddress.address.line2}</p>
                      )}
                      <p className="text-gray-600">
                        {order.shippingAddress.address?.postal_code} {order.shippingAddress.address?.city}
                      </p>
                      <p className="text-gray-600">{order.shippingAddress.address?.country}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center space-y-4">
              {user && (
                <Link
                  href="/account"
                  className="inline-flex items-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 mr-4"
                >
                  Voir mes commandes
                </Link>
              )}
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
