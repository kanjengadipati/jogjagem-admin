"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PartnerHeader from "@/components/PartnerHeader";
import { useToast } from "@/components/Toast";
import {
  Layers,
  TrendingUp,
  Tag,
  Star,
  Clock,
  ChevronRight,
  Zap,
  MapPin,
  Megaphone,
  MessageSquare,
  Lock,
  ArrowRight,
  Package,
  BookOpen,
  Loader2,
} from "lucide-react";
import type { Partner } from "@/types";

interface ListingStats {
  promotions: number;
  reviews: number;
  avgRating: number;
}

export default function PartnerOverviewPage() {
  const { showToast } = useToast();
  const [listings, setListings] = useState<Partner[]>([]);
  const [stats, setStats] = useState<Record<string, ListingStats>>({});
  const [loading, setLoading] = useState(true);
  const [bizInfo, setBizInfo] = useState<{ name: string; status: string; date: string }>({
    name: "siap",
    status: "pending",
    date: "1/8/2026",
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const meRes = await fetch("/api/partners/me");
        const meData = await meRes.json();
        const allListings: Partner[] = meData?.data ?? [];

        if (cancelled) return;
        setListings(allListings);

        if (Array.isArray(allListings) && allListings.length > 0) {
          const first = allListings[0];
          setBizInfo({
            name: first.name || "siap",
            status: first.status || "pending",
            date: (first as any).created_at
              ? new Date((first as any).created_at).toLocaleDateString("id-ID")
              : "1/8/2026",
          });
        }

        const statsMap: Record<string, ListingStats> = {};
        await Promise.all(
          allListings.map(async (p) => {
            try {
              const [promoRes, reviewRes] = await Promise.all([
                fetch(`/api/partners/me/${p.id}/promotions`),
                fetch(`/api/partners/me/${p.id}/reviews`),
              ]);
              const promoData = await promoRes.json();
              const reviewData = await reviewRes.json();
              const promos = promoData?.data ?? [];
              const reviews = reviewData?.data ?? [];
              const withRating = reviews.filter((r: any) => r.rating > 0);
              statsMap[p.id] = {
                promotions: promos.length,
                reviews: reviews.length,
                avgRating:
                  withRating.length > 0
                    ? withRating.reduce((s: number, r: any) => s + r.rating, 0) / withRating.length
                    : 0,
              };
            } catch {
              statsMap[p.id] = { promotions: 0, reviews: 0, avgRating: 0 };
            }
          })
        );

        if (!cancelled) setStats(statsMap);
      } catch {
        showToast("Error", "Failed to load overview data", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeListings = listings.filter((p) => p.status === "approved").length;
  const isPending = bizInfo.status === "pending" || activeListings === 0;

  return (
    <>
      <PartnerHeader />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">

        {/* ── Pending Verification Alert Banner ── */}
        {isPending && (
          <div className="bg-[#FEF6E6] border border-[#F9E8C7] rounded-3xl p-5 md:p-6 flex items-center justify-between gap-4 text-[#825410]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F8E3B9] flex items-center justify-center shrink-0 text-[#A66E19] mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#6B440A]">
                  Menunggu verifikasi admin
                </h3>
                <p className="text-xs text-[#8F5D15] mt-1 font-medium">
                  Diajukan {bizInfo.date} — biasanya diproses dalam 1x24 jam.
                </p>
              </div>
            </div>

            <button className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#EACD96] bg-white/80 hover:bg-white text-xs font-bold text-[#825410] shadow-2xs transition-all cursor-pointer">
              <span>Lihat Detail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-stone-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Memuat data dashboard...</span>
          </div>
        ) : (
          <>
            {/* ── 4 Stat Cards Row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Total listings */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF3E6] text-[#B5781E] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-500">Total listings</div>
                  <div className="text-3xl font-extrabold text-stone-900 mt-1 font-display">
                    {listings.length}
                  </div>
                  <div className="text-[11px] font-medium text-stone-400 mt-1">Listing</div>
                </div>
              </div>

              {/* Card 2: Aktif */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-600">Aktif</div>
                  <div className="text-3xl font-extrabold text-stone-900 mt-1 font-display">
                    {activeListings}
                  </div>
                  <div className="text-[11px] font-medium text-stone-400 mt-1">Listing aktif</div>
                </div>
              </div>

              {/* Card 3: Promosi */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-500 flex items-center gap-1">
                    <span>Promosi</span>
                    {isPending && <Lock className="w-3 h-3 text-stone-400" />}
                  </div>
                  <div className="text-3xl font-extrabold text-stone-900 mt-1 font-display">
                    {isPending ? "-" : Object.values(stats).reduce((s, v) => s + v.promotions, 0)}
                  </div>
                  <div className="text-[11px] font-medium text-stone-400 mt-1">Belum ada</div>
                </div>
              </div>

              {/* Card 4: Rating rata-rata */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-500">Rating rata-rata</div>
                  <div className="text-3xl font-extrabold text-stone-900 mt-1 font-display">
                    {isPending ? "-" : (Object.values(stats).reduce((s, v) => s + v.avgRating, 0) || "-")}
                  </div>
                  <div className="text-[11px] font-medium text-stone-400 mt-1">Belum ada rating</div>
                </div>
              </div>
            </div>

            {/* ── Main Content Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Card: Aksi Cepat */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
                <div className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Aksi cepat</span>
                </div>

                <div className="space-y-3">
                  {/* Action 1: Kelola Destinasi */}
                  <div className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">Kelola destinasi</div>
                        <div className="text-[11px] text-stone-400 font-medium mt-0.5">
                          Kelola informasi destinasi dan detail bisnis Anda.
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </div>

                  {/* Action 2: Buat Promosi */}
                  <div className="p-4 rounded-2xl border border-[#F3E5C8] bg-[#FFFDF8] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-[#FAF3E6] text-[#B5781E] flex items-center justify-center">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#8A5C13]">Buat promosi</div>
                        <div className="text-[11px] text-[#B5853E] font-medium mt-0.5">
                          Buat promosi atau penawaran spesial untuk pelanggan.
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#B5781E] shrink-0" />
                  </div>

                  {/* Action 3: Lihat Reviews */}
                  <Link
                    href="/partner/reviews"
                    className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 flex items-center justify-between gap-4 hover:bg-blue-50/80 transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-900 group-hover:text-blue-700">Lihat reviews</div>
                        <div className="text-[11px] text-blue-600 font-medium mt-0.5">
                          Lihat dan balas ulasan dari pelanggan Anda.
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Card: Empty State */}
              <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col items-center justify-center text-center min-h-[300px]">
                {isPending || listings.length === 0 ? (
                  <div className="space-y-4 max-w-sm flex flex-col items-center">
                    {/* Illustration Container */}
                    <div className="w-24 h-24 rounded-full bg-[#FAF4E8] flex items-center justify-center text-[#C28929] relative shadow-2xs">
                      <Package className="w-11 h-11" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-stone-900">
                        Belum ada listing
                      </h4>
                      <p className="text-xs text-stone-400 font-medium mt-1">
                        Muncul di sini setelah klaim disetujui.
                      </p>
                    </div>
                    <button className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#B57A21] to-[#C98B29] hover:from-[#A26C1C] hover:to-[#B77D20] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer">
                      <BookOpen className="w-4 h-4" />
                      <span>Pelajari Cara Klaim</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-stone-900">
                        Listings Anda
                      </h4>
                      <Link
                        href="/partner/listings"
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Lihat Semua
                      </Link>
                    </div>
                    {listings.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-100 bg-stone-50/60 text-xs font-bold text-stone-800"
                      >
                        <span>{p.name}</span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
