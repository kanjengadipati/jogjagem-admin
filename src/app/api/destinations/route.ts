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
 * GET /api/destinations
 *
 * Accepted query params (forwarded to backend):
 *   page     – page number (default: 1)
 *   limit    – items per page (default: 25, max: 100)
 *   search   – name/location text search
 *   category – filter by category
 *   region   – filter by sub_region
 *
 * When `all=true` is passed the route fetches every page concurrently and
 * returns the merged array — useful for CSV export only.
 */
export async function GET(req: NextRequest) {
  const api = await getApi();
  const { searchParams } = req.nextUrl;

  // ── Export mode: fetch all pages for CSV ──────────────────────────────────
  if (searchParams.get("all") === "true") {
    const firstRes = await api("/destinations?limit=100&page=1&status=all");
    const firstData = firstRes.data as any;
    const totalPages: number = firstData?.meta?.total_pages ?? 1;
    let all: unknown[] = firstData?.data ?? [];

    if (totalPages > 1) {
      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          api(`/destinations?limit=100&page=${i + 2}&status=all`)
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

  // Admin needs to see all statuses (including drafts)
  const backendParams = new URLSearchParams({ page, limit, status: "all" });
  // Note: backend doesn't support search/category/region as query params yet,
  // so filtering is done client-side on the returned page.
  // When backend adds these params, simply forward them here.

  const { status, data } = await api(`/destinations?${backendParams.toString()}`);
  return NextResponse.json(data, { status });
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
