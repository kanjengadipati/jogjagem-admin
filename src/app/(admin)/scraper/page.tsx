"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { Bot, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";

interface ScraperResult {
  Source: string;
  EventsInserted: number;
  EventsUpdated: number;
  DestinationsInserted: number;
  DestinationsUpdated: number;
  Errors: string[] | null;
}

interface ScrapeResponse {
  status: string;
  message: string;
  data: {
    results: ScraperResult[];
  };
}

export default function ScraperPage() {
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ScraperResult[] | null>(null);

  async function runScraper() {
    setRunning(true);
    setResults(null);

    try {
      const res = await fetch(`${BACKEND_URL}/admin/scrape`);
      const body: ScrapeResponse = await res.json();
      if (body?.status === "success" && body?.data?.results) {
        setResults(body.data.results);
        showToast("Scrape Complete", "All scrapers finished", "success");
      } else {
        showToast("Error", "Unexpected response format", "error");
      }
    } catch {
      showToast("Error", "Failed to run scraper — is the backend running?", "error");
    } finally {
      setRunning(false);
    }
  }

  const totalEvents = results
    ? results.reduce((s, r) => s + r.EventsInserted + r.EventsUpdated, 0)
    : 0;
  const totalDests = results
    ? results.reduce((s, r) => s + r.DestinationsInserted + r.DestinationsUpdated, 0)
    : 0;
  const totalErrors = results
    ? results.reduce((s, r) => s + (r.Errors?.length ?? 0), 0)
    : 0;

  return (
    <>
      <Header activeId="scraper" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Scraper</h2>
            <p className="text-xs text-gray-500 mt-1">
              Fetch new events and destinations from external sources (InJourney, Jadesta).
            </p>
          </div>
          <button
            onClick={runScraper}
            disabled={running}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer"
          >
            {running ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{running ? "Running…" : "Run Scraper"}</span>
          </button>
        </div>

        {/* Status summary */}
        {results && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-card border border-border shadow-soft p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Events</p>
                <p className="text-xl font-extrabold font-display text-gray-900">{totalEvents}</p>
              </div>
            </div>
            <div className="bg-white rounded-card border border-border shadow-soft p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Destinations</p>
                <p className="text-xl font-extrabold font-display text-gray-900">{totalDests}</p>
              </div>
            </div>
            <div className="bg-white rounded-card border border-border shadow-soft p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalErrors > 0 ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                {totalErrors > 0 ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Errors</p>
                <p className="text-xl font-extrabold font-display text-gray-900">{totalErrors}</p>
              </div>
            </div>
          </div>
        )}

        {/* Per-scraper detail */}
        {results && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-display text-gray-700">Scraper Results</h3>
            {results.map((r) => (
              <div key={r.Source} className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold font-display text-gray-900 capitalize">{r.Source}</span>
                  </div>
                  {r.Errors && r.Errors.length > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-danger/10 text-danger">Errors</span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success">OK</span>
                  )}
                </div>
                <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-gray-400 font-medium">Events Inserted</p>
                    <p className="text-lg font-extrabold font-display text-gray-900">{r.EventsInserted}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">Events Updated</p>
                    <p className="text-lg font-extrabold font-display text-gray-900">{r.EventsUpdated}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">Destinations Inserted</p>
                    <p className="text-lg font-extrabold font-display text-gray-900">{r.DestinationsInserted}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">Destinations Updated</p>
                    <p className="text-lg font-extrabold font-display text-gray-900">{r.DestinationsUpdated}</p>
                  </div>
                </div>
                {r.Errors && r.Errors.length > 0 && (
                  <div className="px-5 py-3 bg-danger/5 border-t border-border space-y-1">
                    {r.Errors.map((e, i) => (
                      <p key={i} className="text-[11px] text-danger font-mono">{e}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Idle state */}
        {!results && !running && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
            <Bot className="w-14 h-14" />
            <span className="text-sm font-semibold">No scraper run yet</span>
            <p className="text-xs text-gray-400">Click <strong>Run Scraper</strong> to fetch fresh data from external sources.</p>
          </div>
        )}

        {/* Loading state */}
        {running && !results && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-semibold">Scraping in progress…</span>
            <p className="text-xs text-gray-400">This may take up to 2 minutes.</p>
          </div>
        )}
      </main>
    </>
  );
}
