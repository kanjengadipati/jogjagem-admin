import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

export async function GET() {
  const api = await getApi();
  const { status, data } = await api("/auth/admin/users");
  // 401 means the token is expired or invalidated — clear the cookie so the
  // middleware redirects to login on the next request.
  if (status === 401) {
    const res = NextResponse.json(data, { status });
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
  return NextResponse.json(data, { status });
}

export async function POST(req: NextRequest) {
  const api = await getApi();
  const body = await req.json().catch(() => ({}));
  const { status, data } = await api("/auth/admin/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status });
}
