import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { title, category, language = "id" } = body as {
    title?: string;
    category?: string;
    language?: string;
  };

  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);

  // Use BE AI endpoint to generate content based on title
  const { status, data } = await api("/ai/journey", {
    method: "POST",
    body: JSON.stringify({ destinationName: title }),
  });

  const langLabel = language === "en" ? "English" : "Indonesian";
  const catLabel = category ?? "travel";

  if (status !== 200) {
    // Fallback content when BE AI is unavailable
    const fallbackContent = language === "en"
      ? `<h2>Introduction</h2>\n<p>${title} is one of the best ${catLabel} experiences Yogyakarta has to offer. Whether you are a first-time visitor or a seasoned traveler, this guide will help you make the most of your time.</p>\n<h2>What to Expect</h2>\n<p>Yogyakarta is rich in culture, history, and natural beauty. ${title} combines all of these elements into a single, unforgettable experience.</p>\n<h2>Tips</h2>\n<ul>\n<li>Plan ahead and book tickets in advance during peak season</li>\n<li>Bring comfortable shoes and sunscreen</li>\n<li>Use the Jogjagem app to build your full itinerary</li>\n</ul>`
      : `<h2>Pendahuluan</h2>\n<p>${title} adalah salah satu pengalaman ${catLabel} terbaik yang ditawarkan Yogyakarta. Baik kamu pertama kali berkunjung atau sudah sering, panduan ini akan membantu kamu memaksimalkan waktu di Jogja.</p>\n<h2>Apa yang Bisa Kamu Harapkan</h2>\n<p>Yogyakarta kaya akan budaya, sejarah, dan keindahan alam. ${title} memadukan semua elemen ini menjadi satu pengalaman yang tak terlupakan.</p>\n<h2>Tips</h2>\n<ul>\n<li>Rencanakan lebih awal dan pesan tiket jauh-jauh hari saat musim liburan</li>\n<li>Bawa sepatu nyaman dan tabir surya</li>\n<li>Gunakan aplikasi Jogjagem untuk merencanakan itinerary lengkapmu</li>\n</ul>`;

    const fallbackExcerpt = language === "en"
      ? `Discover everything you need to know about ${title} in Yogyakarta. Your complete guide to one of Jogja's best ${catLabel} experiences.`
      : `Temukan semua yang perlu kamu ketahui tentang ${title} di Yogyakarta. Panduan lengkap untuk salah satu pengalaman ${catLabel} terbaik di Jogja.`;

    return NextResponse.json({
      content: fallbackContent,
      excerpt: fallbackExcerpt,
      seoDescription: fallbackExcerpt,
      seoKeywords: language === "en"
        ? `${title}, Yogyakarta tourism, Jogja ${catLabel}, travel guide Yogyakarta`
        : `${title}, wisata Yogyakarta, ${catLabel} jogja, panduan wisata Yogyakarta`,
    });
  }

  // Transform BE response into article content
  type JourneyStep = { time: string; title: string; desc: string };
  type JourneyData = { data?: { steps?: JourneyStep[] } };
  const steps = (data as JourneyData)?.data?.steps ?? [];

  let generatedContent = "";
  if (steps.length > 0) {
    const intro = language === "en"
      ? `<h2>Introduction</h2>\n<p>Yogyakarta is a city of extraordinary depth. ${title} is one of the experiences that makes this city truly special. Here is everything you need to know.</p>\n`
      : `<h2>Pendahuluan</h2>\n<p>Yogyakarta adalah kota yang luar biasa. ${title} adalah salah satu pengalaman yang membuat kota ini begitu istimewa. Berikut semua yang perlu kamu ketahui.</p>\n`;

    const stepsHtml = steps.map((s: JourneyStep) =>
      `<h2>${s.title}</h2>\n<p>${s.desc}</p>`
    ).join("\n\n");

    const tips = language === "en"
      ? `\n\n<h2>Tips</h2>\n<ul>\n<li>Visit early morning to avoid crowds</li>\n<li>Use the Jogjagem app to plan your full itinerary</li>\n<li>Bring cash for smaller vendors and street food</li>\n</ul>`
      : `\n\n<h2>Tips</h2>\n<ul>\n<li>Kunjungi di pagi hari untuk menghindari keramaian</li>\n<li>Gunakan aplikasi Jogjagem untuk merencanakan itinerary lengkap</li>\n<li>Bawa uang tunai untuk pedagang kaki lima dan kuliner jalanan</li>\n</ul>`;

    generatedContent = intro + stepsHtml + tips;
  } else {
    generatedContent = language === "en"
      ? `<h2>About ${title}</h2>\n<p>A remarkable ${catLabel} experience in the heart of Yogyakarta. Plan your visit and discover what makes this destination truly special.</p>`
      : `<h2>Tentang ${title}</h2>\n<p>Pengalaman ${catLabel} yang luar biasa di jantung Yogyakarta. Rencanakan kunjunganmu dan temukan apa yang membuat destinasi ini begitu istimewa.</p>`;
  }

  const excerpt = language === "en"
    ? `Discover ${title} — one of the best ${catLabel} experiences Yogyakarta has to offer. Your complete ${langLabel} guide.`
    : `Temukan ${title} — salah satu pengalaman ${catLabel} terbaik di Yogyakarta. Panduan lengkap dalam ${langLabel}.`;

  return NextResponse.json({
    content: generatedContent,
    excerpt,
    seoDescription: excerpt,
    seoKeywords: language === "en"
      ? `${title}, Yogyakarta ${catLabel}, visit Yogyakarta, Jogja travel guide`
      : `${title}, ${catLabel} Yogyakarta, wisata jogja, panduan wisata Yogyakarta`,
  });
}
