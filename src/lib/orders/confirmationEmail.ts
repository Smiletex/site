import { getOrderWithItems } from './orderService';
import { sendOrderConfirmationEmail } from '@/lib/email/mailer';

/**
 * Charge une commande et envoie l'email de confirmation au client.
 * Déclenché par le webhook une fois le paiement confirmé.
 * Ne lève jamais : un échec d'envoi est consigné et renvoyé en `false`.
 */
export async function sendOrderConfirmation(
  orderId: string,
  to: string | null | undefined,
  customerName?: string
): Promise<boolean> {
  if (!to) {
    console.error(`[orderConfirmation] Pas d'email destinataire pour la commande ${orderId}`);
    return false;
  }

  try {
    const order = await getOrderWithItems(orderId);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const items = ((order as any).order_items ?? []).map((it: any) => ({
      name: it.products?.name ?? 'Article',
      quantity: it.quantity,
      price: Number(it.price_per_unit),
      size: it.product_variants?.size ?? undefined,
      color: it.product_variants?.color ?? undefined,
    }));
    /* eslint-enable @typescript-eslint/no-explicit-any */

    return await sendOrderConfirmationEmail(to, {
      orderId,
      items,
      total: Number((order as { total_amount: number }).total_amount),
      shippingCost: Number((order as { shipping_cost?: number }).shipping_cost ?? 0),
      customerName,
    });
  } catch (error) {
    console.error(`[orderConfirmation] Échec pour la commande ${orderId}:`, error);
    return false;
  }
}
