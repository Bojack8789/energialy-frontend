// middleware.ts — NUEVO
// Protege la ruta /administrador: solo usuarios con rol admin o superAdmin pueden acceder.
// Este archivo va en la RAÍZ de /client (mismo nivel que next.config.js).
//
// Cómo funciona:
// - Next.js ejecuta este middleware en el edge ANTES de renderizar cualquier página.
// - Lee el accessToken de las cookies (no de sessionStorage, que no existe en el servidor).
// - Decodifica el JWT sin verificar la firma (la verificación real ocurre en el backend).
// - Si el rol no es admin/superAdmin → redirige a /login con un mensaje de error.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Roles que pueden acceder al panel de administración
const ADMIN_ROLES = ['admin', 'superAdmin'];

// Decodifica el payload de un JWT sin verificar la firma
// (seguro para uso en el middleware del cliente — la verificación real está en el backend)
function decodeJwtPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo aplica a rutas que empiezan con /administrador
  if (!pathname.startsWith('/administrador')) {
    return NextResponse.next();
  }

  // Leer el token desde la cookie 'accessToken'
  // (Login.jsx debe guardar también en cookie — ver Login.jsx actualizado)
  const token = request.cookies.get('accessToken')?.value;

  // Sin token → redirigir a login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('unauthorized', '1');
    return NextResponse.redirect(loginUrl);
  }

  // Decodificar y verificar rol
  const payload = decodeJwtPayload(token);

  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('unauthorized', '1');
    return NextResponse.redirect(loginUrl);
  }

  // Verificar expiración del token
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('expired', '1');
    return NextResponse.redirect(loginUrl);
  }

  // Verificar rol
  if (!payload.role || !ADMIN_ROLES.includes(payload.role)) {
    // Usuario autenticado pero sin permisos → redirigir al dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ✅ Todo OK — dejar pasar
  return NextResponse.next();
}

// Configurar qué rutas activan este middleware
export const config = {
  matcher: ['/administrador', '/administrador/:path*'],
};
