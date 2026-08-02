import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const beRes = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await beRes.json().catch(() => ({}));

    if (!beRes.ok) {
      return NextResponse.json(
        { error: data?.message || "Gagal mengirim link reset" },
        { status: beRes.status }
      );
    }

    return NextResponse.json({ ok: true, message: "Link reset kata sandi telah dikirim ke email Anda." });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan jaringan" }, { status: 500 });
  }
}
