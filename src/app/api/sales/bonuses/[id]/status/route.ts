import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);
  const body = await req.json().catch(() => ({}));
  const { status, data } = await api(`/admin/bonuses/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status });
}
