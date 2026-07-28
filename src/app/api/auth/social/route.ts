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

    if (role !== "admin" && role !== "superadmin" && role !== "partner") {
      return NextResponse.json(
        { status: 'error', message: "Access denied." },
        { status: 403 }
      );
    }

    const redirectUrl = role === "partner" ? "/partner" : "/dashboard";

    const response = NextResponse.json({ status: 'success', redirectUrl });

    // Set cookie
    response.cookies.set(COOKIE_NAME, data.data.access_token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Network error' },
      { status: 500 },
    );
  }
}
