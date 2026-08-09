import { NextResponse, NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  const domain = process.env.NODE_ENV === "production"
    ? (process.env.NEXT_PUBLIC_COOKIE_DOMAIN || ".jogjagem.com")
    : undefined;
  if (domain) {
    response.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      domain,
    });
  } else {
    response.cookies.delete(COOKIE_NAME);
  }
  return response;
}
