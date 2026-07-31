import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Folder tujuan: /public/og-uploads/
    const uploadDir = path.join(process.cwd(), "public", "og-uploads");
    await mkdir(uploadDir, { recursive: true });

    // Generate nama file unik dengan timestamp & extension
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `og-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    // URL publik dari file yang disimpan secara lokal
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    const fileUrl = `${appUrl}/og-uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename,
    });
  } catch (err: any) {
    console.error("Local OG image upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to save file" }, { status: 500 });
  }
}
