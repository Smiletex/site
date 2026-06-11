import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from '@/lib/admin/session';

/** Déconnexion admin : efface le cookie de session. */
export async function POST() {
  (await cookies()).set(ADMIN_COOKIE, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return NextResponse.json({ success: true });
}
