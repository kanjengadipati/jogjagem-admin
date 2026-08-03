import type { Destination } from "@/types";
import { parseImages } from "@/lib/images";

export interface ContentScoreItem {
  label: string;
  points: number;
  max: number;
  detail?: string;
}

export interface ContentScoreCategory {
  key: string;
  label: string;
  score: number;
  max: number;
  items: ContentScoreItem[];
}

export type ContentVerdict = "EXCELLENT" | "GOOD" | "NEEDS WORK";

export interface ContentScoreResult {
  total: number;
  max: number;
  verdict: ContentVerdict;
  categories: ContentScoreCategory[];
}

const hasText = (v: unknown): boolean =>
  typeof v === "string" && v.trim().length > 0;

const longEnough = (v: unknown, min: number): boolean =>
  typeof v === "string" && v.trim().length >= min;

const parseArr = (v: unknown): unknown[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const validCoord = (v: unknown): boolean => {
  if (v === undefined || v === null || v === "") return false;
  const n = Number(v);
  return Number.isFinite(n);
};

function finish(key: string, label: string, max: number, items: ContentScoreItem[]): ContentScoreCategory {
  const score = items.reduce((sum, it) => sum + it.points, 0);
  return { key, label, score, max, items };
}

/**
 * Deterministic content-quality rubric for a destination listing.
 * Scores how well the *page* is filled out (not the real-world quality of
 * the destination, which is what `rating` measures). Max = 100.
 */
export function computeContentScore(dest: Destination | null | undefined): ContentScoreResult {
  const d: Partial<Destination> = dest ?? {};
  const images = parseImages(d.images);
  const faqs = parseArr(d.faqs);
  const tips = parseArr(d.travel_tips);
  const facs = parseArr(d.facilities);
  const weather = d.weather && typeof d.weather === "object" && !Array.isArray(d.weather)
    ? (d.weather as Record<string, unknown>)
    : null;

  const categories: ContentScoreCategory[] = [];

  // Identity (10)
  {
    const items: ContentScoreItem[] = [
      { label: "Name", max: 2, points: hasText(d.name) ? 2 : 0 },
      { label: "Tagline", max: 2, points: hasText(d.tagline) ? 2 : 0 },
      { label: "Category", max: 2, points: hasText(d.category) ? 2 : 0 },
      { label: "Location", max: 2, points: hasText(d.location) ? 2 : 0 },
      { label: "Sub-region", max: 1, points: hasText(d.sub_region) ? 1 : 0 },
      { label: "Coordinates", max: 1, points: validCoord(d.latitude) && validCoord(d.longitude) ? 1 : 0 },
    ];
    categories.push(finish("identity", "Identity", 10, items));
  }

  // Description & story (25)
  {
    const items: ContentScoreItem[] = [
      { label: "Description (≥200 chars)", max: 6, points: longEnough(d.description, 200) ? 6 : 0 },
      { label: "Description EN (≥200 chars)", max: 6, points: longEnough(d.description_en, 200) ? 6 : 0 },
      { label: "Story (≥300 chars)", max: 7, points: longEnough(d.story, 300) ? 7 : 0 },
      { label: "Story EN (≥300 chars)", max: 6, points: longEnough(d.story_en, 300) ? 6 : 0 },
    ];
    categories.push(finish("content", "Content", 25, items));
  }

  // Practical info (15)
  {
    const items: ContentScoreItem[] = [
      { label: "Ticket price", max: 4, points: hasText(d.ticket_price) ? 4 : 0 },
      { label: "Opening hours", max: 4, points: hasText(d.opening_hours) ? 4 : 0 },
      { label: "Best time (ID)", max: 4, points: hasText(d.best_time) ? 4 : 0 },
      { label: "Best time (EN)", max: 3, points: hasText(d.best_time_en) ? 3 : 0 },
    ];
    categories.push(finish("practical", "Practical Info", 15, items));
  }

  // Media (20)
  {
    const imagePoints = images.length >= 3 ? 10 : images.length >= 1 ? 5 : 0;
    const items: ContentScoreItem[] = [
      { label: "Gallery (≥3 images)", max: 10, points: imagePoints, detail: `${images.length} image${images.length === 1 ? "" : "s"}` },
      { label: "OG image", max: 5, points: hasText(d.og_image_url) ? 5 : 0 },
      { label: "Video", max: 5, points: hasText(d.video_url) ? 5 : 0 },
    ];
    categories.push(finish("media", "Media", 20, items));
  }

  // SEO (15)
  {
    const items: ContentScoreItem[] = [
      { label: "SEO title", max: 3, points: hasText(d.seo_title) ? 3 : 0 },
      { label: "SEO description", max: 3, points: hasText(d.seo_description) ? 3 : 0 },
      { label: "SEO keywords", max: 3, points: hasText(d.seo_keywords) ? 3 : 0 },
      { label: "SEO title EN", max: 2, points: hasText(d.seo_title_en) ? 2 : 0 },
      { label: "SEO description EN", max: 2, points: hasText(d.seo_description_en) ? 2 : 0 },
      { label: "SEO keywords EN", max: 2, points: hasText(d.seo_keywords_en) ? 2 : 0 },
    ];
    categories.push(finish("seo", "SEO", 15, items));
  }

  // Rich content (15)
  {
    const items: ContentScoreItem[] = [
      { label: "FAQs (≥3)", max: 5, points: faqs.length >= 3 ? 5 : 0, detail: `${faqs.length} item${faqs.length === 1 ? "" : "s"}` },
      { label: "Travel tips (≥3)", max: 5, points: tips.length >= 3 ? 5 : 0, detail: `${tips.length} item${tips.length === 1 ? "" : "s"}` },
      { label: "Facilities (≥3)", max: 3, points: facs.length >= 3 ? 3 : 0, detail: `${facs.length} item${facs.length === 1 ? "" : "s"}` },
      { label: "Weather", max: 2, points: weather && hasText(weather.temp) && hasText(weather.condition) ? 2 : 0 },
    ];
    categories.push(finish("rich", "Rich Content", 15, items));
  }

  const total = categories.reduce((sum, c) => sum + c.score, 0);
  const max = categories.reduce((sum, c) => sum + c.max, 0);
  const verdict: ContentVerdict = total >= 80 ? "EXCELLENT" : total >= 60 ? "GOOD" : "NEEDS WORK";

  return { total, max, verdict, categories };
}
