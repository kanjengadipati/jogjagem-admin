"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  Bot, RefreshCw, Loader2, MapPin, Calendar, Clock, Scan, Table2,
} from "lucide-react";

type ScrapeType = "all" | "destinations" | "events";
type ScrapeSource = "all" | "injourney" | "jadesta" | "visitingjogja";

interface ScrapeStatus {
  type: ScrapeType;
  startedAt: Date;
}

const SOURCE_OPTIONS: { value: ScrapeSource; label: string }[] = [
  { value: "all", label: "All sources" },
  { value: "visitingjogja", label: "Visiting Jogja (Events)" },
  { value: "injourney", label: "InJourney" },
  { value: "jadesta", label: "Jadesta" },
];

export default function ScraperPage() {
  const { showToast } = useToast();
  const [activeScrape, setActiveScrape] = useState<ScrapeStatus | null>(null);
  const [source, setSource] = useState<ScrapeSource>("all");

  async function runScraper(type: ScrapeType) {
    if (activeScrape) {
      showToast("Already Running", `A ${activeScrape.type} scrape is already in progress.`, "error");
      return;
    }
    try {
      const base = type === "all" ? "/api/scraper/run/all" : `/api/scraper/run/${type}`;
      const endpoint = source !== "all" ? `${base}?source=${source}` : base;
      const res = await fetch(endpoint);
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

  const elapsed = activeScrape
    ? Math.floor((Date.now() - activeScrape.startedAt.getTime()) / 1000)
    : 0;

  return (
    <>
      <Header activeId="scraper" />
      <main className="flex-1 overflow-y-auto p-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Scan className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
                Run Scraper
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Fetch new events and destinations from external sources (Visiting Jogja, InJourney, Jadesta).
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Destinations: monthly | Events: every 3 days
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as ScrapeSource)}
              disabled={!!activeScrape}
              className="px-3 py-2.5 rounded-xl border border-border bg-white text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              title="Choose which source to scrape"
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <Link
              href="/scraper/review"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-gray-600 hover:bg-bg transition cursor-pointer"
            >
              <Table2 className="w-3.5 h-3.5" />
              Review Scraped Data
            </Link>
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
      </main>
    </>
  );
}
