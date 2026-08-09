import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function GET() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);
  const { status, data } = await api("/auth/profile");
  return NextResponse.json(data, { status });
}

export async function PATCH(request: Request) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);
  const body = await request.json();
  const { status, data } = await api("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status });
}
