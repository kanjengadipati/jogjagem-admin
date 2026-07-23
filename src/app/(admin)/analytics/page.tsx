"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  TrendingUp, Users, MapPin, Star, Calendar, BookOpen,
  Briefcase, Hotel, Utensils, ShoppingBag, Car, RefreshCw,
  MessageSquare, Tag, Activity,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";

interface Overview {
  total_destinations: number;
  total_events: number;
  total_users: number;
  total_reviews: number;
  total_stories: number;
  total_partners: number;
  total_hotels: number;
  total_restaurants: number;
  total_guides: number;
  total_souvenirs: number;
  total_rentals: number;
  total_articles: number;
  total_trips: number;
  total_promotions: number;
  pending_image_reports: number;
  pending_staging: number;
  avg_rating: number;
  total_review_ratings: number;
}

interface TopDestination {
  name: string;
  category: string;
  rating: number;
  review_count: number;
  location: string;
}

interface CategoryStat {
  category: string;
  count: number;
}

interface SubRegionStat {
  sub_region: string;
  count: number;
}

interface ActivityItem {
  type: string;
  id: number;
  name: string;
  created_at: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  destination: MapPin,
  event: Calendar,
  review: MessageSquare,
  user: Users,
  story: BookOpen,
};

const TYPE_COLORS: Record<string, string> = {
  destination: "bg-blue-100 text-blue-600",
  event: "bg-purple-100 text-purple-600",
  review: "bg-yellow-100 text-yellow-600",
  user: "bg-green-100 text-green-600",
  story: "bg-pink-100 text-pink-600",
};

