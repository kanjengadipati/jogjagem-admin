import Link from "next/link";
import Image from "next/image";
import { requireToken } from "@/lib/auth";
import { fetchWithAuth, backendFetch } from "@/lib/api";
import { firstImage } from "@/lib/images";
import Header from "@/components/Header";
import type { Destination } from "@/types";
import { MapPin, Users, Database, Sparkles, ArrowUpRight, Plus } from "lucide-react";

export default async function DashboardPage() {
  const token = await requireToken();
  const api = fetchWithAuth(token);

  let destCount = 0;
  let userCount = 0;
  let destinations: Destination[] = [];
  let backendConnected = false;

  const [destRes, userRes, healthRes] = await Promise.all([
    api("/destinations"),
    api("/auth/admin/users"),
    backendFetch("/health"),
  ]);

  type DataWrapper<T> = { data?: T };
  if (destRes.status === 200 && (destRes.data as DataWrapper<Destination[]>)?.data) {
    destinations = (destRes.data as DataWrapper<Destination[]>).data!;
    destCount = destinations.length;
  }
  if (userRes.status === 200 && (userRes.data as DataWrapper<unknown[]>)?.data) {
    const users = (userRes.data as DataWrapper<unknown[]>).data!;
    userCount = Array.isArray(users) ? users.length : 0;
  }
  backendConnected = healthRes.status === 200;
  const aiActive = !!process.env.GEMINI_API_KEY;

  return (
    <>
      <Header activeId="dashboard" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-white p-6 rounded-3xl border border-primary/10 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
              Sugeng Rawuh, Admin! 👋
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Here is what&apos;s happening across the Jogjagem tourism ecosystem today.
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
          <div className="bg-white p-6 rounded-card border border-border shadow-soft hover-scale relative overflow-hidden">
            <div className="absolute right-0 top-0 w-16 h-16 bg-primary/5 rounded-bl-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase font-display">Destinations</p>
            <h3 className="text-3xl font-extrabold text-gray-900 font-display mt-2 leading-none">{destCount}</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success mt-3.5 bg-success/5 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3.5 h-3.5" /> from backend
            </span>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-soft hover-scale relative overflow-hidden">
            <div className="absolute right-0 top-0 w-16 h-16 bg-secondary/5 rounded-bl-full flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase font-display">Registered Users</p>
            <h3 className="text-3xl font-extrabold text-gray-900 font-display mt-2 leading-none">{userCount}</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary mt-3.5 bg-secondary/5 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3.5 h-3.5" /> from backend
            </span>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-soft hover-scale relative overflow-hidden">
            <div className="absolute right-0 top-0 w-16 h-16 bg-info/5 rounded-bl-full flex items-center justify-center">
              <Database className="w-5 h-5 text-info" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase font-display">Backend Status</p>
            <h3 className={`text-lg font-extrabold font-display mt-3 leading-none ${backendConnected ? "text-success" : "text-danger"}`}>
              {backendConnected ? "Connected" : "Disconnected"}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-info mt-2 bg-info/5 px-2 py-0.5 rounded-full">
              <span className={`w-2 h-2 rounded-full inline-block ${backendConnected ? "bg-success animate-pulse" : "bg-danger"}`} />
              {backendConnected ? "live" : "offline"}
            </span>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-soft hover-scale relative overflow-hidden">
            <div className="absolute right-0 top-0 w-16 h-16 bg-success/5 rounded-bl-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-success" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase font-display">AI Engine</p>
            <h3 className="text-lg font-extrabold font-display mt-3 leading-none text-gray-900">
              {aiActive ? "Active" : "Fallback"}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success mt-2 bg-success/5 px-2 py-0.5 rounded-full">
              gemini-2.5-flash
            </span>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="bg-white p-6 rounded-card border border-border shadow-soft lg:col-span-2 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-gray-800 font-display">Visitor Growth & Popularity Index</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Real-time visitor trends over the last week compared to peak season.
              </p>
            </div>
            <div className="h-64 w-full relative flex items-end">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5E3C" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#8B5E3C" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="50"  x2="600" y2="50"  stroke="#F1F1F0" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#F1F1F0" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="#F1F1F0" strokeWidth="1" strokeDasharray="4,4" />
                <path d="M0,180 L80,140 L160,150 L240,110 L320,130 L400,90 L480,80 L560,40 L600,60 L600,200 L0,200 Z" fill="url(#chartGradient)" />
                <path d="M0,170 Q80,160 160,130 T320,120 T480,90 T600,70" fill="none" stroke="#B68D40" strokeWidth="2" strokeDasharray="5,5" strokeLinecap="round" />
                <path d="M0,180 Q80,140 160,150 T240,110 T320,130 T400,90 T480,80 T560,40 L600,60" fill="none" stroke="#8B5E3C" strokeWidth="3" strokeLinecap="round" />
                <circle cx="560" cy="40" r="5" fill="#8B5E3C" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 tracking-wider uppercase font-display pt-2 border-t border-border">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-gray-800 font-display">AI Insights</h4>
            </div>
            <div className="p-4 rounded-2xl bg-bg border border-border">
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                &ldquo;High volcanic sunrise interests recorded from domestic travelers. Prioritize premium digital packages around Gunung Merapi paths.&rdquo;
              </p>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block font-display">Quick Actions</span>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/destinations" className="p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 text-center transition-premium group">
                  <MapPin className="w-5 h-5 mx-auto text-gray-500 group-hover:text-primary" />
                  <span className="text-[11px] font-bold text-gray-700 font-display block mt-1.5">Destinations</span>
                </Link>
                <Link href="/users" className="p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 text-center transition-premium group">
                  <Users className="w-5 h-5 mx-auto text-gray-500 group-hover:text-primary" />
                  <span className="text-[11px] font-bold text-gray-700 font-display block mt-1.5">Users</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Destinations */}
        {destinations.length > 0 && (
          <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-800 font-display">Recent Destinations</h4>
              <Link href="/destinations" className="text-xs font-bold text-primary hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {destinations.slice(0, 4).map((dest) => {
                const thumb = firstImage(dest.images);
                return (
                  <Link key={dest.id} href={`/destinations/${dest.id}`}
                    className="p-4 rounded-2xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-premium group"
                  >
                    <Image
                      src={thumb}
                      alt={dest.name}
                      width={200} height={96}
                      className="w-full h-24 rounded-xl object-cover mb-3"
                    />
                    <span className="text-xs font-bold text-gray-800 font-display block group-hover:text-primary transition-colors">{dest.name}</span>
                    <span className="text-[10px] text-gray-400">{dest.sub_region || ""} · {dest.category || ""}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
