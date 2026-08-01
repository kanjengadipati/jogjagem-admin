import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { eventTitle, category, location } = body as {
    eventTitle?: string;
    category?: string;
    location?: string;
  };

  if (!eventTitle) {
    return NextResponse.json({ error: "Missing eventTitle" }, { status: 400 });
  }

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);

  const { status, data } = await api("/ai/generate-event", {
    method: "POST",
    body: JSON.stringify({ eventTitle, category, location }),
  });

  if (status !== 200) {
    return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
  }

  return NextResponse.json(data);
}