export default function AnalyticsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [topDests, setTopDests] = useState<TopDestination[]>([]);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [subRegions, setSubRegions] = useState<SubRegionStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  async function loadData() {
    setLoading(true);
    try {
      const [ovRes, tdRes, catRes, srRes, actRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/analytics/overview`).then(r => r.json()),
        fetch(`${BACKEND_URL}/admin/analytics/top-destinations`).then(r => r.json()),
        fetch(`${BACKEND_URL}/admin/analytics/categories`).then(r => r.json()),
        fetch(`${BACKEND_URL}/admin/analytics/sub-regions`).then(r => r.json()),
        fetch(`${BACKEND_URL}/admin/analytics/recent-activity`).then(r => r.json()),
      ]);
      setOverview(ovRes?.data ?? null);
      setTopDests(tdRes?.data ?? []);
      setCategories(catRes?.data ?? []);
      setSubRegions(srRes?.data ?? []);
      setRecentActivity(actRes?.data ?? []);
    } catch {
      showToast("Error", "Failed to load analytics data", "error");
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const statCards = overview ? [
    { label: "Total Destinations", value: overview.total_destinations.toLocaleString(), icon: MapPin, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Total Events", value: overview.total_events.toLocaleString(), icon: Calendar, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Total Users", value: overview.total_users.toLocaleString(), icon: Users, color: "text-green-500", bg: "bg-green-50" },
    { label: "Avg Rating", value: overview.avg_rating.toFixed(1), icon: Star, color: "text-yellow-500", bg: "bg-yellow-50", sub: `${overview.total_review_ratings} ratings` },
    { label: "Reviews", value: overview.total_reviews.toLocaleString(), icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Stories", value: overview.total_stories.toLocaleString(), icon: BookOpen, color: "text-pink-500", bg: "bg-pink-50" },
    { label: "Partners", value: overview.total_partners.toLocaleString(), icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Hotels", value: overview.total_hotels.toLocaleString(), icon: Hotel, color: "text-cyan-500", bg: "bg-cyan-50" },
  ] : [];

  const secondRow = overview ? [
    { label: "Restaurants", value: overview.total_restaurants.toLocaleString(), icon: Utensils, color: "text-red-500", bg: "bg-red-50" },
    { label: "Guides", value: overview.total_guides.toLocaleString(), icon: Users, color: "text-teal-500", bg: "bg-teal-50" },
    { label: "Souvenirs", value: overview.total_souvenirs.toLocaleString(), icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Rentals", value: overview.total_rentals.toLocaleString(), icon: Car, color: "text-violet-500", bg: "bg-violet-50" },
    { label: "Articles", value: overview.total_articles.toLocaleString(), icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Trips Planned", value: overview.total_trips.toLocaleString(), icon: MapPin, color: "text-sky-500", bg: "bg-sky-50" },
    { label: "Pending Reports", value: overview.pending_image_reports.toLocaleString(), icon: Activity, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Pending Staging", value: overview.pending_staging.toLocaleString(), icon: Tag, color: "text-orange-500", bg: "bg-orange-50" },
  ] : [];

  const maxCatCount = categories.length > 0 ? Math.max(...categories.map(c => c.count)) : 1;
  const maxTopVisits = topDests.length > 0 ? Math.max(...topDests.map(d => d.review_count), 1) : 1;

  return (
    <>
      <Header activeId="analytics" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Analytics Overview</h2>
            <p className="text-xs text-gray-500 mt-1">Real-time platform statistics from the database.</p>
          </div>
          <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Refresh">
            <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading && !overview ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading analytics...
          </div>
        ) : overview ? (
          <>
            {/* Row 1: Key stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {statCards.map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-white p-5 rounded-2xl border border-border shadow-soft relative overflow-hidden">
                    <div className={`absolute right-0 top-0 w-14 h-14 ${s.bg} rounded-bl-full flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase font-display">{s.label}</p>
                    <h3 className="text-2xl font-extrabold text-gray-900 font-display mt-2 leading-none">{s.value}</h3>
                    {s.sub && <span className="text-[10px] text-gray-400 mt-1 block">{s.sub}</span>}
                  </div>
                );
              })}
            </div>

            {/* Row 2: More stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {secondRow.map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-white p-5 rounded-2xl border border-border shadow-soft relative overflow-hidden">
                    <div className={`absolute right-0 top-0 w-14 h-14 ${s.bg} rounded-bl-full flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase font-display">{s.label}</p>
                    <h3 className="text-2xl font-extrabold text-gray-900 font-display mt-2 leading-none">{s.value}</h3>
                  </div>
                );
              })}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Destinations by Rating/Reviews */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-soft space-y-5">
                <h4 className="text-sm font-bold text-gray-800 font-display">Top Destinations by Reviews</h4>
                {topDests.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">No destination data yet</p>
                ) : (
                  <div className="space-y-4">
                    {topDests.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-4">
                        <span className="w-6 text-[11px] font-bold text-gray-400 flex-shrink-0">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-gray-800 font-display truncate">{d.name}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="flex items-center gap-0.5 text-[10px] text-yellow-500 font-bold">
                                <Star className="w-3 h-3 fill-yellow-400" /> {d.rating.toFixed(1)}
                              </span>
                              <span className="text-[10px] font-mono text-gray-500">{d.review_count}</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(d.review_count / maxTopVisits) * 100}%` }} />
                          </div>
                        </div>
                        {d.category && (
                          <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">{d.category}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-soft space-y-5">
                <h4 className="text-sm font-bold text-gray-800 font-display">Destinations by Category</h4>
                {categories.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">No category data yet</p>
                ) : (
                  <div className="space-y-3">
                    {categories.slice(0, 10).map(c => (
                      <div key={c.category}>
                        <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                          <span className="truncate">{c.category}</span>
                          <span className="text-primary flex-shrink-0 ml-2">{c.count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(c.count / maxCatCount) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-region breakdown */}
                {subRegions.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h5 className="text-xs font-bold text-gray-500 mb-3">By Sub-Region</h5>
                    <div className="flex flex-wrap gap-2">
                      {subRegions.map(sr => (
                        <span key={sr.sub_region} className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {sr.sub_region}: {sr.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-soft space-y-5">
              <h4 className="text-sm font-bold text-gray-800 font-display">Recent Activity</h4>
              {recentActivity.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item, i) => {
                    const Icon = ICON_MAP[item.type] || MapPin;
                    const colorClass = TYPE_COLORS[item.type] || "bg-gray-100 text-gray-600";
                    return (
                      <div key={`${item.type}-${item.id}-${i}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{item.name || `#${item.id}`}</p>
                          <p className="text-[10px] text-gray-400 capitalize">{item.type}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </>
  );
}
