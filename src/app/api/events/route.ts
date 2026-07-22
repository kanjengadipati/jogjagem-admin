import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

/**
 * GET /api/events
 *
 * Accepted query params (forwarded to backend):
 *   page     – page number (default: 1)
 *   limit    – items per page (default: 25, max: 100)
 *
 * When `all=true` is passed the route fetches every page concurrently and
 * returns the merged array — useful for CSV export only.
 */
export async function GET(req: NextRequest) {
  const api = await getApi();
  const { searchParams } = req.nextUrl;

  // ── Export mode: fetch all pages ──────────────────────────────────────────
  if (searchParams.get("all") === "true") {
    const firstRes = await api("/events?limit=100&page=1");
    const firstData = firstRes.data as any;
    const totalPages: number = firstData?.meta?.total_pages ?? 1;
    let all: unknown[] = firstData?.data ?? [];

    if (totalPages > 1) {
      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          api(`/events?limit=100&page=${i + 2}`)
        )
      );
      for (const r of rest) {
        const d = r.data as any;
        if (Array.isArray(d?.data)) all = all.concat(d.data);
      }
    }
    return NextResponse.json(
      { status: "success", data: all, meta: { total: all.length, page: 1, limit: all.length, total_pages: 1 } },
      { status: 200 }
    );
  }

  // ── Normal paginated mode ─────────────────────────────────────────────────
  const page  = searchParams.get("page")  ?? "1";
  const limit = searchParams.get("limit") ?? "25";

  const backendParams = new URLSearchParams({ page, limit });
  const { status, data } = await api(`/events?${backendParams.toString()}`);
  return NextResponse.json(data, { status });
}

export async function POST(req: NextRequest) {
  const api = await getApi();
  const body = await req.json().catch(() => ({}));
  const { status, data } = await api("/events", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status });
}
