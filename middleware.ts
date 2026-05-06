// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 🛡️ 1. MANTENEMOS TUS CABECERAS DE SEGURIDAD EXTREMA
  const response = NextResponse.next();
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN'); // Evita que clonen tu web en iframes invisibles
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // 🛑 2. GUARDIA DEL SERVIDOR DESACTIVADO
  // Hemos quitado la verificación de cookies. 
  // Ahora la seguridad la manejará exclusivamente tu componente 'centinela.tsx' usando el localStorage.

  // Dejamos que la petición pase con los escudos activados
  return response;
}

// 🎯 3. OPTIMIZACIÓN
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};