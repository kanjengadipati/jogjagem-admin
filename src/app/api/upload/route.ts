import { NextRequest, NextResponse } from "next/server";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "wdsepioa";
const API_KEY    = process.env.CLOUDINARY_API_KEY    ?? "738718397121653";
const API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "82aR0CVjurkjAm-bVi6bgXFe9jo";

/**
 * POST /api/upload
 * Returns a signed Cloudinary signature so the browser can upload directly.
 * The actual file bytes never touch this server.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const folder: string = (body as { folder?: string }).folder ?? "explore-jogja";

  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;

  const hashBuffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(toSign)
  );
  const signature = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return NextResponse.json({
    signature,
    timestamp,
    api_key: API_KEY,
    cloud_name: CLOUD_NAME,
    folder,
    upload_url: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
  });
}
