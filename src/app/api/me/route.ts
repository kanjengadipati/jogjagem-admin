import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

/**
 * GET /api/me
 * Mengembalikan profil user yang sedang login (admin, superadmin, partner).
 * Proxy ke GET /auth/profile di backend — endpoint ini accessible oleh semua role.
 */
export async function GET() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);
  const { status, data } = await api("/auth/profile");
  return NextResponse.json(data, { status });
}

/**
 * PATCH /api/me
 * Update profil sendiri (name, phone_number).
 */
export async function PATCH(req: Request) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);
  const body = await req.json().catch(() => ({}));
  const { status, data } = await api("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status });
}
