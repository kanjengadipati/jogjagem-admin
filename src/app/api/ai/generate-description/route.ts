import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { destinationName, category, region, features } = body;

  if (!destinationName) {
    return NextResponse.json({ error: "Missing destinationName" }, { status: 400 });
  }

  const ai = getAI();

  if (!ai) {
    return NextResponse.json({
      description: `${destinationName} is a breathtaking ${category || "attraction"} located in the scenic region of ${region || "Yogyakarta"}. Known for its stunning views and cultural significance, this destination offers a unique experience for every traveler.`,
      seoKeywords: `${destinationName}, Jogja Tourism, ${category || "destination"}, ${region || "Yogyakarta"} tour`,
    });
  }

  try {
    const prompt = `You are a professional tourism content writer for Yogyakarta, Indonesia. Write a compelling editorial description for the destination "${destinationName}" with the following details:
- Category: ${category || "Tourism"}
- Region: ${region || "Yogyakarta"}
- Key Features: ${Array.isArray(features) ? features.join(", ") : features || "scenic views, cultural heritage"}

Respond strictly in JSON format:
{
  "description": "2-3 paragraph editorial description (min 200 words)",
  "seoKeywords": "comma-separated SEO keywords"
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
