/**
 * Custom Next.js image loader for the admin app.
 *
 * - Cloudinary: use Cloudinary's transformation pipeline.
 * - Everything else: return src as-is so the browser fetches directly,
 *   bypassing the Next.js image proxy (which hosts like Wikimedia block).
 */

type LoaderParams = {
  src: string;
  width: number;
  quality?: number;
};

export default function imageLoader({ src, width, quality }: LoaderParams): string {
  if (src.includes("res.cloudinary.com")) {
    return src.replace("/upload/", `/upload/w_${width},q_${quality ?? 75},f_auto/`);
  }
  return src;
}
