import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

export async function GET() {
  const api = await getApi();

  // Fetch all pages to get complete list for admin
  const firstRes = await api("/destinations?limit=100&page=1");
  const firstData = firstRes.data as any;
  const totalPages: number = firstData?.meta?.total_pages ?? 1;
  let all: any[] = firstData?.data ?? [];

  // Fetch remaining pages concurrently
  if (totalPages > 1) {
    const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    const results = await Promise.all(
      pages.map(p => api(`/destinations?limit=100&page=${p}`))
    );
    for (const r of results) {
      const d = r.data as any;
      if (Array.isArray(d?.data)) all = all.concat(d.data);
    }
  }

  return NextResponse.json({ status: "success", data: all, meta: { ...firstData?.meta, total: all.length } }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const api = await getApi();
  const body = await req.json().catch(() => ({}));
  const { status, data } = await api("/destinations", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status });
}
