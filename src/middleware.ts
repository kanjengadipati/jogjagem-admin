import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, FRONTEND_URL } from "@/lib/constants";
import { decodeJwtPayload } from "@/lib/jwt";

// Routes that do NOT require authentication
const PUBLIC_PATHS = ["/login", "/logout", "/api/auth"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  // No token → redirect to login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Role-based routing
  const payload = decodeJwtPayload(token);
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const role = payload.role;

  if (role === 'sales') {
    // Sales agents get their own earnings page only — everything else in the
    // admin portal (including the admin dashboard overview) is off-limits.
    const isSalesPage =
      pathname === '/sales/me' ||
      pathname === '/sales/commissions' ||
      pathname === '/settings/account';
    const isSalesApi = pathname.startsWith('/api/sales/me');
    const profileUserId = pathname.startsWith('/api/users/')
      ? pathname.slice('/api/users/'.length)
      : '';
    const isProfileApi = profileUserId !== '' && !profileUserId.includes('/') && /^\d+$/.test(profileUserId);
    const isAuthApi = pathname.startsWith('/api/auth');

    if (isSalesPage || isSalesApi || isProfileApi || isAuthApi) {
      return NextResponse.next();
    }

    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.redirect(new URL('/sales/me', req.url));
  }

  // Business owners use the business portal on the public site, not this admin app
  if (role === 'partner' || role === 'business_owner') {
    return NextResponse.redirect(new URL(FRONTEND_URL));
  }

  // Admin/Superadmin
  return NextResponse.next();
}

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
