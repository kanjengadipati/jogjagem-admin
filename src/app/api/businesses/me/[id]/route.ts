import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const api = await getApi();
  const { status, data } = await api(`/businesses/me/${id}`);
  return NextResponse.json(data, { status });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const api = await getApi();
  
  // Try updating business via /businesses/me/:id first
  const res1 = await api(`/businesses/me/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (res1.status >= 200 && res1.status < 300) {
    return NextResponse.json(res1.data, { status: res1.status });
  }

  // Fallback to legacy /partners/me/:id endpoint if businesses endpoint fails or ID is a partner ID
  const res2 = await api(`/partners/me/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return NextResponse.json(res2.data, { status: res2.status });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const api = await getApi();
  const { status, data } = await api(`/businesses/me/${id}`, { method: "DELETE" });
  return NextResponse.json(data, { status });
}
