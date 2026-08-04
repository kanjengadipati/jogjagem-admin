import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const { status, data } = await api(`/businesses/check-name?q=${encodeURIComponent(q)}`);
  return NextResponse.json(data, { status });
}
