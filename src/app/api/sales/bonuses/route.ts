import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);
  const params = req.nextUrl.searchParams;
  const { status, data } = await api(
    `/bonuses?page=${params.get("page") ?? "1"}&limit=${params.get("limit") ?? "100"}`
  );
  return NextResponse.json(data, { status });
}
