import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token');
  const { pathname } = request.nextUrl;

  // Protect protected routes
  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/users') || 
    pathname.startsWith('/roles') || 
    pathname.startsWith('/destinations') ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/hotels') ||
    pathname.startsWith('/restaurants') ||
    pathname.startsWith('/partners') ||
    pathname.startsWith('/guides') ||
    pathname.startsWith('/souvenirs') ||
    pathname.startsWith('/rentals') ||
    pathname.startsWith('/reviews') ||
    pathname.startsWith('/stories') ||
    pathname.startsWith('/ai-recommendations') ||
    pathname.startsWith('/promotions') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings');

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
