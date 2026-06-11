-- Migration 001 : décrément atomique du stock d'une variante.
--
-- Contexte : le mécanisme de stock prévu à l'origine (table inventory_changes +
-- triggers on_order_confirmation) est incomplet en production (la table
-- inventory_changes n'existe pas). On le remplace par une fonction atomique
-- appelée depuis le webhook Stripe une fois le paiement confirmé.
--
-- À exécuter une fois dans le SQL Editor de Supabase.

create or replace function decrement_variant_stock(
  p_variant_id uuid,
  p_quantity integer
)
returns void
language plpgsql
security definer
as $$
begin
  update product_variants
  set stock_quantity = stock_quantity - p_quantity,
      updated_at = now()
  where id = p_variant_id
    and stock_quantity >= p_quantity;

  -- Aucune ligne mise à jour => variante introuvable ou stock insuffisant.
  if not found then
    raise exception 'STOCK_INSUFFISANT: variante % (quantite demandee: %)', p_variant_id, p_quantity
      using errcode = 'check_violation';
  end if;
end;
$$;

-- Droit d'exécution pour les clients authentifiés et le service role.
grant execute on function decrement_variant_stock(uuid, integer) to authenticated, service_role, anon;
