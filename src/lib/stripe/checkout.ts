import Stripe from 'stripe';
import { stripe } from './server';
import { ValidatedItem } from '@/lib/orders/cartValidation';

/** Construit un libellé de ligne lisible pour Stripe (nom + variante + perso). */
function buildLineName(item: ValidatedItem): string {
  const parts = [item.name];
  const options = [item.size, item.color].filter(Boolean);
  if (options.length) parts.push(`(${options.join(', ')})`);
  if (item.customization?.customizations?.length) parts.push('+ personnalisation');
  return parts.join(' ');
}

/**
 * Crée la session Stripe Checkout à partir d'articles DÉJÀ validés serveur.
 * Les montants proviennent exclusivement de la validation serveur.
 */
export async function createCheckoutSession(params: {
  items: ValidatedItem[];
  shipping: { cost: number; label: string };
  orderId: string;
  userId?: string | null;
  customerEmail?: string;
}): Promise<Stripe.Checkout.Session> {
  const { items, shipping, orderId, userId, customerEmail } = params;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: buildLineName(item) },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    })
  );

  if (shipping.cost > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: shipping.label },
        unit_amount: Math.round(shipping.cost * 100),
      },
      quantity: 1,
    });
  }

  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
    locale: 'fr',
    shipping_address_collection: {
      allowed_countries: ['FR', 'BE', 'LU', 'CH'],
    },
    phone_number_collection: { enabled: true },
    allow_promotion_codes: true,
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    custom_text: {
      shipping_address: {
        message: 'Nous livrons en France, Belgique, Luxembourg et Suisse uniquement.',
      },
      submit: {
        message:
          'Nous traiterons votre commande dès réception du paiement. Pour toute question, contactez-nous au 06 41 32 35 04.',
      },
    },
    metadata: {
      orderId,
      userId: userId || 'guest',
    },
    payment_intent_data: {
      description: 'Commande Smiletex - Vêtements personnalisés',
    },
  });
}
