"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  Bot, RefreshCw, CheckCircle2, XCircle, Loader2, MapPin, Calendar,
  Clock, Scan, Table2, Sparkles, Trash2, Check, X,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";

type ScrapeType = "all" | "destinations" | "events";
type TabType = "scrape" | "review";

interface ScrapeStatus {
  type: ScrapeType;
  startedAt: Date;
}

interface StagingDestination {
  ID: number;
  Name: string;
  Description: string;
  Source: string;
  Status: string;
}

export default function ScraperPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<TabType>("scrape");

  // --- Scrape state ---
  const [activeScrape, setActiveScrape] = useState<ScrapeStatus | null>(null);

  async function runScraper(type: ScrapeType) {
    if (activeScrape) {
      showToast("Already Running", `A ${activeScrape.type} scrape is already in progress.`, "error");
      return;
    }
    try {
      const endpoint = type === "all" ? "/admin/scrape" : `/admin/scrape/${type}`;
      const res = await fetch(`${BACKEND_URL}${endpoint}`);
      const body = await res.json();
      if (res.status === 409) {
        showToast("Already Running", body.message || "A scrape is already in progress.", "error");
        return;
      }
      if (body?.status === "success") {
        setActiveScrape({ type, startedAt: new Date() });
        const label = type === "all" ? "All" : type === "destinations" ? "Destinations" : "Events";
        showToast("Scrape Started", `${label} scrape is running in the background.`, "success");
      } else {
        showToast("Error", body?.message || "Unexpected response", "error");
      }
    } catch {
      showToast("Error", "Failed to run scraper — is the backend running?", "error");
    }
  }

  // --- Review state ---
  const [items, setItems] = useState<StagingDestination[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (tab === "review") fetchPending();
  }, [tab]);

  async function fetchPending() {
    setReviewLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/staging/destinations`);
      const body = await res.json();
      if (body.status === "success") {
        setItems(body.data || []);
      }
    } catch {
      showToast("Error", "Failed to load staging data", "error");
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleBulkAction(action: "approve" | "reject" | "ai-review") {
    setProcessing(true);
    try {
      const endpoint = action === "ai-review" ? "ai-review" : action;
      const res = await fetch(`${BACKEND_URL}/admin/staging/destinations/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        showToast("Success", `Bulk ${action} completed`, "success");
        setSelectedIds([]);
        fetchPending();
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

  const elapsed = activeScrape
    ? Math.floor((Date.now() - activeScrape.startedAt.getTime()) / 1000)
    : 0;

  return (
    <>
      <Header activeId="scraper" />
      <main className="flex-1 overflow-y-auto p-8 space-y-6">

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("scrape")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              tab === "scrape"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Scan className="w-4 h-4" />
            Scrape
          </button>
          <button
            onClick={() => setTab("review")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              tab === "review"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Table2 className="w-4 h-4" />
            Review
            {items.length > 0 && (
              <span className="bg-warning/10 text-warning text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </button>
        </div>

        {/* ===== SCRAPE TAB ===== */}
        {tab === "scrape" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
                  Run Scraper
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Fetch new events and destinations from external sources (InJourney, Jadesta).
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Destinations: monthly | Events: every 3 days
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => runScraper("destinations")}
                  disabled={!!activeScrape}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer"
                >
                  {activeScrape?.type === "destinations" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  <span>Destinations</span>
                </button>
                <button
                  onClick={() => runScraper("events")}
                  disabled={!!activeScrape}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer"
                >
                  {activeScrape?.type === "events" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                  <span>Events</span>
                </button>
                <button
                  onClick={() => runScraper("all")}
                  disabled={!!activeScrape}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer"
                >
                  {activeScrape?.type === "all" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>Run All</span>
                </button>
              </div>
            </div>

            {/* Active scrape banner */}
            {activeScrape && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold font-display text-gray-900">
                      {activeScrape.type === "all" && "Running all scrapers…"}
                      {activeScrape.type === "destinations" && "Scraping destinations…"}
                      {activeScrape.type === "events" && "Scraping events…"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Running in the background. Check the server logs for progress.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsed}s</span>
                  </div>
                </div>
              </div>
            )}

            {/* Idle state */}
            {!activeScrape && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                <Bot className="w-14 h-14" />
                <span className="text-sm font-semibold">No scraper running</span>
                <p className="text-xs text-gray-400">
                  Click a button above to fetch fresh data from external sources.
                </p>
                <div className="mt-4 p-4 bg-white rounded-card border border-border shadow-soft text-left max-w-sm">
                  <p className="text-xs font-bold text-gray-700 mb-2">Schedule Info</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-primary" />
                      <p className="text-[11px] text-gray-500">
                        Destinations: <span className="font-semibold">1st of every month</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-primary" />
                      <p className="text-[11px] text-gray-500">
                        Events: <span className="font-semibold">Every 3 days</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== REVIEW TAB ===== */}
        {tab === "review" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
                  Review Scraped Data
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Approve or reject scraped destinations before publishing.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction("ai-review")}
                  disabled={processing || selectedIds.length === 0}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Review
                </button>
                <button
                  onClick={() => handleBulkAction("approve")}
                  disabled={processing || selectedIds.length === 0}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction("reject")}
                  disabled={processing || selectedIds.length === 0}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>

            {reviewLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                <CheckCircle2 className="w-14 h-14" />
                <span className="text-sm font-semibold">All caught up</span>
                <p className="text-xs text-gray-400">
                  No pending scraped destinations to review.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50">
                      <th className="p-4 w-12">
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            setSelectedIds(e.target.checked ? items.map((i) => i.ID) : [])
                          }
                          checked={selectedIds.length === items.length && items.length > 0}
                          className="rounded"
                        />
                      </th>
                      <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Source</th>
                      <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.ID} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.ID)}
                            onChange={() => toggleSelect(item.ID)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-900">{item.Name}</td>
                        <td className="p-4">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                            {item.Source}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-warning/10 text-warning capitalize">
                            {item.Status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedIds.length > 0 && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-border text-xs text-gray-500">
                    {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
