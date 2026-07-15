import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

const FALLBACK: Record<string, { name: string; reason: string }[]> = {
  cultural: [
    { name: "Prambanan Temple", reason: "UNESCO heritage site with stunning Hindu architecture" },
    { name: "Keraton Yogyakarta", reason: "Living palace with deep Javanese royal traditions" },
    { name: "Borobudur", reason: "World's largest Buddhist temple with panoramic views" },
  ],
  nature: [
    { name: "Gunung Merapi", reason: "Active volcano with thrilling jeep tours at sunrise" },
    { name: "Timang Beach", reason: "Remote clifftop beach with traditional gondola crossing" },
    { name: "Kalibiru", reason: "Elevated forest photo spot overlooking Sermo Reservoir" },
  ],
  culinary: [
    { name: "Malioboro Street", reason: "Iconic strip with traditional gudeg and street food" },
    { name: "Pasar Beringharjo", reason: "Historic market with authentic Jogja street snacks" },
    { name: "Via Via Café", reason: "Popular multi-cultural dining in Prawirotaman district" },
  ],
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { preference, persona, weather, timeOfDay } = body;

  const ai = getAI();

  const profileKey = preference || "cultural";

  if (!ai) {
    const items = FALLBACK[profileKey] ?? FALLBACK.cultural;
    return NextResponse.json({ items });
  }

  try {
    const prompt = `You are the expert tourism advisor for Yogyakarta. Recommend exactly 3 verified destinations for a traveler with the following profile:
- Preference: ${profileKey}
- Persona: ${persona || "General Tourist"}
- Weather: ${weather || "Sunny"}
- Time of Day: ${timeOfDay || "Morning"}

Respond strictly in JSON format:
{
  "items": [
    { "name": "Destination Name", "reason": "Short compelling reason (1 sentence)" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const result = JSON.parse(response.text || "{}");
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Also support the original simulate-recommendation endpoint shape
export async function GET() {
  return NextResponse.json({ items: FALLBACK.cultural });
}
