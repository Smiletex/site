import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin/guard';

/**
 * Lecture des commandes pour l'espace admin (service_role, contourne la RLS).
 * Optionnel : ?userId=... pour filtrer les commandes d'un client.
 * Protégé par la session admin (middleware + requireAdmin).
 */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const userId = request.nextUrl.searchParams.get('userId');

  let query = supabaseAdmin
    .from('orders')
    .select(
      `*, items:order_items ( id, quantity, price_per_unit, customization_data,
        product:products ( name, image_url ) )`
    )
    .order('created_at', { ascending: false });

  if (userId) query = query.eq('user_id', userId);

  const { data: orders, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Joindre le profil client (sur demande de la liste complète).
  const withProfiles = await Promise.all(
    (orders ?? []).map(async (order) => {
      if (!order.user_id) return order;
      const { data: profile } = await supabaseAdmin
        .from('customer_profiles')
        .select('*')
        .eq('id', order.user_id)
        .maybeSingle();
      return profile ? { ...order, customer_profile: profile } : order;
    })
  );

  return NextResponse.json({ orders: withProfiles });
}

/** Mise à jour du statut d'une commande (admin). */
export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'orderId et status requis' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
