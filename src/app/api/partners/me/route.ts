import { NextResponse } from "next/server";
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
  const res1 = await api("/businesses/me");
  if (res1.status >= 200 && res1.status < 300) {
    return NextResponse.json(res1.data, { status: res1.status });
  }
  const res2 = await api("/partners/me");
  return NextResponse.json(res2.data, { status: res2.status });
}