import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyAdminSessionToken } from './session';

/**
 * Garde de sécurité pour les routes API admin (défense en profondeur,
 * en plus du middleware). Renvoie une réponse 401 si la session est invalide,
 * sinon `null` (la route peut continuer).
 *
 * Usage :
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  return null;
}
