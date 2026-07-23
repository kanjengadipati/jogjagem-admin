import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

type JourneyStep = { time: string; title: string; desc: string };
type JourneyData = { data?: { steps?: JourneyStep[] } };

function buildContent(title: string, catLabel: string, steps: JourneyStep[], lang: "id" | "en") {
  if (steps.length > 0) {
    const intro = lang === "en"
      ? `<h2>Introduction</h2>\n<p>Yogyakarta is a city of extraordinary depth. ${title} is one of the experiences that makes this city truly special. Here is everything you need to know.</p>`
      : `<h2>Pendahuluan</h2>\n<p>Yogyakarta adalah kota yang luar biasa. ${title} adalah salah satu pengalaman yang membuat kota ini begitu istimewa. Berikut semua yang perlu kamu ketahui.</p>`;

    const stepsHtml = steps.map((s) => `<h2>${s.title}</h2>\n<p>${s.desc}</p>`).join("\n\n");

    const tips = lang === "en"
      ? `<h2>Tips</h2>\n<ul>\n<li>Visit early morning to avoid crowds</li>\n<li>Use the Jogjagem app to plan your full itinerary</li>\n<li>Bring cash for smaller vendors and street food</li>\n</ul>`
      : `<h2>Tips</h2>\n<ul>\n<li>Kunjungi di pagi hari untuk menghindari keramaian</li>\n<li>Gunakan aplikasi Jogjagem untuk merencanakan itinerary lengkap</li>\n<li>Bawa uang tunai untuk pedagang kaki lima dan kuliner jalanan</li>\n</ul>`;

    return `${intro}\n\n${stepsHtml}\n\n${tips}`;
  }

  return lang === "en"
    ? `<h2>About ${title}</h2>\n<p>A remarkable ${catLabel} experience in the heart of Yogyakarta. Plan your visit and discover what makes this destination truly special.</p>\n<h2>What to Expect</h2>\n<p>Yogyakarta is rich in culture, history, and natural beauty. ${title} combines all of these elements into a single, unforgettable experience.</p>\n<h2>Tips</h2>\n<ul>\n<li>Plan ahead and book tickets in advance during peak season</li>\n<li>Bring comfortable shoes and sunscreen</li>\n<li>Use the Jogjagem app to build your full itinerary</li>\n</ul>`
    : `<h2>Tentang ${title}</h2>\n<p>Pengalaman ${catLabel} yang luar biasa di jantung Yogyakarta. Rencanakan kunjunganmu dan temukan apa yang membuat destinasi ini begitu istimewa.</p>\n<h2>Apa yang Bisa Kamu Harapkan</h2>\n<p>Yogyakarta kaya akan budaya, sejarah, dan keindahan alam. ${title} memadukan semua elemen ini menjadi satu pengalaman yang tak terlupakan.</p>\n<h2>Tips</h2>\n<ul>\n<li>Rencanakan lebih awal dan pesan tiket jauh-jauh hari saat musim liburan</li>\n<li>Bawa sepatu nyaman dan tabir surya</li>\n<li>Gunakan aplikasi Jogjagem untuk merencanakan itinerary lengkapmu</li>\n</ul>`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { title, category } = body as { title?: string; category?: string };

  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const catLabel = category ?? "travel";

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const api = fetchWithAuth(token);

  const { status, data } = await api("/ai/journey", {
    method: "POST",
    body: JSON.stringify({ destinationName: title }),
  });

  const steps: JourneyStep[] = status === 200
    ? (data as JourneyData)?.data?.steps ?? []
    : [];

  const contentId = buildContent(title, catLabel, steps, "id");
  const contentEn = buildContent(title, catLabel, steps, "en");

  const excerptId = `Temukan semua yang perlu kamu ketahui tentang ${title} di Yogyakarta. Panduan lengkap untuk salah satu pengalaman ${catLabel} terbaik di Jogja.`;
  const excerptEn = `Discover everything you need to know about ${title} in Yogyakarta. Your complete guide to one of Jogja's best ${catLabel} experiences.`;

  const seoTitleId = `${title} — Panduan Lengkap | Jogjagem`;
  const seoTitleEn = `${title} — Complete Guide | Jogjagem`;
  const seoKeywordsId = `${title}, wisata Yogyakarta, ${catLabel} jogja, panduan wisata Yogyakarta`;
  const seoKeywordsEn = `${title}, Yogyakarta tourism, Jogja ${catLabel}, travel guide Yogyakarta`;

  return NextResponse.json({
    // Indonesian
    content: contentId,
    excerpt: excerptId,
    seoTitle: seoTitleId,
    seoDescription: excerptId,
    seoKeywords: seoKeywordsId,
    // English
    contentEn,
    excerptEn,
    seoTitleEn,
    seoDescriptionEn: excerptEn,
    seoKeywordsEn,
  });
}
