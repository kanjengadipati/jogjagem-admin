import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";
import { decodeJwtPayload } from "@/lib/jwt";

export default async function Home() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  
  if (!token) {
    redirect("/login");
  }

  const payload = decodeJwtPayload(token);
  if (payload?.role === "partner" || payload?.role === "business_owner") {
    redirect("/business");
  }
  if (payload?.role !== "admin" && payload?.role !== "superadmin") {
    redirect("/logout");
  }

  redirect("/dashboard");
}
