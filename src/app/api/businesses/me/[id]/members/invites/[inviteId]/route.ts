import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; inviteId: string }> }
) {
  const { id, inviteId } = await params;
  const api = await getApi();
  const { status, data } = await api(
    `/businesses/me/${id}/members/invites/${inviteId}`,
    { method: "DELETE" }
  );
  return NextResponse.json(data, { status });
}
