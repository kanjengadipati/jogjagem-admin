import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME, FRONTEND_URL } from "@/lib/constants";
import { decodeJwtPayload } from "@/lib/jwt";

export default async function Home() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  
  if (!token) {
    redirect("/login");
  }

  const payload = decodeJwtPayload(token);
  if (payload?.role === "partner" || payload?.role === "business_owner") {
    redirect(FRONTEND_URL);
  }
  if (payload?.role !== "admin" && payload?.role !== "superadmin") {
    redirect("/logout");
  }

  redirect("/dashboard");
}
