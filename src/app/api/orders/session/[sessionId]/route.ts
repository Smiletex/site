import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Récapitulatif d'une commande pour la page de confirmation.
 * L'orderId est dérivé de la session Stripe (token long et opaque transmis dans
 * l'URL de retour), puis la commande est lue côté serveur (service role).
 *
 * Lecture seule : cette route ne modifie jamais le statut de la commande.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID manquant' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json(
        { error: 'Commande introuvable pour cette session' },
        { status: 404 }
      );
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(
        `id, status, total_amount, shipping_cost, shipping_address,
         order_items ( id, quantity, price_per_unit, customization_data,
           products ( name, image_url ),
           product_variants ( size, color ) )`
      )
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const items = ((order as any).order_items ?? []).map((it: any) => ({
      id: it.id,
      name: it.products?.name ?? '',
      price: Number(it.price_per_unit),
      quantity: it.quantity,
      size: it.product_variants?.size ?? '',
      color: it.product_variants?.color ?? '',
      imageUrl: it.products?.image_url ?? '',
      customization: it.customization_data ?? null,
    }));
    /* eslint-enable @typescript-eslint/no-explicit-any */

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      total: Number(order.total_amount),
      shippingCost: Number(order.shipping_cost ?? 0),
      shippingAddress: order.shipping_address ?? null,
      items,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la commande' },
      { status: 500 }
    );
  }
}
