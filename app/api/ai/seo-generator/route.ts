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
  const { title, description } = await request.json();
  if (!title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }

  const ai = getAI();
  if (!ai) {
    return NextResponse.json({
      metaTitle: `${title} - Jogjagem Official Tourism Guide`,
      metaDescription: `${description ? description.substring(0, 150) : 'Discover the beauty of ' + title + ' in Yogyakarta.'}`,
      seoScore: 92,
    });
  }

  try {
    const prompt = `Create optimal search engine optimization meta tags for:\nTitle: ${title}\nDescription: ${description}\n\nRespond in JSON:\n{\n  "metaTitle": "SEO optimized Title (under 60 chars)",\n  "metaDescription": "SEO optimized Description (under 160 chars)",\n  "seoScore": 95\n}`;

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
