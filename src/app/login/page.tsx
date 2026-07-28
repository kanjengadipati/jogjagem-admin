import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";
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
    redirect(role === "partner" ? "/partner" : "/dashboard");
  }

  // Token passed via redirect from main portal — hand off to Route Handler to set cookie
  if (params.token && params.token.length > 10) {
    redirect(`/api/auth/token?token=${encodeURIComponent(params.token)}`);
  }

  return <LoginForm />;
}
