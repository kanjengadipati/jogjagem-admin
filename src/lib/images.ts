import type { Destination } from "@/types";

export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=400&q=80";

/**
 * The backend returns images as an array of { url, credit } objects.
 * This helper normalises any shape (object array, string array, JSON string)
 * into a plain string[] of URLs, filtering out empty values.
 */
export function parseImages(raw: Destination["images"]): string[] {
  let arr: unknown[] = [];

  if (!raw) return [];

  if (typeof raw === "string") {
    try { arr = JSON.parse(raw); } catch { return []; }
  } else if (Array.isArray(raw)) {
    arr = raw;
  }

  return arr
    .map((item) => {
      if (!item) return "";
      // { url, credit } shape from the backend
      if (typeof item === "object" && "url" in item) {
        return (item as { url: string }).url ?? "";
      }
      // plain string shape
      if (typeof item === "string") return item;
      return "";
    })
    .filter((url) => url.trim() !== "");
}

/** Returns the first valid image URL or the fallback. */
export function firstImage(
  raw: Destination["images"],
  fallback = FALLBACK_IMAGE
): string {
  return parseImages(raw)[0] ?? fallback;
}
