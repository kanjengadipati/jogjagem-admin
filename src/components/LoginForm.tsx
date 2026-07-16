"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Mail, Lock, ArrowRight, Compass, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState<"google" | "facebook" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState({ google: false, facebook: false });

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then(setProviders)
      .catch(() => {});
  }, []);

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading("email");
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    if (res?.error) {
      setError("Login failed. Check your credentials.");
      setLoading(null);
    } else {
      window.location.href = "/dashboard";
    }
  }

  async function handleGoogle() {
    setLoading("google");
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  async function handleFacebook() {
    setLoading("facebook");
    await signIn("facebook", { callbackUrl: "/dashboard" });
  }

  const showSocial = providers.google || providers.facebook;

  return (
    <main className="min-h-screen text-text bg-bg flex items-center justify-center p-6 selection:bg-primary/20 selection:text-primary">
      <div className="w-full max-w-md bg-white p-10 rounded-[32px] border border-border shadow-[0_12px_45px_rgba(0,0,0,0.03)] space-y-8 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-secondary/5 blur-3xl" />

        {/* Logo */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white mx-auto shadow-lg shadow-primary/10">
            <Compass className="w-7 h-7" />
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
            Sign in with your account or use social login.
          </p>
        </div>

        {/* Social Login Buttons */}
        {showSocial && (
          <div className="space-y-3 relative z-10">
            {providers.google && (
              <button
                onClick={handleGoogle}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 py-3.5 rounded-xl text-xs font-semibold shadow-sm transition duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading === "google" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
            Google
          </button>

            )}

            {providers.facebook && (
              <button
                onClick={handleFacebook}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] text-white py-3.5 rounded-xl text-xs font-semibold shadow-sm transition duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading === "facebook" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
            Facebook
          </button>
            )}
          </div>
        )}

        {/* Divider */}
        {showSocial && (
          <div className="relative z-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-4 bg-white text-gray-400 font-medium uppercase tracking-wider">or sign in with email</span>
            </div>
          </div>
        )}

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
                placeholder="admin@mail.com"
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
            disabled={loading !== null}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 transition duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading === "email" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Authenticate Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-border relative z-10">
          <p className="text-[10px] text-gray-400 font-mono">
            Jogjagem Tourism Platform · v3.5.0-v6
          </p>
        </div>
      </div>
    </main>
  );
}
