import { SignJWT, jwtVerify } from 'jose';

/**
 * Session admin : cookie httpOnly contenant un JWT signé (HS256).
 * Compatible edge (middleware) et Node (routes API). Le secret n'est JAMAIS
 * exposé au client. Remplace l'ancien `Bearer Admin123` en dur et le cookie
 * `admin_auth=true` non signé.
 */

export const ADMIN_COOKIE = 'admin_session';
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'ADMIN_SESSION_SECRET manquant ou trop court (>= 16 caractères requis).'
    );
  }
  return new TextEncoder().encode(secret);
}

/** Crée un jeton de session admin signé. */
export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_COOKIE_MAX_AGE}s`)
    .sign(getSecretKey());
}

/** Vérifie la validité (signature + expiration + rôle) d'un jeton de session. */
export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
