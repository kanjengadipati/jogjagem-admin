import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; rid: string }> }
) {
  const { id, rid } = await params;
  const body = await req.json().catch(() => ({}));
  const api = await getApi();
  const { status, data } = await api(`/partners/me/${id}/reviews/${rid}/reply`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status });
}