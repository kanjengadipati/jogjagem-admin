"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, ChevronDown, Settings, Users, LogOut, Menu, Coins, Link2, DollarSign } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useRole } from "@/contexts/RoleContext";
import NotificationBell from "@/components/NotificationBell";

interface HeaderProps {
  activeId: string;
}

const FALLBACK_USER = {
  name: "Admin",
  email: "",
  role: "Admin",
  avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com",
};

export default function Header({ activeId }: HeaderProps) {
  const role = useRole();
  const [time, setTime] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const { toggleMobileSidebar } = useSidebar();
  const [user, setUser] = useState(FALLBACK_USER);

  useEffect(() => {
    // The session cookie is httpOnly, so the browser can't read the token —
    // the /api/auth/profile proxy reads it server-side instead.
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((res: { status?: string; data?: { name?: string; email?: string; role?: string; avatar_url?: string } }) => {
        if (res.status !== "success" || !res.data) return;
        const d = res.data;
        setUser({
          name: d.name || "Admin",
          email: d.email || "",
          role:
            d.role === "superadmin" ? "Super Admin" :
              d.role === "sales" ? "Sales" :
                "Admin",
          avatar: d.avatar_url || "",
        });
      })
      .catch(() => { });
  }, []);

  const today =
    "Today, " +
    new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-20 border-b border-border bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumb */}
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
          <span className="text-gray-600 capitalize">{activeId.replace("-", " ")}</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="relative hidden lg:block w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search operations..."
            className="w-full bg-bg hover:bg-bg/80 focus:bg-white text-xs pl-9 pr-12 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition-premium font-medium"
          />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <kbd className="text-[9px] font-sans font-bold bg-white border border-border text-gray-400 px-1.5 py-0.5 rounded-md leading-none shadow-apple">
              ⌘K
            </kbd>
          </span>
        </div>

        {/* Date/time */}
        <div className="hidden xl:flex flex-col text-right">
          <span className="text-xs font-semibold text-gray-800">{today}</span>
          <span className="text-[10px] text-gray-500 font-mono">{time}</span>
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl border border-border hover:bg-bg cursor-pointer transition-premium"
          >
            {role === "sales" && !user.avatar ? (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-primary shrink-0">
                <Coins className="w-4 h-4" />
              </div>
            ) : (
              <Image
                src={user.avatar || FALLBACK_USER.avatar}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-gray-800 font-display leading-none mb-0.5">{user.name}</span>
              <span className="text-[10px] text-gray-500">{user.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white border border-border shadow-soft p-2 flex flex-col z-50">
              <div className="p-3 border-b border-border">
                <p className="text-xs font-bold text-gray-800">{user.name}</p>
                <p className="text-[10px] text-gray-500">{user.email}</p>
              </div>

              <div className="flex flex-col mt-1">
                <Link
                  href="/settings/account"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-600 hover:bg-bg hover:text-text transition-premium"
                >
                  <Settings className="w-4 h-4" /><span>Account Settings</span>
                </Link>
                <Link
                  href="/users"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-600 hover:bg-bg hover:text-text transition-premium"
                >
                  <Users className="w-4 h-4" /><span>Team Directory</span>
                </Link>
                <Link
                  href="/logout"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-danger hover:bg-danger/10 transition-premium mt-1"
                >
                  <LogOut className="w-4 h-4" /><span>Log Out</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
