import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

/**
 * PATCH /api/me/password
 * Ubah password sendiri — proxy ke PATCH /auth/change-password di backend.
 */
export async function PATCH(req: Request) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);
  const body = await req.json().catch(() => ({}));
  const { status, data } = await api("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status });
}
