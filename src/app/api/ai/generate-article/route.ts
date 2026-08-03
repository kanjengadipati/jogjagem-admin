import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { title } = body as { title?: string };

  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);

  const { status, data } = await api("/ai/generate-article", {
    method: "POST",
    body: JSON.stringify({ title }),
  });

  return NextResponse.json(data, { status });
}
