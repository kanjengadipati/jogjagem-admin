"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import Header from "@/components/Header";
import Pagination from "@/components/Pagination";
import { useToast } from "@/components/Toast";
import { firstImage } from "@/lib/images";
import { DownloadCloud, FileSpreadsheet, Plus, Search, Star, Edit3, X } from "lucide-react";
import type { Destination, PaginationMeta } from "@/types";

const PAGE_SIZE = 25;
const CATEGORIES = ["Temple","Beach","Nature","Heritage","Cultural","Culinary","Shopping","Adventure","hidden-gem","family","weekend","sunset","sunrise","camping"];
const REGIONS    = ["Sleman","Bantul","Yogyakarta","Gunungkidul","Kulon Progo","Near Yogyakarta"];
const RATING_OPTIONS = [
  { value: "",     label: "All Ratings" },
  { value: "high", label: "High (4.5+)" },
  { value: "mid",  label: "Mid (3.5–4.5)" },
  { value: "low",  label: "Low (< 3.5)" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function matchesRegion(subRegion: string | undefined, filter: string): boolean {
  if (!filter) return true;          // no filter → show all
  if (!subRegion) return false;      // filter active but no region on record → hide
  const sr = subRegion.toLowerCase();
  const f  = filter.toLowerCase();
  // "Yogyakarta" should match both "Yogyakarta" and "Kota Yogyakarta"
  return sr === f || sr.includes(f) || f.includes(sr);
}

function matchesCategory(d: Destination, filter: string): boolean {
  if (!filter) return true;
  const f   = filter.toLowerCase();
  const cat = (d.category ?? "").toLowerCase();
  const bt  = (d.best_time ?? "").toLowerCase();
  const nm  = (d.name ?? "").toLowerCase();
  const tag = (d.tagline ?? "").toLowerCase();
  const desc = (d.description ?? "").toLowerCase();

  // ── Virtual / computed categories ────────────────────────────────────────
  if (f === "hidden-gem") return (d.rating ?? 0) >= 4.5 && (d.review_count ?? 0) < 2500;
  if (f === "sunset")    return bt.includes("sore") || bt.includes("sunset");
  if (f === "sunrise")   return bt.includes("sunrise") || bt.includes("fajar") || bt.includes("dawn");
  if (f === "camping")   return bt.includes("camping");
  if (f === "weekend")   return bt.includes("weekend") || tag.includes("weekend") || desc.includes("weekend");
  if (f === "family")    return tag.includes("keluarga") || tag.includes("family") || desc.includes("keluarga") || desc.includes("family");
  if (f === "temple" || f === "candi") {
    return cat === "temple" || cat === "candi" ||
      nm.includes("candi") || nm.includes("temple") ||
      tag.includes("candi") || tag.includes("temple");
  }

  // ── Real DB category (case-insensitive exact match) ───────────────────────
  return cat === f;
}

function matchesSearch(d: Destination, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    d.name.toLowerCase().includes(needle) ||
    (d.location ?? "").toLowerCase().includes(needle) ||
    (d.sub_region ?? "").toLowerCase().includes(needle) ||
    (d.category ?? "").toLowerCase().includes(needle)
  );
}

function matchesRating(rating: number | undefined, filter: string): boolean {
  if (!filter) return true;
  const r = rating ?? 0;
  if (filter === "high") return r >= 4.5;
  if (filter === "mid")  return r >= 3.5 && r < 4.5;
  if (filter === "low")  return r < 3.5;
  return true;
}

function applyFilters(all: Destination[], search: string, category: string, region: string, rating: string): Destination[] {
  return all.filter(d =>
    matchesSearch(d, search) &&
    matchesCategory(d, category) &&
    matchesRegion(d.sub_region, region) &&
    matchesRating(d.rating, rating)
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DestinationsPage() {
  const { showToast } = useToast();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [allItems,  setAllItems]  = useState<Destination[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);

  // ── Filter / page state ─────────────────────────────────────────────────────
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("");
  const [region,   setRegion]   = useState("");
  const [rating,   setRating]   = useState("");

  // Track whether we've done the initial full fetch
  const didInit = useRef(false);

  // ── Fetch ALL destinations on mount (for client-side filtering) ─────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const pages: Destination[] = [];
      let p = 1;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const res  = await fetch(`/api/destinations?page=${p}&limit=100`);
        const json = await res.json();
        const batch: Destination[] = json?.data ?? [];
        pages.push(...batch);
        const meta = json?.meta;
        if (!meta || p >= meta.total_pages) break;
        p++;
      }
      pages.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
      setAllItems(pages);
    } catch {
      showToast("Error", "Failed to load destinations", "error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      fetchAll();
    }
  }, [fetchAll]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, category, region, rating]);

  // ── Filtered + paginated ────────────────────────────────────────────────────
  const filtered = applyFilters(allItems, search, category, region, rating);
  const anyFilter = !!(search || category || region || rating);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const meta: PaginationMeta = {
    total: filtered.length,
    page: safePage,
    limit: PAGE_SIZE,
    total_pages: totalPages,
  };

  // ── Export CSV ──────────────────────────────────────────────────────────────
  async function exportCSV() {
    setExporting(true);
    try {
      const rows = [["Name","Category","Region","Rating","Reviews"]];
      filtered.forEach(d => rows.push([d.name, d.category ?? "", d.sub_region ?? "", String(d.rating ?? 0), String(d.review_count ?? 0)]));
      const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
      const a   = document.createElement("a");
      a.href    = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      a.download = "destinations.csv";
      a.click();
      showToast("Export", `${filtered.length} destinations exported`, "success");
    } catch {
      showToast("Error", "Export failed", "error");
    } finally {
      setExporting(false);
    }
  }

  const clearFilters = () => { setSearch(""); setCategory(""); setRegion(""); setRating(""); };

  return (
    <>
      <Header activeId="destinations" />
      <main className="flex-1 overflow-y-auto p-8 space-y-6">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
              Destination Registry
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {anyFilter ? (
                <>Showing <span className="font-bold text-gray-700">{filtered.length}</span> of {allItems.length} destinations</>
              ) : allItems.length > 0 ? (
                <>Total <span className="font-bold text-gray-700">{allItems.length.toLocaleString()}</span> destinations in the system</>
              ) : "Manage locations, categories, AI scoring, and publishing statuses."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportCSV}
              disabled={exporting}
              className="flex items-center gap-2 bg-white hover:bg-bg border border-border text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-apple transition-premium cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-gray-500" />
              <span>{exporting ? "Exporting…" : "Export CSV"}</span>
            </button>
            <Link
              href="/destinations/create"
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition-premium cursor-pointer"
            >
              <Plus className="w-4 h-4" /><span>Add Destination</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, location, region…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition font-medium"
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={region} onChange={e => setRegion(e.target.value)}
            className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="flex gap-2">
            <select value={rating} onChange={e => setRating(e.target.value)}
              className="flex-1 bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
              {RATING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {anyFilter && (
              <button
                onClick={clearFilters}
                title="Clear filters"
                className="px-2.5 py-2 rounded-xl border border-border bg-white hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Destination</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Region</th>
                  <th className="py-4 px-4 text-center">Rating</th>
                  <th className="py-4 px-4 text-center">Reviews</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {loading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-bg" />
                          <div className="space-y-2">
                            <div className="h-3 w-36 bg-bg rounded" />
                            <div className="h-2 w-24 bg-bg rounded" />
                          </div>
                        </div>
                      </td>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="py-4 px-4"><div className="h-3 w-16 bg-bg rounded mx-auto" /></td>
                      ))}
                      <td className="py-4 px-6" />
                    </tr>
                  ))
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <Search className="w-10 h-10" />
                        <span className="text-sm font-semibold">
                          {anyFilter ? "No destinations match the current filters" : "No destinations found"}
                        </span>
                        {anyFilter && (
                          <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : paged.map(dest => (
                  <tr key={dest.id} className="hover:bg-bg/40 transition-premium">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <Image
                          src={firstImage(dest.images)} alt={dest.name}
                          width={48} height={48}
                          className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div>
                          <Link href={`/destinations/${dest.id}`} className="text-sm font-bold text-gray-900 font-display hover:text-primary transition-colors block">
                            {dest.name}
                          </Link>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {dest.location || dest.sub_region || "Yogyakarta"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-display">
                        {dest.category || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold">{dest.sub_region || "N/A"}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-warning">
                        <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                        {dest.rating ? dest.rating.toFixed(1) : "0.0"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-gray-800">
                      {(dest.review_count ?? 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${dest.status === "published" ? "bg-success/10 text-success" : dest.status === "draft" ? "bg-warning/10 text-warning" : "bg-gray-100 text-gray-500"}`}>
                        {dest.status ?? "published"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/destinations/${dest.id}`}
                        className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 hover:text-text cursor-pointer transition-premium inline-flex"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="px-6 py-4">
            {filtered.length > 0 && (
              <Pagination meta={meta} onPageChange={setPage} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
