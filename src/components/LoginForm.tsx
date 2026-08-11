"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle OAuth Callback (Google)
    const hash = window.location.hash;
    if (hash && hash.includes("id_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get("id_token");
      if (idToken) {
        handleSocialLogin("google", idToken);
      }
    }
  }, []);

  async function handleSocialLogin(provider: string, token: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, token }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.status === "success") {
        window.location.href = data.redirectUrl || "/dashboard";
        return;
      }
      setError(data.message || "Social login failed.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        window.location.href = data.redirectUrl || "/dashboard";
        return;
      }

      setError(data.error || "Login failed. Check your credentials.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen text-text bg-bg flex items-center justify-center p-6 selection:bg-primary/20 selection:text-primary">
      <div className="w-full max-w-md bg-white p-10 rounded-[32px] border border-border shadow-[0_12px_45px_rgba(0,0,0,0.03)] space-y-8 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-secondary/5 blur-3xl" />

        {/* Logo */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center mx-auto shadow-lg shadow-primary/10 overflow-hidden">
            <Image src="/logo-gold-new.png" alt="Jogjagem Logo" width={40} height={40} className="object-contain" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xl tracking-tight text-primary">
              JOGJAGEM
            </h1>
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mt-0.5">
              Ecosystem Operations Console
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center space-y-1 relative z-10">
          <p className="text-xs font-bold text-primary font-display">Authorized Operator Access Only</p>
          <p className="text-[10px] text-gray-500 leading-normal">
            Sign in with your operator credentials to access the console.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-center relative z-10">
            <p className="text-xs font-semibold text-danger">{error}</p>
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase font-display block">
              Operator Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                required
                className="w-full bg-bg focus:bg-white text-xs pl-10 pr-4 py-3.5 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium"
                placeholder="useradmin@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase font-display block">
              Secure Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="password"
                required
                className="w-full bg-bg focus:bg-white text-xs pl-10 pr-4 py-3.5 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 transition duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Authenticate Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <SocialLoginButtons />

        <div className="text-center pt-2 border-t border-border relative z-10">
          <p className="text-[10px] text-gray-400 font-mono">
            Jogjagem Tourism Platform · v3.5.0-v6
          </p>
        </div>
      </div>
    </main>
  );
}
