import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function GET() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);
  const { status, data } = await api("/admin/sales-commission-rate");
  return NextResponse.json(data, { status });
}

export async function PUT(req: NextRequest) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);
  const body = await req.json().catch(() => ({}));
  const { status, data } = await api("/admin/sales-commission-rate", {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status });
}
