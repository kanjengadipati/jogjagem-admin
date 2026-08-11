import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const source = req.nextUrl.searchParams.get("source") ?? "";
  const api = await getApi();
  const qs = source ? `?source=${encodeURIComponent(source)}` : "";
  const path = type === "all" ? `/admin/scrape${qs}` : `/admin/scrape/${type}${qs}`;
  const { status, data } = await api(path, { method: "POST" });
  return NextResponse.json(data, { status });
}
