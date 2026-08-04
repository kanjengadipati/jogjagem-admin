import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const api = await getApi();
  // Backend: GET /listing-claims/me returns all claims for the authenticated user.
  // We pass business_external_id so the backend can filter by business if supported.
  const { status, data } = await api(`/listing-claims/me?business_external_id=${id}`);
  return NextResponse.json(data, { status });
}
