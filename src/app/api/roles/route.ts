import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchWithAuth } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/constants";

type RolePayload = {
  id?: string | number;
  ID?: string | number;
  name?: string;
  Name?: string;
  role_permissions?: unknown;
  [key: string]: unknown;
};

async function getApi() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  return fetchWithAuth(token);
}

function normalizeRole(role: RolePayload) {
  return {
    ...role,
    id: role.id ?? role.ID,
    name: role.name ?? role.Name ?? "",
  };
}

export async function GET() {
  const api = await getApi();
  const { status, data } = await api("/auth/admin/roles");

  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return NextResponse.json({
      ...data,
      data: (data as { data: RolePayload[] }).data.map(normalizeRole),
    }, { status });
  }

  return NextResponse.json(data, { status });
}
