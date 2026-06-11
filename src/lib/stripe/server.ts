import Stripe from 'stripe';

/**
 * Instance Stripe CÔTÉ SERVEUR (clé secrète). À utiliser dans les routes API
 * et le webhook. Ne jamais importer côté client (utiliser getStripe de ./client).
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});
