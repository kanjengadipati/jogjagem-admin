"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  Table2, Sparkles, Check, X, Loader2, CheckCircle2, ArrowRight, MapPin,
  Calendar,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";

type Tab = "destinations" | "events";

interface StagingDestination {
  id: number;
  name: string;
  description?: string;
  latitude?: string;
  longitude?: string;
  category?: string;
  source: string;
  status: string;
}

interface StagingEvent {
  id: number;
  title: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  source: string;
  status: string;
}

export default function ScraperReviewPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("destinations");
  const [dests, setDests] = useState<StagingDestination[]>([]);
  const [events, setEvents] = useState<StagingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const items = tab === "events" ? events : dests;
  const hasAiReview = tab === "destinations";
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  // Sync indeterminate state on select-all checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  });

  async function fetchTab(t: Tab) {
    setLoading(true);
    setSelectedIds([]);
    try {
      const path = t === "events" ? "/admin/staging/events" : "/admin/staging/destinations";
      const res = await fetch(`${BACKEND_URL}${path}`);
      const body = await res.json();
      if (body.status === "success") {
        if (t === "events") {
          setEvents(body.data || []);
        } else {
          setDests(body.data || []);
        }
      }
    } catch {
      showToast("Error", "Failed to load staging data", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTab("destinations");
  }, []);

  async function switchTab(t: Tab) {
    setTab(t);
    await fetchTab(t);
  }

  async function handleBulkAction(action: "approve" | "reject" | "ai-review") {
    if (selectedIds.length === 0) return;
    setProcessing(true);
    try {
      const endpoint = action === "ai-review" ? "ai-review" : action;
      const res = await fetch(`${BACKEND_URL}/admin/staging/${tab}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        showToast("Success", `Bulk ${action} completed`, "success");
        setSelectedIds([]);
        fetchTab(tab);
      } else {
        showToast("Error", `Failed to ${action}`, "error");
      }
    } catch {
      showToast("Error", "Network error", "error");
    } finally {
      setProcessing(false);
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const formatDate = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <>
      <Header activeId="scraper-review" />
      <main className="flex-1 overflow-y-auto p-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Table2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
                Review Scraped Data
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Approve or reject scraped {tab} before publishing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/scraper"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-gray-600 hover:bg-bg transition cursor-pointer"
            >
              Run Scraper
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {hasAiReview && (
              <button
                onClick={() => handleBulkAction("ai-review")}
                disabled={processing || selectedIds.length === 0}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                AI Review
              </button>
            )}
            <button
              onClick={() => handleBulkAction("approve")}
              disabled={processing || selectedIds.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => handleBulkAction("reject")}
              disabled={processing || selectedIds.length === 0}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          <button
            onClick={() => switchTab("destinations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tab === "destinations" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Destinations
          </button>
          <button
            onClick={() => switchTab("events")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tab === "events" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Events
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
            <CheckCircle2 className="w-14 h-14" />
            <span className="text-sm font-semibold">All caught up</span>
            <p className="text-xs text-gray-400">
              No pending scraped {tab} to review.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="p-4 w-12">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        onChange={(e) =>
                          setSelectedIds(e.target.checked ? items.map((i) => i.id) : [])
                        }
                        checked={allSelected}
                        className="rounded"
                      />
                    </th>
                    <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      {tab === "events" ? "Title" : "Name"}
                    </th>
                    <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Description</th>
                    {tab === "destinations" && (
                      <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                    )}
                    {tab === "events" && (
                      <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    )}
                    {tab === "destinations" && (
                      <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Coordinates</th>
                    )}
                    {tab === "events" && (
                      <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Location</th>
                    )}
                    <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Source</th>
                    <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tab === "destinations"
                    ? dests.map((item) => (
                        <tr key={item.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => toggleSelect(item.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="p-4">
                            <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {item.description || <span className="text-gray-300">—</span>}
                            </p>
                          </td>
                          <td className="p-4">
                            {item.category ? (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                                {item.category}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            {item.latitude && item.longitude ? (
                              <span className="flex items-center gap-1 text-[11px] text-gray-500 font-mono">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                              {item.source}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-warning/10 text-warning capitalize">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    : events.map((item) => (
                        <tr key={item.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => toggleSelect(item.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="p-4">
                            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {item.description || <span className="text-gray-300">—</span>}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className="text-[11px] text-gray-500 font-mono whitespace-nowrap">
                              {formatDate(item.start_date) || "—"}
                              {item.end_date && formatDate(item.end_date) !== formatDate(item.start_date)
                                ? ` → ${formatDate(item.end_date)}`
                                : ""}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="flex items-center gap-1 text-[11px] text-gray-500">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {item.location || <span className="text-gray-300">—</span>}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                              {item.source}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-warning/10 text-warning capitalize">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
            {selectedIds.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-border text-xs text-gray-500">
                {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
