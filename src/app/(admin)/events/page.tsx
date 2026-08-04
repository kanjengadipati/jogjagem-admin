"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Pagination from "@/components/Pagination";
import { useToast } from "@/components/Toast";
import { Calendar, MapPin, Search, Tag, Plus, FileSpreadsheet, X, Trash2, Loader2, CheckSquare, Check } from "lucide-react";
import type { Event, PaginationMeta } from "@/types";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
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

function applyFilters(all: Event[], search: string, category: string, status: string): Event[] {
  return all.filter(e =>
    matchesSearch(e, search) &&
    matchesCategory(e, category) &&
    matchesStatus(e, status)
  );
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

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (search)   params.set("search", search);
    if (category) params.set("category", category);
    if (status)   params.set("status", status);
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [search, category, status, router, pathname]);

  const didInit = useRef(false);

  // ── Fetch ALL events ────────────────────────────────────────────────────────
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
      pages.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
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

  useEffect(() => { setPage(1); }, [search, category, status]);

  // ── Derived categories from all data ────────────────────────────────────────
  const knownCategories = Array.from(
    new Set(allItems.map(e => e.category).filter(Boolean))
  ).sort() as string[];

  // ── Filtered + paginated ────────────────────────────────────────────────────
  const filtered = applyFilters(allItems, search, category, status);
  const anyFilter = !!(search || category || status);
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
      const rows = [["Title","Category","Location","Start Date","End Date","Ticket Price","Status"]];
      filtered.forEach(e => rows.push([
        e.title, e.category ?? "", e.location ?? "",
        e.start_date ?? "", e.end_date ?? "",
        e.ticket_price ?? "", e.status ?? "",
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

  const clearFilters = () => { setSearch(""); setCategory(""); setStatus(""); };

  // ── Selection + delete ────────────────────────────────────────────────────────
  const pageIds = paged.map(e => e.id);
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
      if (n.has(id)) n.delete(id);
      else n.add(id);
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
      const ok = results.filter(Boolean).length;
      const failed = results.length - ok;
      const gone = new Set(confirm.ids);
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

  const statusColor = (s?: string) =>
    s === "active"    ? "bg-success/10 text-success" :
    s === "cancelled" ? "bg-danger/10 text-danger"   :
    s === "completed" ? "bg-info/10 text-info"       :
    s === "draft"     ? "bg-gray-100 text-gray-400"  :
                        "bg-warning/10 text-warning";

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
            <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
              <Plus className="w-4 h-4" /><span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events by title, location, category…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium"
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Categories</option>
            {knownCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
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

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="rounded-card border border-border bg-white overflow-hidden animate-pulse">
                <div className="h-40 bg-bg" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-3/4 bg-bg rounded" />
                  <div className="h-2 w-1/2 bg-bg rounded" />
                  <div className="h-2 w-2/3 bg-bg rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paged.map(ev => (
              <div key={ev.id} className="bg-white rounded-card border border-border shadow-soft overflow-hidden hover:border-primary/20 hover:shadow-premium transition-premium flex flex-col relative">
                <Link href={`/events/${ev.id}`} className="block relative h-40 bg-gray-100">
                  {ev.image_url ? (
                    <Image src={ev.image_url} alt={ev.title} fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Calendar className="w-10 h-10" />
                    </div>
                  )}
                  {ev.category && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-white/90 text-primary px-2.5 py-0.5 rounded-lg capitalize shadow-sm">
                      {ev.category}
                    </span>
                  )}
                  {ev.status && (
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor(ev.status)}`}>
                      {ev.status}
                    </span>
                  )}
                </Link>
                <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                  <button
                    onClick={() => toggleOne(ev.id)}
                    title={selected.has(ev.id) ? "Remove from selection" : "Select event"}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white/95 border shadow-sm transition cursor-pointer ${selected.has(ev.id) ? "border-primary bg-primary/10" : "border-gray-200 hover:border-primary/40"}`}
                  >
                    {selected.has(ev.id) && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                  <button
                    onClick={() => setConfirm({ ids: [ev.id], label: ev.title })}
                    title="Delete event"
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/95 border border-gray-200 hover:border-red-200 text-gray-500 hover:text-red-600 shadow-sm transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Link href={`/events/${ev.id}`} className="p-5 flex flex-col gap-3 flex-1">
                  <h4 className="text-sm font-bold text-gray-900 font-display leading-snug">{ev.title}</h4>
                  {ev.description && (
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{ev.description}</p>
                  )}
                  <div className="mt-auto border-t border-border pt-3 space-y-1.5 text-[10px] text-gray-400">
                    {ev.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="text-gray-600 font-medium truncate">{ev.location}</span>
                      </div>
                    )}
                    {(ev.start_date || ev.end_date) && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span className="text-gray-600 font-medium">
                          {ev.start_date}{ev.end_date && ev.end_date !== ev.start_date ? ` – ${ev.end_date}` : ""}
                        </span>
                      </div>
                    )}
                    {ev.ticket_price && (
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3 h-3 shrink-0" />
                        <span className="text-primary font-bold">{ev.ticket_price}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="bg-white rounded-card border border-border shadow-soft px-6 py-4">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )}
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
