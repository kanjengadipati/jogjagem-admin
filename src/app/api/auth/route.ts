import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendFetch } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;

  const { status, data } = await backendFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, device_name: "explore-jogja-admin" }),
  });

  type LoginData = { data?: { access_token?: string } };
  if (status === 200 && (data as LoginData)?.data?.access_token) {
    const store = await cookies();
    store.set(COOKIE_NAME, (data as LoginData).data!.access_token!, {
      httpOnly: true,
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
    });
  }

  return NextResponse.json(data, { status });
}
