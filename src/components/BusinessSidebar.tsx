"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  LayoutDashboard,
  MapPin,
  Megaphone,
  MessageSquare,
  CreditCard,
  Settings,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Store,
  Crown,
  ArrowRight,
} from "lucide-react";

interface BusinessOption {
  id: string;
  name: string;
  category: string;
  status: string;
}

export default function BusinessSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<BusinessOption | null>(null);

  useEffect(() => {
    async function loadBiz() {
      try {
        const res = await fetch("/api/businesses/me");
        const json = await res.json();
        const list: any[] = json?.data ?? [];
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((b) => ({
            id: b.external_id || String(b.id),
            name: b.name || "Bisnis Saya",
            category: b.category || "Wisata & Destinasi",
            status: b.status || "pending",
          }));
          setBusinesses(mapped);
          setSelectedBiz(mapped[0]);
        } else {
          const defaultBiz = {
            id: "default",
            name: "Bisnis Saya",
            category: "Wisata & Destinasi",
            status: "pending",
          };
          setBusinesses([defaultBiz]);
          setSelectedBiz(defaultBiz);
        }
      } catch {
        const defaultBiz = {
          id: "default",
          name: "Bisnis Saya",
          category: "Wisata & Destinasi",
          status: "pending",
        };
        setBusinesses([defaultBiz]);
        setSelectedBiz(defaultBiz);
      }
    }
    loadBiz();
  }, []);

  const handleLinkClick = (e: React.MouseEvent, locked: boolean) => {
    if (locked) {
      e.preventDefault();
      return;
    }
    if (isMobileOpen) toggleMobileSidebar();
  };

  const isPending = selectedBiz?.status === "pending" || businesses.length === 0 || selectedBiz?.status === "draft";

  const dashboardHref = selectedBiz?.id && selectedBiz.id !== "default"
    ? `/business/${selectedBiz.id}/dashboard`
    : "/business";

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: dashboardHref,
      locked: false,
    },
    {
      name: "Kelola Destinasi",
      icon: MapPin,
      path: "/business/listings",
      locked: isPending,
    },
    {
      name: "Marketing",
      icon: Megaphone,
      path: "/business/promotions",
      locked: isPending,
    },
    {
      name: "Reviews",
      icon: MessageSquare,
      path: "/business/reviews",
      locked: false,
    },
    {
      name: "Langganan",
      icon: CreditCard,
      path: "/business/subscriptions",
      locked: isPending,
    },
    {
      name: "Pengaturan",
      icon: Settings,
      path: "/business/settings",
      locked: false,
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          onClick={toggleMobileSidebar}
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-[#FDFBF7] border-r border-stone-200/80 z-50 flex flex-col transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        } ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Toggle collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-7 w-6 h-6 bg-white border border-stone-200 rounded-full items-center justify-center text-stone-500 hover:text-stone-900 shadow-2xs z-50 cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Mobile close button */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden absolute right-4 top-4 text-stone-400 hover:text-stone-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header / Logo */}
        <div className="p-6 pb-4 border-b border-stone-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 flex items-center justify-center text-amber-400 font-display font-extrabold text-lg shadow-2xs shrink-0">
              J
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display font-extrabold text-sm text-stone-900 tracking-tight">
                    JOGJAGEM
                  </h1>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-[#B5781E] text-[9px] font-extrabold uppercase">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 font-semibold tracking-wide uppercase">
                  Business Portal
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          {/* Active Business Switcher Dropdown */}
          {!collapsed && (
            <div className="px-4 mb-4">
              <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1.5 px-1">
                Bisnis Aktif
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600 pointer-events-none">
                  <Store className="w-4 h-4" />
                </div>
                <select
                  value={selectedBiz?.id || ""}
                  onChange={(e) => {
                    const found = businesses.find((b) => b.id === e.target.value);
                    if (found) setSelectedBiz(found);
                  }}
                  className="w-full appearance-none bg-white border border-stone-200 rounded-2xl pl-10 pr-9 py-3 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer truncate shadow-2xs"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Nav Links */}
          <div className="px-3 py-2 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.path ||
                (item.path !== "/business" && pathname.startsWith(item.path));

              return (
                <li key={item.name} className="list-none">
                  <Link
                    href={item.locked ? "#" : item.path}
                    onClick={(e) => handleLinkClick(e, item.locked)}
                    className={`flex items-center ${
                      collapsed ? "justify-center" : "justify-between"
                    } px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      item.locked
                        ? "text-stone-400 cursor-not-allowed opacity-75 hover:bg-transparent"
                        : isActive
                        ? "bg-[#FAF3E6] text-[#B5781E] border border-[#F2E3C6] shadow-2xs font-extrabold"
                        : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                    }`}
                  >
                    <div className={`flex items-center ${collapsed ? "" : "gap-3.5"}`}>
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive
                            ? "text-[#B5781E]"
                            : item.locked
                            ? "text-stone-400"
                            : "text-stone-500"
                        }`}
                      />
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && item.locked && (
                      <Lock className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </div>
        </div>

        {/* Footer / Account status */}
        {!collapsed && (
          <div className="p-4 border-t border-stone-200/60 bg-[#F7F4EC]/50">
            <div className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="text-[11px] font-extrabold text-stone-900">
                    Paket Gratis
                  </div>
                  <div className="text-[9px] font-semibold text-stone-400">
                    Upgrade ke Business Pro
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
