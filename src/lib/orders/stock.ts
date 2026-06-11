import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Décrémente atomiquement le stock d'une variante via la fonction SQL
 * `decrement_variant_stock` (cf. db/migrations/001_decrement_variant_stock.sql).
 * Échoue proprement si la variante est introuvable ou le stock insuffisant.
 */
export async function decrementVariantStock(
  variantId: string,
  quantity: number
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin.rpc('decrement_variant_stock', {
    p_variant_id: variantId,
    p_quantity: quantity,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
