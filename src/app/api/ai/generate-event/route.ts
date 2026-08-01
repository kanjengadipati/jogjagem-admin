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

  type GenEventData = {
    data?: {
      title?: string;
      title_en?: string;
      description?: string;
      description_en?: string;
      organizer?: string;
      ticket_price?: string;
      seo_title?: string;
      seo_title_en?: string;
      seo_description?: string;
      seo_description_en?: string;
      seo_keywords?: string;
      seo_keywords_en?: string;
    };
  };

  const d = (data as GenEventData)?.data ?? {};

  return NextResponse.json({
    title: d.title ?? "",
    title_en: d.title_en ?? "",
    description: d.description ?? "",
    description_en: d.description_en ?? "",
    organizer: d.organizer ?? "",
    ticket_price: d.ticket_price ?? "",
    seo_title: d.seo_title ?? "",
    seo_title_en: d.seo_title_en ?? "",
    seo_description: d.seo_description ?? "",
    seo_description_en: d.seo_description_en ?? "",
    seo_keywords: d.seo_keywords ?? "",
    seo_keywords_en: d.seo_keywords_en ?? "",
  });
}
