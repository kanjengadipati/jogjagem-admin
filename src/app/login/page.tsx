import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";
import LoginForm from "@/components/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();

  // Already authenticated
  if (cookieStore.get(COOKIE_NAME)?.value) {
    redirect("/dashboard");
  }

  // Token passed via redirect from main portal
  if (params.token && params.token.length > 10) {
    cookieStore.set(COOKIE_NAME, params.token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
    });
    redirect("/dashboard");
  }

  return <LoginForm />;
}
