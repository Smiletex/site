import { NextResponse } from 'next/server';
import { validateCart, ClientCartItem } from '@/lib/orders/cartValidation';
import { createPendingOrder, attachPaymentIntent } from '@/lib/orders/orderService';
import { createCheckoutSession } from '@/lib/stripe/checkout';

/**
 * Démarre le tunnel de paiement.
 *
 * Sécurité (B1) : aucun prix n'est accepté du client. Le panier est revalidé
 * serveur (prix rechargés depuis la base, stock vérifié), puis la commande est
 * créée en `pending_payment`. La confirmation du paiement est gérée UNIQUEMENT
 * par le webhook Stripe (cf. api/webhook/route.ts), jamais par le navigateur.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, userId, email } = body as {
      items: ClientCartItem[];
      userId?: string;
      email?: string;
    };

    // 1. Revalidation serveur : prix recalculés, stock vérifié.
    const validation = await validateCart(items ?? []);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 2. Création de la commande en attente de paiement (prix serveur).
    const { orderId } = await createPendingOrder({
      userId: userId || null,
      items: validation.items,
      totalAmount: validation.totalAmount,
      shipping: validation.shipping,
    });

    // 3. Session Stripe construite à partir des montants serveur.
    const session = await createCheckoutSession({
      items: validation.items,
      shipping: validation.shipping,
      orderId,
      userId: userId || null,
      customerEmail: email,
    });

    // 4. Lien du payment_intent à la commande (si déjà disponible).
    await attachPaymentIntent(
      orderId,
      typeof session.payment_intent === 'string' ? session.payment_intent : null
    );

    return NextResponse.json({ orderId, url: session.url });
  } catch (error) {
    console.error('Erreur lors du processus de checkout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
