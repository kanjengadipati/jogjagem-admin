import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ tab: string; action: string }> }) {
  const { tab, action } = await params;
  const api = await getApi();
  const body = await req.json().catch(() => ({}));
  const { status, data } = await api(`/admin/staging/${tab}/${action}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status });
}
