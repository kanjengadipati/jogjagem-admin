"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  Briefcase,
  Tag,
  MessageSquare,
  Star,
  Eye,
  MousePointerClick,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Loader2,
  TrendingUp,
  Plus,
  BarChart3,
  MapPin,
} from "lucide-react";
import type { Partner } from "@/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Promotion {
  id: string;
  title: string;
  status?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  user_name?: string;
  CreatedAt?: string;
}

interface ListingStats {
  promotions: number;
  reviews: number;
  avgRating: number;
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  borderColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  borderColor: string;
}) {
  return (
    <div
      className="bg-white p-6 rounded-card border border-border shadow-soft hover-scale relative overflow-hidden"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div
        className="absolute right-0 top-0 w-16 h-16 rounded-bl-full flex items-center justify-center"
        style={{ backgroundColor: `${borderColor}10` }}
      >
        <Icon className="w-5 h-5" style={{ color: borderColor }} />
      </div>
      <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase font-display">
        {label}
      </p>
      <h3 className="text-3xl font-extrabold text-gray-900 font-display mt-2 leading-none">
        {value}
      </h3>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function PartnerOverviewPage() {
  const { showToast } = useToast();
  const [listings, setListings] = useState<Partner[]>([]);
  const [stats, setStats] = useState<Record<string, ListingStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const meRes = await fetch("/api/partners/me");
        const meData = await meRes.json();
        const allListings: Partner[] = meData?.data ?? [];

        if (cancelled) return;
        setListings(allListings);

        // Fetch promotions + reviews for each listing
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
              const promos: Promotion[] = promoData?.data ?? [];
              const reviews: Review[] = reviewData?.data ?? [];
              const withRating = reviews.filter((r) => r.rating > 0);
              statsMap[p.id] = {
                promotions: promos.length,
                reviews: reviews.length,
                avgRating:
                  withRating.length > 0
                    ? withRating.reduce((s, r) => s + r.rating, 0) / withRating.length
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
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- derived stats ---------- */
  const totalListings = listings.length;
  const activeListings = listings.filter((p) => p.status === "approved").length;
  const pendingListings = listings.filter((p) => p.status === "pending").length;
  const totalPromotions = Object.values(stats).reduce((s, v) => s + v.promotions, 0);
  const totalReviews = Object.values(stats).reduce((s, v) => s + v.reviews, 0);
  const totalImpressions = listings.reduce((s, p) => s + (p.impression_count ?? 0), 0);
  const totalClicks = listings.reduce((s, p) => s + (p.click_count ?? 0), 0);
  const allRatings = Object.values(stats)
    .filter((v) => v.avgRating > 0)
    .map((v) => v.avgRating);
  const overallAvg =
    allRatings.length > 0
      ? (allRatings.reduce((s, r) => s + r, 0) / allRatings.length).toFixed(1)
      : "-";

  return (
    <>
      <Header activeId="dashboard" />
      <main className="flex-1 overflow-y-auto">

        {/* ── Hero Banner ── */}
        <div className="relative h-72 md:h-80 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1707378174003-418d6262d355?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHVndSUyMGpvZ2phfGVufDB8fDB8fHww"
            alt="Tugu Jogja"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f100c]/90 via-[#0f100c]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f100c]/60 via-transparent to-[#0f100c]/30" />
          <div className="absolute inset-0 flex items-end p-8">
            <div>
              <p className="text-xs font-mono text-gold-400 uppercase tracking-widest mb-1.5">
                Jogjagem Partner
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold leading-[1.05] tracking-tight">
                Sugeng Rawuh, Partner!
              </h2>
              <p className="text-sm text-white/75 leading-relaxed max-w-lg font-light mt-2">
                Kelola bisnis pariwisata Anda di Jogjagem dari satu tempat.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">

          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-semibold">Loading overview...</span>
            </div>
          ) : (
            <>
              {/* ── Stats Grid ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Briefcase}
                  label="Total Listings"
                  value={totalListings}
                  color="#8B5E3C"
                  borderColor="#8B5E3C"
                />
                <StatCard
                  icon={CheckCircle}
                  label="Active"
                  value={activeListings}
                  color="#10b981"
                  borderColor="#10b981"
                />
                <StatCard
                  icon={Tag}
                  label="Promotions"
                  value={totalPromotions}
                  color="#6366f1"
                  borderColor="#6366f1"
                />
                <StatCard
                  icon={Star}
                  label="Avg Rating"
                  value={overallAvg}
                  color="#f59e0b"
                  borderColor="#f59e0b"
                />
              </div>

              {/* ── Insights Row ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Stats */}
                <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 font-display">
                      Statistik Performa
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-gray-700 font-display">
                          Impressions
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-gray-900">
                        {totalImpressions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                      <div className="flex items-center gap-2">
                        <MousePointerClick className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-bold text-gray-700 font-display">
                          Clicks
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-gray-900">
                        {totalClicks.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-bold text-gray-700 font-display">
                          Total Reviews
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-gray-900">
                        {totalReviews}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-gray-700 font-display">
                          Pending Review
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-gray-900">
                        {pendingListings}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-card border border-border shadow-soft">
                  <h4 className="text-sm font-bold text-gray-800 font-display mb-4">
                    Aksi Cepat
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "Kelola Listings", icon: Briefcase, path: "/partner/listings" },
                      { label: "Buat Promosi", icon: Tag, path: "/partner/promotions" },
                      { label: "Lihat Reviews", icon: MessageSquare, path: "/partner/reviews" },
                    ].map((a) => (
                      <Link
                        key={a.path}
                        href={a.path}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-premium group"
                      >
                        <a.icon className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                        <span className="text-xs font-bold text-gray-700 font-display group-hover:text-primary transition-colors">
                          {a.label}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary ml-auto" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Listings Preview */}
                <div className="bg-white p-6 rounded-card border border-border shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-800 font-display">
                      Listings Anda
                    </h4>
                    <Link
                      href="/partner/listings"
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  {listings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                      <Briefcase className="w-8 h-8" />
                      <span className="text-xs font-semibold">Belum ada listing</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {listings.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-premium group"
                        >
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Briefcase className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-gray-800 font-display block truncate group-hover:text-primary transition-colors">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {p.location && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {p.location}
                                </span>
                              )}
                              {stats[p.id] && stats[p.id].avgRating > 0 && (
                                <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                  {stats[p.id].avgRating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              p.status === "approved"
                                ? "bg-success/10 text-success"
                                : p.status === "pending"
                                ? "bg-warning/10 text-warning"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {p.status === "approved"
                              ? "Active"
                              : p.status === "pending"
                              ? "Pending"
                              : p.status ?? "Unknown"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
