import { BACKEND_URL } from "./constants";

export async function backendFetch(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; data: unknown }> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, options);
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  } catch {
    return { status: 502, data: null };
  }
}

export function fetchWithAuth(token: string) {
  return (path: string, options: RequestInit = {}) =>
    backendFetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    });
}
