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
  const { persona, weather, timeOfDay } = await request.json();

  const ai = getAI();
  if (!ai) {
    return NextResponse.json({
      recommendations: [
        { name: 'Prambanan Temple', match: '98%', reason: 'Spectacular backdrop under current golden hour weather.' },
        { name: 'Malioboro Street', match: '92%', reason: 'Bustling night market culinary trails suited for active explorers.' },
        { name: 'Ratu Boko Palace', match: '89%', reason: 'Breathtaking sunset viewpoints matching cozy cultural interests.' },
      ],
    });
  }

  try {
    const prompt = `Simulate an AI-driven tourism recommendation list for:\nUser Persona: ${persona || 'Family Traveler'}\nWeather conditions: ${weather || 'Sunny'}\nTime of Day: ${timeOfDay || 'Evening'}\n\nProvide 3 high-probability matches from Yogyakarta's famous destinations.\nRespond in JSON:\n{\n  "recommendations": [\n    { "name": "Destination Name", "match": "95%", "reason": "Short contextual justification" }\n  ]\n}`;

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
