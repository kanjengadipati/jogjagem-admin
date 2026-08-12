import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { destinationName, category, region } = body as {
    destinationName?: string;
    category?: string;
    region?: string;
  };

  if (!destinationName) {
    return NextResponse.json({ error: "Missing destinationName" }, { status: 400 });
  }

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);

  const { status, data } = await api("/ai/generate-destination", {
    method: "POST",
    body: JSON.stringify({ destinationName, category, region }),
  });

  if (status !== 200) {
    return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
  }

  type GenDestData = {
    data?: {
      name?: string;
      name_en?: string;
      category?: string;
      sub_region?: string;
      tagline?: string;
      tagline_en?: string;
      location?: string;
      description?: string;
      description_en?: string;
      story?: string;
      story_en?: string;
      ticket_price?: string;
      opening_hours?: string;
      best_time?: string;
      best_time_en?: string;
      latitude?: string;
      longitude?: string;
      rating?: string;
      review_count?: string;
      facilities?: string[];
      facilities_en?: string[];
      travel_tips?: string[];
      travel_tips_en?: string[];
      faqs?: { q?: string; a?: string }[];
      seo_title?: string;
      seo_title_en?: string;
      seo_description?: string;
      seo_description_en?: string;
      seo_keywords?: string;
      seo_keywords_en?: string;
    };
  };
  const d = (data as GenDestData)?.data ?? {};
  const strArr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  const faqs = Array.isArray(d.faqs)
    ? d.faqs
        .map((f) => ({ q: typeof f?.q === "string" ? f.q : "", a: typeof f?.a === "string" ? f.a : "" }))
        .filter((f) => f.q || f.a)
    : [];

  return NextResponse.json({
    name: d.name ?? "",
    name_en: d.name_en ?? "",
    category: d.category ?? "",
    sub_region: d.sub_region ?? "",
    tagline: d.tagline ?? "",
    tagline_en: d.tagline_en ?? "",
    location: d.location ?? "",
    description: d.description ?? "",
    description_en: d.description_en ?? "",
    story: d.story ?? "",
    story_en: d.story_en ?? "",
    ticket_price: d.ticket_price ?? "",
    opening_hours: d.opening_hours ?? "",
    best_time: d.best_time ?? "",
    best_time_en: d.best_time_en ?? "",
    latitude: d.latitude ?? "",
    longitude: d.longitude ?? "",
    rating: d.rating ?? "",
    review_count: d.review_count ?? "",
    facilities: strArr(d.facilities),
    facilities_en: strArr(d.facilities_en),
    travel_tips: strArr(d.travel_tips),
    travel_tips_en: strArr(d.travel_tips_en),
    faqs,
    seoTitle: d.seo_title ?? "",
    seoTitleEn: d.seo_title_en ?? "",
    seoDescription: d.seo_description ?? "",
    seoDescriptionEn: d.seo_description_en ?? "",
    seoKeywords: d.seo_keywords ?? "",
    seoKeywordsEn: d.seo_keywords_en ?? "",
  });
}
