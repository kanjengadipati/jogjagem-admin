import { NextRequest, NextResponse } from "next/server";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function POST(req: NextRequest) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
  }

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
