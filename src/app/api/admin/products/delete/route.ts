import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin/guard';

/**
 * Suppression SÛRE d'un produit.
 *
 * - Protégée par la session admin (middleware + requireAdmin).
 * - Ne supprime JAMAIS de lignes order_items : si le produit a déjà été commandé,
 *   la suppression est refusée (l'historique des commandes doit être préservé).
 * - Sinon, supprime les éléments transitoires (cart_items, product_images) puis
 *   le produit (les product_variants sont supprimées en cascade).
 */
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de produit manquant' },
        { status: 400 }
      );
    }

    // Variantes du produit (pour vérifier les références).
    const { data: variants } = await supabaseAdmin
      .from('product_variants')
      .select('id')
      .eq('product_id', id);
    const variantIds = (variants ?? []).map((v) => v.id);

    // Refus si le produit (ou une de ses variantes) figure dans une commande.
    const { count: orderRefByProduct } = await supabaseAdmin
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', id);

    let orderRefByVariant = 0;
    if (variantIds.length > 0) {
      const { count } = await supabaseAdmin
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .in('product_variant_id', variantIds);
      orderRefByVariant = count ?? 0;
    }

    if ((orderRefByProduct ?? 0) > 0 || orderRefByVariant > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Ce produit a déjà été commandé : il ne peut pas être supprimé pour préserver l\'historique des commandes. Retirez-le du catalogue plutôt que de le supprimer.',
        },
        { status: 409 }
      );
    }

    // Nettoyage des éléments transitoires.
    if (variantIds.length > 0) {
      await supabaseAdmin
        .from('cart_items')
        .delete()
        .in('product_variant_id', variantIds);
    }
    await supabaseAdmin.from('cart_items').delete().eq('product_id', id);
    // product_images : ignoré silencieusement si la table n'existe pas.
    await supabaseAdmin.from('product_images').delete().eq('product_id', id);

    // Suppression du produit (les product_variants partent en cascade).
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
