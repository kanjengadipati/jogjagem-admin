import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await cookies();
  const api = fetchWithAuth(store.get(COOKIE_NAME)?.value ?? "");
  const { status, data } = await api(`/admin/partner-applications/${id}/approve`, { method: "POST" });
  return NextResponse.json(data, { status });
}
