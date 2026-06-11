import { supabaseAdmin } from '@/lib/supabase/admin';
import { ValidatedItem } from './cartValidation';
import { decrementVariantStock } from './stock';
import { ShippingType } from './pricing';

/**
 * Statuts de commande. Le tunnel de paiement n'utilise que :
 *   pending_payment -> (paid | cancelled | payment_failed)
 * Les statuts de logistique (shipped, delivered) sont gérés côté admin.
 */
export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  PAYMENT_FAILED: 'payment_failed',
} as const;

/**
 * Crée une commande "en attente de paiement" avec ses articles.
 * Tous les prix proviennent de la validation serveur (jamais du client).
 */
export async function createPendingOrder(params: {
  userId?: string | null;
  items: ValidatedItem[];
  totalAmount: number;
  shipping: { type: ShippingType; cost: number };
}): Promise<{ orderId: string }> {
  const { userId, items, totalAmount, shipping } = params;

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userId || null,
      status: ORDER_STATUS.PENDING_PAYMENT,
      total_amount: totalAmount,
      shipping_cost: shipping.cost,
      shipping_type: shipping.type,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    throw new Error(`Création de la commande impossible : ${orderError?.message}`);
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_variant_id: item.variantId,
    quantity: item.quantity,
    price_per_unit: item.unitPrice,
    customization_data: item.customization,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    // On ne laisse pas une commande sans lignes derrière nous.
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    throw new Error(`Création des articles impossible : ${itemsError.message}`);
  }

  return { orderId: order.id };
}

/** Enregistre l'id de session/payment_intent Stripe sur la commande. */
export async function attachPaymentIntent(
  orderId: string,
  paymentIntentId: string | null
): Promise<void> {
  if (!paymentIntentId) return;
  await supabaseAdmin
    .from('orders')
    .update({ payment_intent_id: paymentIntentId })
    .eq('id', orderId);
}

/**
 * Marque la commande comme payée de façon IDEMPOTENTE.
 * La mise à jour conditionnelle (status != 'paid') garantit qu'un seul appel
 * "gagne" même si Stripe rejoue le webhook : renvoie true uniquement à la
 * première transition, pour ne déclencher stock/email qu'une fois.
 */
export async function markOrderPaid(
  orderId: string,
  shippingAddress?: Record<string, unknown> | null
): Promise<{ transitioned: boolean }> {
  const update: Record<string, unknown> = {
    status: ORDER_STATUS.PAID,
    updated_at: new Date().toISOString(),
  };
  if (shippingAddress) update.shipping_address = shippingAddress;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(update)
    .eq('id', orderId)
    .neq('status', ORDER_STATUS.PAID)
    .select('id');

  if (error) throw new Error(`Mise à jour de la commande impossible : ${error.message}`);

  return { transitioned: !!data && data.length > 0 };
}

/** Passe une commande à "annulée" / "paiement échoué" via son payment_intent. */
export async function markOrderByPaymentIntent(
  paymentIntentId: string,
  status: typeof ORDER_STATUS.CANCELLED | typeof ORDER_STATUS.PAYMENT_FAILED
): Promise<void> {
  await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('payment_intent_id', paymentIntentId)
    .neq('status', ORDER_STATUS.PAID);
}

/** Passe une commande à "annulée" via son id (ex. session Stripe expirée). */
export async function cancelOrder(orderId: string): Promise<void> {
  await supabaseAdmin
    .from('orders')
    .update({ status: ORDER_STATUS.CANCELLED, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .neq('status', ORDER_STATUS.PAID);
}

/**
 * Décrémente le stock pour tous les articles d'une commande.
 * Best-effort : un échec (rupture entre checkout et paiement) est consigné
 * mais ne fait pas échouer le webhook (le client a déjà payé).
 */
export async function decrementStockForOrder(
  orderId: string
): Promise<{ issues: string[] }> {
  const { data: items, error } = await supabaseAdmin
    .from('order_items')
    .select('product_variant_id, quantity')
    .eq('order_id', orderId);

  if (error || !items) {
    return { issues: [`Lecture des articles impossible : ${error?.message}`] };
  }

  const issues: string[] = [];
  for (const item of items) {
    if (!item.product_variant_id) continue;
    const result = await decrementVariantStock(
      item.product_variant_id,
      item.quantity
    );
    if (!result.ok) {
      issues.push(`Variante ${item.product_variant_id} : ${result.error}`);
    }
  }
  return { issues };
}

/** Vide le panier Supabase d'un utilisateur connecté (après paiement). */
export async function clearUserCart(userId: string): Promise<void> {
  const { data: cart } = await supabaseAdmin
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (cart) {
    await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id);
    await supabaseAdmin.from('carts').delete().eq('id', cart.id);
  }
}

/** Charge une commande + ses articles (produit, variante) pour l'email de confirmation. */
export async function getOrderWithItems(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(
      `id, user_id, status, total_amount, shipping_cost, shipping_type, shipping_address, created_at,
       order_items ( quantity, price_per_unit, customization_data,
         products ( name ),
         product_variants ( size, color ) )`
    )
    .eq('id', orderId)
    .single();

  if (error) throw new Error(`Lecture de la commande impossible : ${error.message}`);
  return data;
}
