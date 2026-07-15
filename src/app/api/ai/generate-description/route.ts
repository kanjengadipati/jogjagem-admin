import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { destinationName, category, region, features } = body as {
    destinationName?: string;
    category?: string;
    region?: string;
    features?: string | string[];
  };

  if (!destinationName) {
    return NextResponse.json({ error: "Missing destinationName" }, { status: 400 });
  }

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);

  // Use the BE AI journey endpoint to generate destination content
  const { status, data } = await api("/ai/journey", {
    method: "POST",
    body: JSON.stringify({ destinationName }),
  });

  if (status !== 200) {
    // Fallback if BE AI is unavailable
    return NextResponse.json({
      description: `${destinationName} is a breathtaking ${category || "attraction"} located in the scenic region of ${region || "Yogyakarta"}. Known for its stunning views and cultural significance, this destination offers a unique experience for every traveler.`,
      seoKeywords: `${destinationName}, Jogja Tourism, ${category || "destination"}, ${region || "Yogyakarta"} tour`,
    });
  }

  // Transform BE journey response into description + SEO keywords
  type JourneyStep = { time: string; title: string; desc: string };
  type JourneyData = { data?: { steps?: JourneyStep[] } };
  const steps = (data as JourneyData)?.data?.steps ?? [];
  const description = steps.map((s: JourneyStep) => s.desc).join(" ") ||
    `${destinationName} is a remarkable destination in Yogyakarta offering unforgettable experiences for every traveler.`;

  const featStr = Array.isArray(features) ? features.join(", ") : (features ?? "");
  const seoKeywords = [destinationName, "Jogja Tourism", category, region, featStr]
    .filter(Boolean)
    .join(", ");

  return NextResponse.json({ description, seoKeywords });
}
