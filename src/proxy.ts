import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { ROLES } from '@/lib/constants/roles';

// Rutas protegidas y los roles autorizados para cada una
const protectedRoutesConfig: { path: string; rolesAllowed?: string[] }[] = [
  { path: '/dashboard', rolesAllowed: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.SOCIAL_WORKER] },
  { path: '/modules/dashboard', rolesAllowed: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.SOCIAL_WORKER] },
  { path: '/modules/relevamientos', rolesAllowed: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.SOCIAL_WORKER] },
  { path: '/modules/adultos-mayores', rolesAllowed: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.SOCIAL_WORKER] },
  { path: '/modules/estadisticas', rolesAllowed: [ROLES.ADMIN, ROLES.SUPERVISOR] },
  { path: '/modules/auditoria', rolesAllowed: [ROLES.ADMIN] },
];

/**
 * Proxy global de Next.js 16 (anteriormente middleware) para protección de rutas y control de sesión JWT.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Validar si la ruta solicitada requiere protección
  const matchedRoute = protectedRoutesConfig.find(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`)
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  // 2. Intentar recuperar la cookie de sesión
  const sessionToken = request.cookies.get('session')?.value;

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Verificar y decodificar el token JWT usando jose
  let session = null;
  try {
    session = await verifyJWT(sessionToken);
  } catch (e) {
    console.error('[PROXY] verifyJWT lanzó excepción:', e);
  }

  if (!session) {
    // Si la sesión no es válida, redirigir a login y borrar cookie corrupta/expirada
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session');
    return response;
  }

  // 4. Validar el rol del usuario
  if (matchedRoute.rolesAllowed && !matchedRoute.rolesAllowed.includes(session.role)) {
    const unauthorizedUrl = new URL('/unauthorized', request.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
}

/**
 * Configuración del matcher del proxy.
 * Intercepta todas las rutas bajo /dashboard y los módulos dinámicos.
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/modules/:path*',
  ],
};
