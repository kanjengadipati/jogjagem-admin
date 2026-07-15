import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

function getAI() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
}

export async function POST(request: Request) {
  const { destinationName, category, region, features } = await request.json();
  if (!destinationName) {
    return NextResponse.json({ error: 'Missing destinationName' }, { status: 400 });
  }

  const ai = getAI();
  if (!ai) {
    return NextResponse.json({
      description: `${destinationName} is a breathtaking ${category || 'attraction'} located in the scenic region of ${region || 'Yogyakarta'}.`,
      seoKeywords: `${destinationName}, Jogja Tourism, ${category}, ${region} tour`,
    });
  }

  try {
    const prompt = `Generate a premium, Apple-style marketing description (100 words) for a tourism destination.\nName: ${destinationName}\nCategory: ${category}\nRegion: ${region}\nFeatures: ${features}\n\nRespond in JSON:\n{\n  "description": "text",\n  "seoKeywords": "comma, separated, keywords"\n}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    return NextResponse.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
