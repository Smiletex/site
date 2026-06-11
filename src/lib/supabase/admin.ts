import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase à privilèges service_role, réservé au CÔTÉ SERVEUR
 * (routes API, webhook). Ne jamais importer dans un composant client :
 * la clé service_role contourne la RLS et ne doit jamais atteindre le navigateur.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);
