import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME, FRONTEND_URL } from "@/lib/constants";
import { decodeJwtPayload } from "@/lib/jwt";
import LoginForm from "@/components/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();

  // Already authenticated — redirect based on role
  const existingToken = cookieStore.get(COOKIE_NAME)?.value;
  if (existingToken) {
    const payload = decodeJwtPayload(existingToken);
    const role = payload?.role;
    if (role === "partner" || role === "business_owner") {
      redirect(FRONTEND_URL);
    }
    if (role === "sales") {
      redirect("/sales/me");
    }
    if (role === "admin" || role === "superadmin") {
      redirect("/dashboard");
    }
    // Regular user cannot access this admin app — clear the session to break the loop
    redirect("/logout");
  }

  return <LoginForm />;
}
