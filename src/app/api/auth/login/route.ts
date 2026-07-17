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

    // Verify the user has an admin or superadmin role
    const role = data?.data?.role;
    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, data.data.access_token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Network error. Is the backend running?" }, { status: 502 });
  }
}
