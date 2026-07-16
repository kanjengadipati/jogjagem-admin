import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await getApi();
  const { status, data } = await api(`/guides/${id}`);
  return NextResponse.json(data, { status });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await getApi();
  const body = await req.json().catch(() => ({}));
  const { status, data } = await api(`/guides/${id}`, { method: "PUT", body: JSON.stringify(body) });
  return NextResponse.json(data, { status });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await getApi();
  const { status, data } = await api(`/guides/${id}`, { method: "DELETE" });
  return NextResponse.json(data, { status });
}
