"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header";
import Pagination from "@/components/Pagination";
import { useToast } from "@/components/Toast";
import { Calendar, MapPin, Search, Plus, FileSpreadsheet, X, Trash2, Loader2, CheckSquare, Edit3, Tag } from "lucide-react";
import type { Event, PaginationMeta } from "@/types";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  { value: "",          label: "All Statuses" },
  { value: "draft",     label: "Draft" },
  { value: "active",    label: "Active" },
  { value: "upcoming",  label: "Upcoming" },
  { value: "popular",   label: "Popular" },
  { value: "limited",   label: "Limited" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const QUALITY_OPTIONS = [
  { value: "",          label: "All Quality" },
  { value: "excellent",  label: "Excellent (80+)" },
  { value: "good",       label: "Good (60–79)" },
  { value: "needs_work", label: "Needs Work (< 60)" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function matchesSearch(e: Event, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  return (
    e.title.toLowerCase().includes(n) ||
    (e.location ?? "").toLowerCase().includes(n) ||
    (e.category ?? "").toLowerCase().includes(n) ||
    (e.description ?? "").toLowerCase().includes(n)
  );
}

function matchesCategory(e: Event, filter: string): boolean {
  if (!filter) return true;
  return (e.category ?? "").toLowerCase() === filter.toLowerCase();
}

function matchesStatus(e: Event, filter: string): boolean {
  if (!filter) return true;
  return (e.status ?? "").toLowerCase() === filter.toLowerCase();
}

// Mirrors the thresholds in event/quality.go (VerdictExcellent >= 80,
// VerdictGood >= 60). Events never scored yet (content_score undefined, e.g.
// rows created before this rubric existed) fall into "needs_work" so they
// surface for review instead of being silently treated as fine.
function matchesQuality(score: number | undefined, filter: string): boolean {
  if (!filter) return true;
  const s = score ?? 0;
  if (filter === "excellent")  return s >= 80;
  if (filter === "good")       return s >= 60 && s < 80;
  if (filter === "needs_work") return s < 60;
  return true;
}

function applyFilters(all: Event[], search: string, category: string, status: string, quality: string): Event[] {
  return all.filter(e =>
    matchesSearch(e, search) &&
    matchesCategory(e, category) &&
    matchesStatus(e, status) &&
    matchesQuality(e.content_score, quality)
  );
}

function statusColor(s?: string) {
  switch (s) {
    case "active":    return "bg-success/10 text-success";
    case "upcoming":  return "bg-blue-50 text-blue-600";
    case "popular":   return "bg-primary/10 text-primary";
    case "limited":   return "bg-warning/10 text-warning";
    case "completed": return "bg-gray-100 text-gray-500";
    case "cancelled": return "bg-danger/10 text-danger";
    case "draft":     return "bg-gray-100 text-gray-400";
    default:          return "bg-warning/10 text-warning";
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function EventsPage() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [allItems,  setAllItems]  = useState<Event[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm,  setConfirm]  = useState<{ ids: string[]; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [status,   setStatus]   = useState(searchParams.get("status") || "");
  const [quality,  setQuality]  = useState(searchParams.get("quality") || "");

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (search)   params.set("search", search);
    if (category) params.set("category", category);
    if (status)   params.set("status", status);
    if (quality)  params.set("quality", quality);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [search, category, status, quality, router, pathname]);

  const didInit = useRef(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const pages: Event[] = [];
      let p = 1;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const res  = await fetch(`/api/events?page=${p}&limit=100`);
        const json = await res.json();
        const batch: Event[] = json?.data ?? [];
        pages.push(...batch);
        const meta = json?.meta;
        if (!meta || p >= meta.total_pages) break;
        p++;
      }
      pages.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
      setAllItems(pages);
    } catch {
      showToast("Error", "Failed to load events", "error");
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

  useEffect(() => { setPage(1); }, [search, category, status, quality]);

  // Derived categories
  const knownCategories = Array.from(
    new Set(allItems.map(e => e.category).filter(Boolean))
  ).sort() as string[];

  // Filtered + paginated
  const filtered   = applyFilters(allItems, search, category, status, quality);
  const anyFilter  = !!(search || category || status || quality);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const meta: PaginationMeta = {
    total: filtered.length,
    page: safePage,
    limit: PAGE_SIZE,
    total_pages: totalPages,
  };

  // Export CSV
  async function exportCSV() {
    setExporting(true);
    try {
      const rows = [["Title", "Category", "Location", "Start Date", "End Date", "Ticket Price", "Quality Score", "Status"]];
      filtered.forEach(e => rows.push([
        e.title, e.category ?? "", e.location ?? "",
        e.start_date ?? "", e.end_date ?? "",
        e.ticket_price ?? "", String(e.content_score ?? 0), e.status ?? "",
      ]));
      const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
      const a   = document.createElement("a");
      a.href    = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      a.download = "events.csv";
      a.click();
      showToast("Export", `${filtered.length} events exported`, "success");
    } catch {
      showToast("Error", "Export failed", "error");
    } finally {
      setExporting(false);
    }
  }

  const clearFilters = () => { setSearch(""); setCategory(""); setStatus(""); setQuality(""); };

  // Selection + delete
  const pageIds        = paged.map(e => e.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));

  const toggleAllPage = () => {
    setSelected(prev => {
      const n = new Set(prev);
      if (allPageSelected) pageIds.forEach(id => n.delete(id));
      else pageIds.forEach(id => n.add(id));
      return n;
    });
  };

  const toggleOne = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  async function confirmDelete() {
    if (!confirm) return;
    setDeleting(true);
    try {
      const results = await Promise.all(
        confirm.ids.map(id =>
          fetch(`/api/events/${id}`, { method: "DELETE" }).then(r => r.ok)
        )
      );
      const ok     = results.filter(Boolean).length;
      const failed = results.length - ok;
      const gone   = new Set(confirm.ids);
      setAllItems(prev => prev.filter(e => !gone.has(e.id)));
      setSelected(new Set());
      if (failed === 0) {
        showToast("Deleted", `${ok} event${ok === 1 ? "" : "s"} deleted`, "success");
      } else {
        showToast("Partial", `${ok} deleted, ${failed} failed`, "warning");
      }
    } catch {
      showToast("Error", "Network error", "error");
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  }

  return (
    <>
      <Header activeId="events" />
      <main className="flex-1 overflow-y-auto p-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
              Cultural Events & Festival Calendar
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {anyFilter ? (
                <>Showing <span className="font-bold text-gray-700">{filtered.length}</span> of {allItems.length} events</>
              ) : allItems.length > 0 ? (
                <>Total <span className="font-bold text-gray-700">{allItems.length.toLocaleString()}</span> events in the system</>
              ) : "Manage ticketing states, event categories, and promotional schedules."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportCSV} disabled={exporting}
              className="flex items-center gap-2 bg-white hover:bg-bg border border-border text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-apple transition-premium cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-gray-500" />
              <span>{exporting ? "Exporting…" : "Export CSV"}</span>
            </button>
            <Link
              href="/events/create"
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition-premium cursor-pointer"
            >
              <Plus className="w-4 h-4" /><span>Add Event</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, location, category…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition font-medium"
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Categories</option>
            {knownCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={quality} onChange={e => setQuality(e.target.value)}
            title="Content quality score (from the AI content quality gate)"
            className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
            {QUALITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="flex gap-2 md:col-span-2">
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="flex-1 bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {anyFilter && (
              <button
                onClick={clearFilters} title="Clear filters"
                className="px-2.5 py-2 rounded-xl border border-border bg-white hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-red-50/60 border border-red-200 rounded-card px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={toggleAllPage}
                className="flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-800 cursor-pointer">
                <CheckSquare className="w-4 h-4" />
                {allPageSelected ? "Deselect page" : "Select all on page"}
              </button>
              <span className="text-xs font-semibold text-gray-500">{selected.size} selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected(new Set())}
                className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-2 cursor-pointer">
                Clear
              </button>
              <button
                onClick={() => setConfirm({ ids: [...selected], label: `${selected.size} events` })}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleAllPage}
                      disabled={paged.length === 0}
                      className="w-4 h-4 accent-primary cursor-pointer disabled:opacity-40"
                      title="Select all on page"
                    />
                  </th>
                  <th className="py-4 px-6">Event</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Ticket</th>
                  <th className="py-4 px-4 text-center">Quality</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {loading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4" />
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-bg shrink-0" />
                          <div className="space-y-2">
                            <div className="h-3 w-40 bg-bg rounded" />
                            <div className="h-2 w-24 bg-bg rounded" />
                          </div>
                        </div>
                      </td>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="py-4 px-4"><div className="h-3 w-16 bg-bg rounded" /></td>
                      ))}
                      <td className="py-4 px-6" />
                    </tr>
                  ))
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="w-10 h-10" />
                        <span className="text-sm font-semibold">
                          {anyFilter ? "No events match the current filters" : "No events found"}
                        </span>
                        {anyFilter && (
                          <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : paged.map(ev => (
                  <tr key={ev.id} className="hover:bg-bg/40 transition-premium">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selected.has(ev.id)}
                        onChange={() => toggleOne(ev.id)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-bg shrink-0 relative">
                          {ev.image_url ? (
                            <Image
                              src={ev.image_url} alt={ev.title}
                              width={48} height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Calendar className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link href={`/events/${ev.id}`} className="text-sm font-bold text-gray-900 font-display hover:text-primary transition-colors block">
                            {ev.title}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {ev.category ? (
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-display capitalize">
                          {ev.category}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {ev.location ? (
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{ev.location}</span>
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {ev.start_date ? (
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>
                            {ev.start_date}
                            {ev.end_date && ev.end_date !== ev.start_date ? ` – ${ev.end_date}` : ""}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {ev.ticket_price ? (
                        <span className="flex items-center gap-1 text-primary font-bold">
                          <Tag className="w-3 h-3 shrink-0" />
                          {ev.ticket_price}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {(() => {
                        const score = ev.content_score ?? 0;
                        const tone = score >= 80 ? "bg-success/10 text-success"
                          : score >= 60 ? "bg-primary/10 text-primary"
                          : "bg-red-50 text-red-600";
                        return (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${tone}`}>
                            {score}/100
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${statusColor(ev.status)}`}>
                        {ev.status ?? "draft"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/events/${ev.id}`}
                        className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 hover:text-text cursor-pointer transition-premium inline-flex"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setConfirm({ ids: [ev.id], label: ev.title })}
                        title="Delete event"
                        className="p-1.5 rounded-lg border border-border hover:bg-red-50 hover:border-red-200 text-gray-500 hover:text-red-600 cursor-pointer transition-premium inline-flex ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

      {/* Delete Confirmation Modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Delete {confirm.ids.length > 1 ? "Events?" : "Event?"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="font-semibold text-gray-700">{confirm.label}</span> will be permanently removed. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-gray-700 hover:bg-bg transition cursor-pointer">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2">
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
