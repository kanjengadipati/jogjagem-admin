import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const url = (body as { url?: string }).url?.trim();

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only http(s) URLs are allowed" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(parsed.toString(), {
      headers: { "User-Agent": "Jogjagem-Admin-OG/1.0" },
      redirect: "follow",
    });
  } catch {
    return NextResponse.json({ error: "Failed to download image" }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: `Upstream responded ${res.status}` }, { status: 502 });
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "URL does not point to an image" }, { status: 422 });
  }

  const length = Number(res.headers.get("content-length") ?? 0);
  if (length > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large" }, { status: 413 });
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await res.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "Failed to read image" }, { status: 502 });
  }

  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large" }, { status: 413 });
  }

  try {
    const jpeg = await sharp(Buffer.from(buffer))
      .rotate()
      .resize(1200, 630, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer();

    const dataUrl = `data:image/jpeg;base64,${jpeg.toString("base64")}`;
    return NextResponse.json({ dataUrl });
  } catch {
    return NextResponse.json({ error: "Failed to process image" }, { status: 422 });
  }
}
