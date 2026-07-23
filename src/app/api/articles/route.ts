import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

export async function GET(req: NextRequest) {
  const api = await getApi();
  const status = req.nextUrl.searchParams.get("status") ?? "";
  const query = status ? `?status=${status}` : "";
  const { status: httpStatus, data } = await api(`/articles${query}`);
  return NextResponse.json(data, { status: httpStatus });
}

export async function POST(req: NextRequest) {
  const api = await getApi();
  const body = await req.json().catch(() => ({}));
  const { status, data } = await api("/articles", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status });
}
