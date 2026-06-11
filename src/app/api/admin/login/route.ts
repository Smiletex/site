import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createAdminSessionToken,
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
} from '@/lib/admin/session';

/**
 * Connexion admin. Valide les identifiants contre les variables d'env
 * (aucun identifiant par défaut), puis pose un cookie de session SIGNÉ.
 */
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPass = process.env.ADMIN_PASSWORD;

    if (!expectedUser || !expectedPass) {
      console.error('ADMIN_USERNAME / ADMIN_PASSWORD non configurés.');
      return NextResponse.json(
        { success: false, message: 'Authentification admin non configurée.' },
        { status: 500 }
      );
    }

    if (username !== expectedUser || password !== expectedPass) {
      return NextResponse.json(
        { success: false, message: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    const token = await createAdminSessionToken();
    (await cookies()).set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
