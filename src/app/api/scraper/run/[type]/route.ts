import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const api = await getApi();
  const path = type === "all" ? "/admin/scrape" : `/admin/scrape/${type}`;
  const { status, data } = await api(path, { method: "POST" });
  return NextResponse.json(data, { status });
}
