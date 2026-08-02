import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/constants";
import { decodeJwtPayload } from "@/lib/jwt";

// Routes that do NOT require authentication
const PUBLIC_PATHS = ["/login", "/logout", "/api/auth"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPartnerPortal =
    pathname === "/partner" ||
    pathname.startsWith("/partner/") ||
    pathname === "/business" ||
    pathname.startsWith("/business/");

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

  if (role === 'partner' || role === 'business_owner') {
    // Allow access to business/partner portal and API
    if (
      !isPartnerPortal &&
      !req.nextUrl.pathname.startsWith('/api/businesses') &&
      !req.nextUrl.pathname.startsWith('/api/partners/me') &&
      !req.nextUrl.pathname.startsWith('/api/me') &&
      !req.nextUrl.pathname.startsWith('/api/auth')
    ) {
      return NextResponse.redirect(new URL('/business', req.url));
    }
  } else {
    // Admin/Superadmin: restrict root /partner or /business without business ID
    if (pathname === '/partner' || pathname === '/business') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
