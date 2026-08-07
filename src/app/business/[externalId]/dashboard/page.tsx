"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import BusinessHeader from "@/components/BusinessHeader";
import {
  LayoutDashboard,
  MapPin,
  Megaphone,
  MessageSquare,
  CreditCard,
  Settings,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface BusinessInfo {
  id: string;
  name: string;
  category: string;
  status: string;
}

interface ListingStats {
  promotions: number;
  reviews: number;
  avgRating: number;
  listings: number;
  activeListings: number;
}

export default function BusinessDashboardPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const routeParams = useParams();
  const routeExternalId = routeParams?.externalId as string | undefined;
  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<BusinessInfo | null>(null);
  const [stats, setStats] = useState<Record<string, ListingStats>>({});
  const [loading, setLoading] = useState(true);

  // Deep link dari web portal: /business/{id}/dashboard?placement=ecosystem_*
  // langsung arahkan ke panel promosi dengan slot yang dipilih.
  useEffect(() => {
    if (!selectedBiz) return;
    const placement = new URLSearchParams(window.location.search).get(
      "placement"
    );
    if (!placement) return;
    router.replace(
      `/business/${selectedBiz.id}/promotions?placement=${encodeURIComponent(placement)}`
    );
  }, [selectedBiz, router]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/businesses/me");
        const json = await res.json();
        const rawList: any[] = json?.data ?? [];
        const list: BusinessInfo[] = rawList.map((b) => ({
          id: b.external_id || String(b.id),
          name: b.name,
          category: b.category || "Wisata",
          status: b.status || "pending",
        }));

        if (cancelled) return;
        setBusinesses(list);

        if (list.length > 0) {
          const matched =
            list.find((b) => b.id === routeExternalId) || list[0];
          setSelectedBiz(matched);

          const statsMap: Record<string, ListingStats> = {};
          await Promise.all(
            list.map(async (biz) => {
              try {
                const [promoRes, reviewRes, listingRes] = await Promise.all([
                  fetch(`/api/businesses/me/${biz.id}/promotions`),
                  fetch(`/api/businesses/me/${biz.id}/reviews`),
                  fetch(`/api/businesses/me/${biz.id}/listings`),
                ]);
                const promoData = await promoRes.json();
                const reviewData = await reviewRes.json();
                const listingData = await listingRes.json();
                const promos = promoData?.data ?? [];
                const reviews = reviewData?.data ?? [];
                const owned = Array.isArray(listingData?.data)
                  ? listingData.data
                  : [];
                const withRating = reviews.filter((r: any) => (r.rating || 0) > 0);
                statsMap[biz.id] = {
                  promotions: promos.length,
                  reviews: reviews.length,
                  avgRating:
                    withRating.length > 0
                      ? withRating.reduce((s: number, r: any) => s + (r.rating || 0), 0) / withRating.length
                      : 0,
                  listings: owned.length,
                  activeListings: owned.filter(
                    (l: any) => !l.status || l.status === "approved" || l.status === "active"
                  ).length,
                };
              } catch {
                statsMap[biz.id] = {
                  promotions: 0,
                  reviews: 0,
                  avgRating: 0,
                  listings: 0,
                  activeListings: 0,
                };
              }
            })
          );
          if (!cancelled) setStats(statsMap);
        }
      } catch {
        showToast("Error", "Failed to load dashboard data", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [routeExternalId]);

  const totalListings = Object.values(stats).reduce((s, v) => s + v.listings, 0);
  const activeListings = Object.values(stats).reduce(
    (s, v) => s + v.activeListings,
    0
  );
  const isPending = selectedBiz?.status === "pending" || businesses.length === 0 || selectedBiz?.status === "draft";

  if (loading) {
    return (
      <>
        <BusinessHeader />
        <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8">
          <div className="flex items-center justify-center py-24 text-stone-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Memuat data dashboard...</span>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <BusinessHeader />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">
        {/* Pending Verification Alert Banner */}
        {isPending && (
          <div className="bg-[#FEF6E6] border border-[#F9E8C7] rounded-3xl p-5 md:p-6 flex items-center justify-between gap-4 text-[#825410]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F8E3B9] flex items-center justify-center shrink-0 text-[#A66E19] mt-0.5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#6B440A]">
                  Menunggu verifikasi admin
                </h3>
                <p className="text-xs text-[#8F5D15] mt-1 font-medium">
                  Diajukan {selectedBiz?.status === 'pending' ? 'baru saja' : ''} — biasanya diproses dalam 1x24 jam.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="text-xs font-bold text-stone-500">Total listings</div>
            <div className="text-3xl font-extrabold text-stone-900 mt-1 font-display">
              {totalListings}
            </div>
            <div className="text-[11px] font-medium text-stone-400 mt-1">Listing</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="text-xs font-bold text-emerald-600">Aktif</div>
            <div className="text-3xl font-extrabold text-stone-900 mt-1 font-display">
              {activeListings}
            </div>
            <div className="text-[11px] font-medium text-stone-400 mt-1">Listing aktif</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="text-xs font-bold text-stone-500 flex items-center gap-1">
              <span>Promosi</span>
              {isPending && <MessageSquare className="w-3 h-3 text-stone-400" />}
            </div>
            <div className="text-3xl font-extrabold text-stone-900 mt-1 font-display">
              {isPending ? "-" : Object.values(stats).reduce((s, v) => s + v.promotions, 0)}
            </div>
            <div className="text-[11px] font-medium text-stone-400 mt-1">Belum ada</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="text-xs font-bold text-stone-500">Rating rata-rata</div>
            <div className="text-3xl font-extrabold text-stone-900 mt-1 font-display">
              {isPending ? "-" : (Object.values(stats).reduce((s, v) => s + v.avgRating, 0) || "-")}
            </div>
            <div className="text-[11px] font-medium text-stone-400 mt-1">Belum ada rating</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Card: Aksi Cepat */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <div className="text-sm font-extrabold text-stone-900">Aksi cepat</div>

            <div className="space-y-3">
              <Link
                href={selectedBiz ? `/business/${selectedBiz.id}/listings` : "/business/listings"}
                className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 flex items-center justify-between gap-4 hover:bg-stone-100/80 transition-all"
              >
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
                <ExternalLink className="w-4 h-4 text-stone-400 shrink-0" />
              </Link>

              <Link
                href={selectedBiz ? `/business/${selectedBiz.id}/promotions` : "/business/promotions"}
                className="p-4 rounded-2xl border border-[#F3E5C8] bg-[#FFFDF8] flex items-center justify-between gap-4 hover:bg-[#FAF3E6] transition-all"
              >
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
                <ExternalLink className="w-4 h-4 text-[#B5781E] shrink-0" />
              </Link>

              <Link
                href={selectedBiz ? `/business/${selectedBiz.id}/reviews` : "/business/reviews"}
                className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 flex items-center justify-between gap-4 hover:bg-blue-50/80 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-900">Lihat reviews</div>
                    <div className="text-[11px] text-blue-600 font-medium mt-0.5">
                      Lihat dan balas ulasan dari pelanggan Anda.
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Right Card: Business Info */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold text-stone-900">Informasi Bisnis</div>
              {selectedBiz && (
                <Link
                  href={`/business/${selectedBiz.id}/settings`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100/80 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-[11px] font-bold text-stone-600 hover:text-[#B5781E] transition-all"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>
              )}
            </div>
            {selectedBiz ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-bold text-stone-900">{selectedBiz.name}</div>
                  <div className="text-[11px] text-stone-500 font-medium">{selectedBiz.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedBiz.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    selectedBiz.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {selectedBiz.status === 'approved' ? 'Terverifikasi' : selectedBiz.status === 'pending' ? 'Menunggu Verifikasi' : selectedBiz.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-stone-400">Tidak ada bisnis terdaftar</div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
