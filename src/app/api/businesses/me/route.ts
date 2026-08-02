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
  const res = await api("/businesses/me");
  return NextResponse.json(res.data, { status: res.status });
}
