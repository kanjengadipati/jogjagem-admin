import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, BACKEND_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    const beRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, device_name: "explore-jogja-admin" }),
    });

    const data = await beRes.json().catch(() => ({}));

    if (!beRes.ok || !data?.data?.access_token) {
      return NextResponse.json(
        { error: data?.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify the user has an admin or superadmin role by decoding the JWT payload
    let role: string | undefined;
    try {
      const payload = JSON.parse(
        Buffer.from(data.data.access_token.split(".")[1], "base64url").toString("utf-8")
      );
      role = payload?.role;
    } catch {
      return NextResponse.json({ error: "Invalid token received from server" }, { status: 500 });
    }

    if (role !== "admin" && role !== "superadmin" && role !== "partner" && role !== "sales") {
      return NextResponse.json(
        { error: "Access denied. Valid privileges required." },
        { status: 403 }
      );
    }

    // Redirect or indicate dashboard/listings based on role
    const redirectUrl =
      role === "partner" ? "/business" :
      role === "sales"   ? "/sales/me" :
                           "/dashboard";
    const response = NextResponse.json({ ok: true, redirectUrl });
    const domain = process.env.NODE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_COOKIE_DOMAIN || ".jogjagem.com")
      : undefined;
    response.cookies.set(COOKIE_NAME, data.data.access_token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
      domain,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Network error. Is the backend running?" }, { status: 502 });
  }
}
