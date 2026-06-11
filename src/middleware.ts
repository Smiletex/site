import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifyAdminSessionToken } from '@/lib/admin/session';

/**
 * Gate UNIQUE de l'espace admin (pages + API), basé sur la session signée.
 * Seules les routes de connexion restent publiques.
 */
const PUBLIC_PATHS = ['/admin/login', '/api/admin/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminArea =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (!isAdminArea) return NextResponse.next();

  // Routes de connexion : toujours accessibles.
  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (await verifyAdminSessionToken(token)) {
    return NextResponse.next();
  }

  // Non authentifié : 401 pour les API, redirection vers le login pour les pages.
  const isApi = pathname.startsWith('/api/') || pathname.includes('/api/');
  if (isApi) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  // Couvre les pages /admin/*, les API /api/admin/* et /admin/**/api/*.
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
