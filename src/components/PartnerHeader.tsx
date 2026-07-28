"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Bell, ChevronDown, LogOut, Settings, Menu, User } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { COOKIE_NAME } from "@/lib/constants";

/** Decode JWT payload di browser (browser-safe, tanpa Buffer Node.js) */
function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    return JSON.parse(atob(base64.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

const FALLBACK_USER = {
  name: "Partner",
  email: "",
  avatar: "https://unavatar.io/gravatar/partner@explorejogja.com",
};

export default function PartnerHeader() {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const { toggleMobileSidebar } = useSidebar();
  const [user, setUser] = useState(FALLBACK_USER);
  const [time, setTime] = useState("");

  // Jam realtime
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Ambil nama & avatar dari /api/me (proxy ke /auth/profile — accessible semua role)
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((res: { status?: string; data?: { name?: string; email?: string; avatar_url?: string } }) => {
        if (res.status !== "success" || !res.data) return;
        const d = res.data;
        setUser({
          name: d.name || "Partner",
          email: d.email || "",
          avatar: d.avatar_url || FALLBACK_USER.avatar,
        });
      })
      .catch(() => {});
  }, []);

  const today =
    "Today, " +
    new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <header className="h-20 border-b border-border bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 rounded-lg border border-border hover:bg-bg text-gray-500"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-medium font-display">
          <span>Jogjagem</span>
          <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
          <span className="text-gray-600">Partner Portal</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* Date/time */}
        <div className="hidden xl:flex flex-col text-right">
          <span className="text-xs font-semibold text-gray-800">{today}</span>
          <span className="text-[10px] text-gray-500 font-mono">{time}</span>
        </div>

        {/* Notifikasi (placeholder) */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="p-2.5 rounded-xl border border-border hover:bg-bg text-gray-500 hover:text-text cursor-pointer transition-premium relative"
          >
            <Bell className="w-4 h-4" />
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white border border-border shadow-soft p-4 z-50">
              <p className="text-xs font-bold text-gray-800 font-display border-b border-border pb-3 mb-3">
                Notifikasi
              </p>
              <p className="text-[11px] text-gray-400 text-center py-4">
                Belum ada notifikasi baru.
              </p>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl border border-border hover:bg-bg cursor-pointer transition-premium"
          >
            {user.avatar.startsWith("http") ? (
              <Image
                src={user.avatar}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-gray-800 font-display leading-none mb-0.5">
                {user.name}
              </span>
              <span className="text-[10px] text-gray-500">Partner</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-52 rounded-2xl bg-white border border-border shadow-soft p-2 flex flex-col z-50">
              <div className="p-3 border-b border-border mb-1">
                <p className="text-xs font-bold text-gray-800">{user.name}</p>
                <p className="text-[10px] text-gray-500">Partner Portal</p>
              </div>
              <Link
                href="/partner/settings"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-600 hover:bg-bg hover:text-text transition-premium"
              >
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </Link>
              <Link
                href="/partner"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-600 hover:bg-bg hover:text-text transition-premium"
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/logout"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-danger hover:bg-danger/10 transition-premium mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
