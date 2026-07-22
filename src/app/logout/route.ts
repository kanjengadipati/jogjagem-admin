import { NextResponse, NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(COOKIE_NAME);
  return response;
}
