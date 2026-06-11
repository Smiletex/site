-- Migration 002 : Row Level Security sur les données personnelles (B3, Phase 1).
--
-- Tables protégées : orders, order_items, customer_profiles, saved_designs.
-- Principe :
--   - le service_role (routes serveur : checkout, webhook, routes admin) BYPASSE
--     la RLS, donc le serveur garde un accès complet ;
--   - un client connecté (Supabase Auth) accède UNIQUEMENT à ses propres données
--     via auth.uid() ;
--   - le rôle anon n'a aucun accès à ces tables (plus de fuite via la clé publique).
--
-- À exécuter dans le SQL Editor de Supabase. Réversible : voir le bloc en bas.

alter table orders            enable row level security;
alter table order_items       enable row level security;
alter table customer_profiles enable row level security;
alter table saved_designs     enable row level security;

-- orders : lecture de ses propres commandes uniquement.
drop policy if exists orders_select_own on orders;
create policy orders_select_own on orders
  for select to authenticated
  using (user_id = auth.uid());

-- order_items : lecture via la commande parente appartenant au client.
drop policy if exists order_items_select_own on order_items;
create policy order_items_select_own on order_items
  for select to authenticated
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

-- customer_profiles : chaque client gère son propre profil.
drop policy if exists profiles_select_own on customer_profiles;
create policy profiles_select_own on customer_profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists profiles_insert_own on customer_profiles;
create policy profiles_insert_own on customer_profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_own on customer_profiles;
create policy profiles_update_own on customer_profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- saved_designs : chaque client gère ses propres designs.
drop policy if exists designs_all_own on saved_designs;
create policy designs_all_own on saved_designs
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- ROLLBACK (si besoin de revenir en arrière) :
--   alter table orders            disable row level security;
--   alter table order_items       disable row level security;
--   alter table customer_profiles disable row level security;
--   alter table saved_designs     disable row level security;
-- ---------------------------------------------------------------------------
