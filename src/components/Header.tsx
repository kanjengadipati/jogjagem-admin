"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Bell, ChevronDown, Settings, Users, LogOut } from "lucide-react";
import { ADMIN_USER } from "@/lib/constants";

interface HeaderProps {
  activeId: string;
}

export default function Header({ activeId }: HeaderProps) {
  const [time, setTime] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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
    <header className="h-20 border-b border-border bg-white px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
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
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="p-2.5 rounded-xl border border-border hover:bg-bg text-gray-500 hover:text-text cursor-pointer transition-premium relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-danger border-2 border-white" />
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white border border-border shadow-soft p-4 flex flex-col gap-3 z-50">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="text-xs font-bold text-gray-800 font-display">System Notifications</h4>
                <span className="bg-danger/10 text-danger text-[9px] font-bold px-1.5 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                {[
                  { color: "danger",  title: "Review pending moderation",       sub: "Sarah Johnson flagged for spam (Score: 82%)",           time: "2 mins ago"  },
                  { color: "warning", title: "New Tourism Partner Registration", sub: "Heha Ocean View requests listing verification",         time: "1 hour ago"  },
                  { color: "success", title: "AI Insights Compiled",             sub: "Weekly tourism reports ready for review",               time: "Yesterday"   },
                ].map((n) => (
                  <div key={n.title} className="flex gap-3 items-start hover:bg-bg p-1.5 rounded-xl transition-premium cursor-pointer">
                    <span className={`w-2.5 h-2.5 rounded-full bg-${n.color} mt-1.5 flex-shrink-0`} />
                    <div>
                      <p className="text-xs font-semibold text-gray-800 leading-tight">{n.title}</p>
                      <p className="text-[10px] text-gray-500">{n.sub}</p>
                      <span className="text-[9px] text-gray-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/reviews" className="text-center text-xs font-bold text-primary hover:text-primary-dark mt-2 pt-2 border-t border-border block">
                View All Operations
              </Link>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl border border-border hover:bg-bg cursor-pointer transition-premium"
          >
            <Image
              src={ADMIN_USER.avatar}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-lg object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-gray-800 font-display leading-none mb-0.5">{ADMIN_USER.name}</span>
              <span className="text-[10px] text-gray-500">{ADMIN_USER.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white border border-border shadow-soft p-2 flex flex-col z-50">
              <div className="p-3 border-b border-border">
                <p className="text-xs font-bold text-gray-800">{ADMIN_USER.name}</p>
                <p className="text-[10px] text-gray-500">{ADMIN_USER.email}</p>
              </div>
              <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-600 hover:bg-bg hover:text-text transition-premium mt-1">
                <Settings className="w-4 h-4" /><span>Account Settings</span>
              </Link>
              <Link href="/users" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-600 hover:bg-bg hover:text-text transition-premium">
                <Users className="w-4 h-4" /><span>Team Directory</span>
              </Link>
              <Link href="/logout" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-danger hover:bg-danger/10 transition-premium mt-1">
                <LogOut className="w-4 h-4" /><span>Log Out</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
