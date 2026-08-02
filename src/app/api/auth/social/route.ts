import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, BACKEND_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { provider, token } = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/auth/social-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, token }),
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok || !data?.data?.access_token) {
      return NextResponse.json(
        { status: 'error', message: data?.message || 'Social login failed' },
        { status: backendRes.status || 401 },
      );
    }

    // Decode JWT to determine role and redirect URL
    let role: string | undefined;
    try {
      const payload = JSON.parse(
        Buffer.from(data.data.access_token.split(".")[1], "base64url").toString("utf-8")
      );
      role = payload?.role;
    } catch {
      return NextResponse.json({ status: 'error', message: "Invalid token" }, { status: 500 });
    }

    // Allow admins, superadmins, partners, and regular users accessing the portal to check business status
    const redirectUrl = (role === "admin" || role === "superadmin") ? "/dashboard" : "/business";

    const response = NextResponse.json({ status: 'success', redirectUrl });

    const domain = process.env.NODE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_COOKIE_DOMAIN || ".jogjagem.com")
      : undefined;

    // Set cookie
    response.cookies.set(COOKIE_NAME, data.data.access_token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
      domain,
    });

    return response;
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Network error' },
      { status: 500 },
    );
  }
}
