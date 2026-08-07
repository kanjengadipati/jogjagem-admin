import Link from "next/link";
import Image from "next/image";
import { requireToken } from "@/lib/auth";
import { fetchWithAuth, backendFetch } from "@/lib/api";
import { firstImage } from "@/lib/images";
import Header from "@/components/Header";
import type { Destination, Event } from "@/types";
import EventItem from "@/components/EventItem";
import {
  MapPin,
  Users,
  Database,
  Sparkles,
  ArrowUpRight,
  Plus,
  Calendar,
  MessageSquare,
  Star,
  TrendingUp,
  RefreshCw,
  Layers,
  Zap,
  BarChart3,
  Briefcase,
  Clock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type Meta = { total?: number };
type Wrapper<T> = { data?: T; meta?: Meta };

async function fetchCount(
  api: ReturnType<typeof fetchWithAuth>,
  path: string
): Promise<number> {
  try {
    const res = await api(path);
    if (res.status === 200) return (res.data as Wrapper<unknown>)?.meta?.total ?? 0;
  } catch {}
  return 0;
}

async function fetchData<T>(
  api: ReturnType<typeof fetchWithAuth>,
  path: string
): Promise<T[]> {
  try {
    const res = await api(path);
    if (res.status === 200) return ((res.data as Wrapper<T[]>)?.data as T[]) ?? [];
  } catch {}
  return [];
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  borderColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div
      className="bg-white p-6 rounded-card border border-border shadow-soft hover-scale relative overflow-hidden"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="absolute right-0 top-0 w-16 h-16 rounded-bl-full flex items-center justify-center" style={{ backgroundColor: `${borderColor}10` }}>
        <Icon className="w-5 h-5" style={{ color: borderColor }} />
      </div>
      <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase font-display">{label}</p>
      <h3 className="text-3xl font-extrabold text-gray-900 font-display mt-2 leading-none">{value}</h3>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: "Tambah Destinasi", icon: Plus, path: "/destinations/create" },
    { label: "Tambah Event", icon: Calendar, path: "/events" },
    { label: "Moderasi Review", icon: MessageSquare, path: "/reviews" },
    { label: "Travel Stories", icon: Sparkles, path: "/stories" },
    { label: "Run Scraper", icon: RefreshCw, path: "/scraper" },
    { label: "Kelola Pengguna", icon: Users, path: "/users" },
    { label: "Hotels", icon: Layers, path: "/hotels" },
    { label: "Promosi", icon: Zap, path: "/promotions" },
    { label: "Approval Bisnis", icon: Briefcase, path: "/businesses" },
  ];

  return (
    <div className="bg-white p-6 rounded-card border border-border shadow-soft">
      <h4 className="text-sm font-bold text-gray-800 font-display mb-4">Aksi Cepat</h4>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <Link
            key={a.path}
            href={a.path}
            className="flex items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-premium group"
          >
            <a.icon className="w-4 h-4 text-gray-400 group-hover:text-primary" />
            <span className="text-[11px] font-bold text-gray-700 font-display group-hover:text-primary transition-colors">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CategoryBreakdown({ destinations }: { destinations: { category?: string }[] }) {
  const catCount: Record<string, number> = {};
  destinations.forEach((d) => {
    if (d.category) catCount[d.category] = (catCount[d.category] || 0) + 1;
  });
  const sorted = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = sorted.length > 0 ? sorted[0][1] : 1;
  const colors = ["#8B5E3C", "#B68D40", "#D4A853", "#6B8E23", "#2E8B57"];

  return (
    <div className="bg-white p-6 rounded-card border border-border shadow-soft">
      <h4 className="text-sm font-bold text-gray-800 font-display mb-4">Kategori Destinasi</h4>
      {sorted.length === 0 ? (
        <p className="text-xs text-gray-400">Belum ada data</p>
      ) : (
        <div className="space-y-3">
          {sorted.map(([cat, count], i) => (
            <div key={cat}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-700 font-display">{cat}</span>
                <span className="text-xs font-extrabold text-gray-900">{count}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(count / max) * 100}%`, backgroundColor: colors[i % colors.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceList({
  title,
  items,
  viewAllHref,
  renderItem,
}: {
  title: string;
  items: unknown[];
  viewAllHref: string;
  renderItem: (item: unknown, i: number) => React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-card border border-border shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-gray-800 font-display">{title}</h4>
        <Link href={viewAllHref} className="text-xs font-bold text-primary hover:underline">
          View All
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">Belum ada data</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i}>{renderItem(item, i)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function DashboardPage() {
  const token = await requireToken();
  const api = fetchWithAuth(token);

  /* ---------- fetch counts (limit=1 to get meta.total only) ---------- */
  const [destCount, eventCount, userCount] = await Promise.all([
    fetchCount(api, "/destinations?limit=1"),
    fetchCount(api, "/events?limit=1"),
    fetchCount(api, "/auth/admin/users?limit=1"),
  ]);

  /* ---------- fetch business counts ---------- */
  const bizRes = await api("/auth/admin/businesses");
  const bizPayload = bizRes.data as { data?: { status?: string }[] } | { status?: string }[] | null;
  const allBusinesses: { status?: string }[] = Array.isArray(bizPayload)
    ? bizPayload
    : Array.isArray((bizPayload as { data?: { status?: string }[] })?.data)
    ? (bizPayload as { data: { status?: string }[] }).data
    : [];
  const bizTotal = allBusinesses.length;
  const bizPending = allBusinesses.filter((b) => b.status === "pending").length;
  const bizApproved = allBusinesses.filter((b) => b.status === "approved").length;

  /* ---------- fetch preview data ---------- */
  const [previewDests, previewEvents, healthRes] = await Promise.all([
    fetchData<Destination & { review_count?: number; rating?: number }>(api, "/destinations?limit=4"),
    fetchData<Event & { badge?: string; start_date?: string; location?: string }>(api, "/events?limit=4"),
    backendFetch("/health"),
  ]);

  const backendConnected = healthRes.status === 200;

  /* ---------- derived stats ---------- */
  const totalReviews = previewDests.reduce((s, d) => s + (d.review_count ?? 0), 0);
  const withRating = previewDests.filter((d) => (d.rating ?? 0) > 0);
  const avgRating =
    withRating.length > 0
      ? (withRating.reduce((s, d) => s + (d.rating ?? 0), 0) / withRating.length).toFixed(1)
      : "-";

  /* ---------- category breakdown for insight ---------- */
  const allDests: { category?: string }[] = [];
  {
    let p = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const batch = await fetchData<{ category?: string }>(api, `/destinations?page=${p}&limit=100`);
      allDests.push(...batch);
      if (batch.length < 100) break;
      p++;
    }
  }
  const catCount: Record<string, number> = {};
  allDests.forEach((d) => {
    if (d.category) catCount[d.category] = (catCount[d.category] || 0) + 1;
  });
  const topCategory = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];

  const upcomingCount = previewEvents.filter((e) => e.badge === "akan_datang").length;

  return (
    <>
      <Header activeId="dashboard" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-white p-6 rounded-3xl border border-primary/10 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
              Sugeng Rawuh, Admin!
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Kelola ekosistem pariwisata Yogyakarta dari satu tempat.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/destinations/create"
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition-premium cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Destination</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={MapPin} label="Destinasi" value={destCount} color="#8B5E3C" bgColor="#fdf8f0" borderColor="#8B5E3C" />
          <StatCard icon={Calendar} label="Events" value={eventCount} color="#6366f1" bgColor="#eef2ff" borderColor="#6366f1" />
          <StatCard icon={Users} label="Pengguna" value={userCount} color="#0ea5e9" bgColor="#f0f9ff" borderColor="#0ea5e9" />
          <StatCard icon={Database} label="Backend" value={backendConnected ? "Online" : "Offline"} color={backendConnected ? "#10b981" : "#ef4444"} bgColor={backendConnected ? "#ecfdf5" : "#fef2f2"} borderColor={backendConnected ? "#10b981" : "#ef4444"} />
        </div>

        {/* Partner Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={Briefcase} label="Total Bisnis" value={bizTotal} color="#d97706" bgColor="#fffbeb" borderColor="#d97706" />
          <StatCard icon={Clock} label="Bisnis Pending" value={bizPending} color="#f59e0b" bgColor="#fef3c7" borderColor="#f59e0b" />
          <StatCard icon={Briefcase} label="Bisnis Aktif" value={bizApproved} color="#10b981" bgColor="#ecfdf5" borderColor="#10b981" />
        </div>

        {/* Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Stats */}
          <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-gray-800 font-display">Statistik Singkat</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-bold text-gray-700 font-display">Rata-rata Rating</span>
                </div>
                <span className="text-sm font-extrabold text-gray-900">{avgRating}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-gray-700 font-display">Total Review</span>
                </div>
                <span className="text-sm font-extrabold text-gray-900">{totalReviews}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold text-gray-700 font-display">Kategori</span>
                </div>
                <span className="text-sm font-extrabold text-gray-900">{Object.keys(catCount).length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold text-gray-700 font-display">Event Akan Datang</span>
                </div>
                <span className="text-sm font-extrabold text-gray-900">{upcomingCount}</span>
              </div>
              {bizPending > 0 && (
                <Link href="/businesses" className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-700 font-display">Bisnis Menunggu Review</span>
                  </div>
                  <span className="text-sm font-extrabold text-amber-700">{bizPending}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="lg:col-span-2">
            <CategoryBreakdown destinations={allDests} />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Destinations */}
          <ResourceList
            title="Destinasi Terbaru"
            items={previewDests}
            viewAllHref="/destinations"
            renderItem={(item) => {
              const d = item as Destination;
              const thumb = firstImage(d.images);
              return (
                <Link
                  key={d.id}
                  href={`/destinations/${d.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-premium group"
                >
                  <Image
                    src={thumb}
                    alt={d.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-gray-800 font-display block group-hover:text-primary transition-colors truncate">
                      {d.name}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate block">
                      {d.sub_region || ""} {d.sub_region && d.category ? "·" : ""} {d.category || ""}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary flex-shrink-0" />
                </Link>
              );
            }}
          />

          {/* Upcoming Events */}
          <ResourceList
            title="Event Mendatang"
            items={previewEvents}
            viewAllHref="/events"
            renderItem={(item) => <EventItem event={item as Event & { badge?: string }} />}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

      </main>
    </>
  );
}
