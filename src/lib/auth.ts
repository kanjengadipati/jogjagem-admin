import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME } from "./constants";

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

/** Use in Server Components / Route Handlers that require auth. */
export async function requireToken(): Promise<string> {
  const token = await getToken();
  if (!token) redirect("/login");
  return token;
}
