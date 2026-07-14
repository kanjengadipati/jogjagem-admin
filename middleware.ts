import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token');
  const { pathname } = request.nextUrl;

  // Protect /api/ and dashboard routes
  if (
    (pathname.startsWith('/api/') || pathname.startsWith('/dashboard')) &&
    !token &&
    pathname !== '/api/auth/login' &&
    pathname !== '/login'
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
