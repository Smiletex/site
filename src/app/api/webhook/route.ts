import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/server';
import {
  markOrderPaid,
  decrementStockForOrder,
  clearUserCart,
  attachPaymentIntent,
  markOrderByPaymentIntent,
  cancelOrder,
  ORDER_STATUS,
} from '@/lib/orders/orderService';
import { sendOrderConfirmation } from '@/lib/orders/confirmationEmail';

/**
 * Webhook Stripe : SEULE source de vérité de la confirmation de paiement (B2).
 *
 * La signature est vérifiée avant tout traitement. Sur `checkout.session.completed`,
 * et de façon idempotente (un seul traitement même si Stripe rejoue l'événement) :
 *  - la commande passe à `paid`,
 *  - le stock est décrémenté (B7),
 *  - l'email de confirmation est envoyé,
 *  - le panier de l'utilisateur connecté est vidé.
 */
export async function POST(request: Request) {
  let event: Stripe.Event;

  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Signature Stripe absente' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'inconnue';
    console.error(`Échec de vérification de la signature webhook: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) await cancelOrder(orderId);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await markOrderByPaymentIntent(paymentIntent.id, ORDER_STATUS.PAYMENT_FAILED);
        break;
      }

      default:
        // Événement non géré : on accuse réception pour éviter les relances.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur de traitement du webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur webhook' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.orderId;
  const userId = session.metadata?.userId;

  if (!orderId) {
    throw new Error('orderId absent des métadonnées de la session');
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const shipping =
    (session as any).shipping_details ??
    (session as any).collected_information?.shipping_details ??
    null;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const shippingAddress = shipping
    ? {
        name: shipping.name,
        address: {
          line1: shipping.address?.line1,
          line2: shipping.address?.line2,
          city: shipping.address?.city,
          postal_code: shipping.address?.postal_code,
          country: shipping.address?.country,
        },
      }
    : null;

  // Transition idempotente : seul le premier appel déclenche stock + email.
  const { transitioned } = await markOrderPaid(orderId, shippingAddress);

  if (typeof session.payment_intent === 'string') {
    await attachPaymentIntent(orderId, session.payment_intent);
  }

  if (!transitioned) {
    // Déjà traité (rejeu du webhook) : ne rien refaire.
    return;
  }

  // Décrément du stock (best-effort : le paiement est déjà acquis).
  const { issues } = await decrementStockForOrder(orderId);
  if (issues.length > 0) {
    console.error(`[webhook] Problèmes de stock pour la commande ${orderId}:`, issues);
  }

  // Email de confirmation.
  const email = session.customer_details?.email ?? null;
  const customerName = session.customer_details?.name ?? shipping?.name ?? undefined;
  await sendOrderConfirmation(orderId, email, customerName);

  // Vidage du panier de l'utilisateur connecté.
  if (userId && userId !== 'guest') {
    await clearUserCart(userId);
  }
}
