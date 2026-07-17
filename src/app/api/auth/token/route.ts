import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/constants";

/**
 * GET /api/auth/token?token=<jwt>
 * Sets the admin session cookie from a token passed as a query param
 * (used when redirected from the main portal after login).
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token || token.length <= 10) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
