import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { preference, timeOfDay } = body as {
    preference?: string;
    timeOfDay?: string;
  };

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);

  const time = timeOfDay || "morning";
  const { status, data } = await api(`/ai/recommend?time=${encodeURIComponent(time)}`);

  if (status !== 200) {
    return NextResponse.json({
      items: [
        { name: "Prambanan Temple", reason: "UNESCO heritage site with stunning Hindu architecture" },
        { name: "Keraton Yogyakarta", reason: "Living palace with deep Javanese royal traditions" },
        { name: "Mount Merapi", reason: "Active volcano with thrilling jeep tours at sunrise" },
      ],
    });
  }

  // BE returns a single recommendation; wrap it as items array for FE compatibility
  type RecommendData = { data?: { destinationId?: string; headline?: string; reason?: string } };
  const rec = (data as RecommendData)?.data;

  if (!rec) {
    return NextResponse.json({ items: [] });
  }

  // Also fetch the preference-based query from BE if provided
  if (preference) {
    const queryRes = await api("/ai/query", {
      method: "POST",
      body: JSON.stringify({ query: `Recommend top destinations for someone who likes ${preference}` }),
    });
    type QueryData = { data?: { reply?: string; matchedDestinationIds?: string[] } };
    const qData = (queryRes.data as QueryData)?.data;
    if (qData?.matchedDestinationIds?.length) {
      return NextResponse.json({
        items: qData.matchedDestinationIds.slice(0, 3).map((id: string) => ({
          name: id,
          reason: qData.reply || "Recommended for you",
        })),
      });
    }
  }

  return NextResponse.json({
    items: [{ name: rec.destinationId ?? "", reason: rec.reason ?? rec.headline ?? "" }],
  });
}

export async function GET() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);

  const { status, data } = await api("/ai/recommend?time=morning");
  if (status !== 200) {
    return NextResponse.json({ items: [] });
  }
  type RecommendData = { data?: { destinationId?: string; reason?: string; headline?: string } };
  const rec = (data as RecommendData)?.data;
  return NextResponse.json({
    items: rec ? [{ name: rec.destinationId ?? "", reason: rec.reason ?? rec.headline ?? "" }] : [],
  });
}
