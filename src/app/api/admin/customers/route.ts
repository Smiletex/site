import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin/guard';

/** Liste des profils clients pour l'espace admin (service_role, contourne la RLS). */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { data, error } = await supabaseAdmin
    .from('customer_profiles')
    .select('*');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ customers: data ?? [] });
}

const EDITABLE_FIELDS = [
  'first_name',
  'last_name',
  'phone',
  'address_line1',
  'address_line2',
  'city',
  'postal_code',
  'country',
] as const;

/** Mise à jour d'un profil client par l'admin. */
export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const field of EDITABLE_FIELDS) {
      if (field in body) updates[field] = body[field];
    }

    const { error } = await supabaseAdmin
      .from('customer_profiles')
      .update(updates)
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
