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
  const { preference } = await request.json();

  const ai = getAI();
  if (!ai) {
    return NextResponse.json({
      items: [
        { name: 'Sari Temple Historic Complex', reason: `Excellent Buddhist monument suited for ${preference} track.` },
        { name: 'Kalasan Heritage Site', reason: 'Quiet, historic gem suited for quiet study and local insights.' },
      ],
    });
  }

  try {
    const prompt = `Generate 2 tourism recommendations for:\nTrack: ${preference}\n\nRespond in JSON:\n{\n  "items": [\n    { "name": "Destination Name", "reason": "Short reason" }\n  ]\n}`;

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
