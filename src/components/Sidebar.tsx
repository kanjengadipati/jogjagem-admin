"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { menuGroups } from "@/lib/constants";
import {
  LayoutDashboard, BarChart3, FileText, MapPin, Calendar, Hotel,
  Utensils, Briefcase, Users, ShoppingBag, Car, MessageSquareDashed,
  BookOpen, Sparkles, Tag, UserCog, Shield, Settings, ChevronLeft,
  ChevronRight, ExternalLink, Bot,
} from "lucide-react";

// Map icon name strings → Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  "layout-dashboard": LayoutDashboard,
  "bar-chart-3": BarChart3,
  "file-text": FileText,
  "map-pin": MapPin,
  "calendar": Calendar,
  "hotel": Hotel,
  "utensils": Utensils,
  "briefcase": Briefcase,
  "users": Users,
  "shopping-bag": ShoppingBag,
  "car": Car,
  "message-square-dashed": MessageSquareDashed,
  "book-open": BookOpen,
  "sparkles": Sparkles,
  "tag": Tag,
  "bot": Bot,
  "user-cog": UserCog,
  "shield": Shield,
  "settings": Settings,
};

const BADGE_COLORS: Record<string, string> = {
  danger:  "bg-danger/10 text-danger",
  warning: "bg-warning/10 text-warning",
  primary: "bg-primary/10 text-primary",
};

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-72"
      } flex-shrink-0 border-r border-border bg-white min-h-screen flex flex-col transition-premium duration-300 z-30`}
    >
      {/* Brand */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Image src="/logo-gold.png" alt="Logo" width={40} height={40} className="object-contain" />
            <div>
              <h1 className="font-display font-extrabold text-base tracking-tight text-primary leading-none">
                JOGJAGEM
              </h1>
              <span className="text-[10px] font-semibold text-secondary tracking-widest uppercase">
                Ecosystem Admin
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <Image src="/logo-gold.png" alt="Logo" width={32} height={32} className="object-contain" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 hover:text-text cursor-pointer transition-premium flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        {menuGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <h3 className="text-[11px] font-bold tracking-wider text-gray-400 uppercase px-3 mb-2.5">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = ICON_MAP[item.icon] ?? Shield;
                const isActive =
                  pathname === item.path ||
                  (item.path !== "/dashboard" && pathname.startsWith(item.path));
                const badgeClass = BADGE_COLORS[item.badgeColor ?? ""] ?? "";

                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-premium group hover:bg-bg text-gray-600 hover:text-text ${
                        isActive ? "active-nav-link shadow-premium" : ""
                      }`}
                    >
                      <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                        <Icon className="w-5 h-5 transition-transform group-hover:scale-105 flex-shrink-0" />
                        {!collapsed && (
                          <span className="font-display">{item.name}</span>
                        )}
                      </div>
                      {!collapsed && item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeClass}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border mt-auto">
          <div className="space-y-2">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-premium text-xs font-semibold text-gray-700"
            >
              <ExternalLink className="w-4 h-4 text-primary" />
              <span>Visit Main Portal</span>
            </a>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-primary/5" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  AI
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary font-display">Gemini Assistant</h4>
                  <p className="text-[10px] text-gray-500">System Ready</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Dynamic descriptions, SEO and summaries generated server-side.
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
