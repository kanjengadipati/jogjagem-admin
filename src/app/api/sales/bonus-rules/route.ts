import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function GET() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);
  const { status, data } = await api("/admin/bonus-rules");
  return NextResponse.json(data, { status });
}

export async function POST(req: NextRequest) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);
  const body = await req.json().catch(() => ({}));
  const { status, data } = await api("/admin/bonus-rules", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status });
}
