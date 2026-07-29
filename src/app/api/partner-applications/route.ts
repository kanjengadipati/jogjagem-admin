import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function GET() {
  const store = await cookies();
  const api = fetchWithAuth(store.get(COOKIE_NAME)?.value ?? "");
  const { status, data } = await api("/admin/partner-applications/pending");
  return NextResponse.json(data, { status });
}
