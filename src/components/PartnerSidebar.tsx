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

export default function PartnerSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<BusinessOption | null>(null);

  useEffect(() => {
    async function loadBiz() {
      try {
        const res = await fetch("/api/partners/me");
        const json = await res.json();
        const list: any[] = json?.data ?? [];
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((b) => ({
            id: b.external_id || String(b.id),
            name: b.name || "siap",
            category: b.category || "Wisata & Destinasi",
            status: b.status || "pending",
          }));
          setBusinesses(mapped);
          setSelectedBiz(mapped[0]);
        } else {
          const defaultBiz = {
            id: "siap",
            name: "siap",
            category: "Wisata & Destinasi",
            status: "pending",
          };
          setBusinesses([defaultBiz]);
          setSelectedBiz(defaultBiz);
        }
      } catch {
        const defaultBiz = {
          id: "siap",
          name: "siap",
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

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/business",
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
      path: "#",
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
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside
        className={`${collapsed ? "w-20" : "w-72"
          } fixed inset-y-0 left-0 z-50 bg-[#FAFAFA] border-r border-stone-200/80 min-h-screen flex flex-col justify-between transition-all duration-300 transform ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-stone-100">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-gold.png"
                  alt="Jogjagem Logo"
                  width={34}
                  height={34}
                  className="object-contain"
                />
                <div>
                  <h1 className="font-bold text-base text-stone-900 leading-tight">
                    Jogjagem
                  </h1>
                  <span className="text-[11px] font-medium text-stone-400">
                    Business Portal
                  </span>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="w-full flex justify-center">
                <Image
                  src="/logo-gold.png"
                  alt="Jogjagem Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex items-center justify-center w-7 h-7 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-400 hover:text-stone-700 cursor-pointer shadow-xs transition-all"
              >
                {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={toggleMobileSidebar}
                className="md:hidden p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-500 hover:text-stone-900 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Business Selector Dropdown */}
          {!collapsed && selectedBiz && (
            <div className="px-4 pt-5 pb-2">
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                  <Store className="w-4 h-4" />
                </div>
                <select
                  value={selectedBiz.id}
                  onChange={(e) => {
                    const b = businesses.find((x) => x.id === e.target.value);
                    if (b) setSelectedBiz(b);
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
          <div className="px-3 py-4 space-y-1.5">
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
                    className={`flex items-center ${collapsed ? "justify-center" : "justify-between"
                      } px-4 py-3 rounded-2xl text-xs font-bold transition-all ${item.locked
                        ? "text-stone-400 cursor-not-allowed opacity-75 hover:bg-transparent"
                        : isActive
                          ? "bg-[#FAF3E6] text-[#B5781E] border border-[#F2E3C6] shadow-2xs font-extrabold"
                          : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                      }`}
                  >
                    <div className={`flex items-center ${collapsed ? "" : "gap-3.5"}`}>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#B5781E]" : item.locked ? "text-stone-400" : "text-stone-500"}`} />
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

        {/* Bottom Banner Card ("Tingkatkan Bisnis Anda") */}
        {!collapsed && (
          <div className="p-4 m-3 rounded-3xl bg-gradient-to-b from-[#FFFDF7] to-[#FDF4E3] border border-[#F3E2BD] relative overflow-hidden space-y-2.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#996515]">
              <Crown className="w-4 h-4 text-[#C68A27] shrink-0" />
              <span>Tingkatkan Bisnis Anda</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
              Dapatkan lebih banyak fitur dan promosi eksklusif untuk bisnis Anda.
            </p>
            <button className="w-full py-2.5 px-3 bg-gradient-to-r from-[#B57A21] to-[#C98B29] hover:from-[#A26C1C] hover:to-[#B77D20] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer">
              <span>Lihat Paket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}