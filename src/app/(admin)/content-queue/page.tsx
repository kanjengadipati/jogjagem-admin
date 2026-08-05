"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  Sparkles, CheckCircle2, XCircle, RefreshCw, Loader2,
  FileText, Globe, Star, MapPin, AlertTriangle, Clock,
  ChevronDown, ChevronUp, Wand2, List, Database,
} from "lucide-react";

interface Destination {
  id: string;
  name: string;
  category: string;
  sub_region: string;
  status: string;
  content_status: string;
  template_variant: string;
  description: string;
  description_en?: string;
  story?: string;
  story_en?: string;
  tagline?: string;
  tagline_en?: string;
  seo_title?: string;
  seo_title_en?: string;
  seo_description?: string;
  seo_description_en?: string;
  seo_keywords?: string;
  seo_keywords_en?: string;
  rating: number;
  review_count: number;
  updated_at: string;
  ticket_price?: string;
  opening_hours?: string;
  best_time?: string;
  latitude?: number;
  longitude?: number;
}

const CONTENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:     { label: "Draft",      color: "bg-stone-100 text-stone-600 border-stone-200" },
  review:    { label: "In Review",  color: "bg-amber-100 text-amber-800 border-amber-200" },
  published: { label: "Published",  color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  flagged:   { label: "Flagged",    color: "bg-orange-100 text-orange-800 border-orange-200" },
  rejected:  { label: "Rejected",   color: "bg-rose-100 text-rose-800 border-rose-200" },
  "":        { label: "No Content", color: "bg-stone-100 text-stone-400 border-stone-200" },
};

const VARIANTS = [
  { value: "narrative",        label: "Narrative",        desc: "Story-driven, emotional opener" },
  { value: "facts",            label: "Facts-First",      desc: "Practical info, prices, hours" },
  { value: "itinerary_first",  label: "Itinerary-First",  desc: "What to do narrative day plan" },
];

// Fact density: count populated key fields (mirrors backend gate, min 4)
function factScore(d: Destination): number {
  let s = 0;
  if (d.ticket_price?.trim())  s++;
  if (d.opening_hours?.trim()) s++;
  if (d.best_time?.trim())     s++;
  if (d.latitude)              s++;
  if (d.longitude)             s++;
  if (d.rating > 0)            s++;
  if (d.review_count > 0)      s++;
  if (d.description?.trim())   s++;
  return s;
}

function StatusBadge({ status }: { status: string }) {
  const cfg = CONTENT_STATUS_CONFIG[status] ?? CONTENT_STATUS_CONFIG[""];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
      {status === "flagged" && <AlertTriangle className="w-2.5 h-2.5" />}
      {cfg.label}
    </span>
  );
}

function FactScoreBar({ score }: { score: number }) {
  const pct = Math.min(score / 8, 1) * 100;
  const color = score >= 4 ? "bg-emerald-500" : "bg-amber-400";
  return (
    <div className="flex items-center gap-1.5" title={`${score}/8 fields populated`}>
      <div className="w-16 h-1.5 rounded-full bg-stone-200 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[9px] font-bold ${score >= 4 ? "text-emerald-600" : "text-amber-600"}`}>{score}/8</span>
    </div>
  );
}

type Tab = "queue" | "available";

export default function ContentQueuePage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("queue");

  // Queue tab state
  const [items, setItems] = useState<Destination[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Available tab state
  const [available, setAvailable] = useState<Destination[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [availFilter, setAvailFilter] = useState("");

  // Shared
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});

  async function loadQueue() {
    setLoadingQueue(true);
    try {
      const res = await fetch("/api/content-queue");
      const data = await res.json();
      setItems(data?.data ?? []);
    } catch {
      showToast("Error", "Failed to load content queue", "error");
    } finally {
      setLoadingQueue(false);
    }
  }

  async function loadAvailable() {
    setLoadingAvail(true);
    try {
      // Fetch all destinations — filter client-side for no content_status
      const res = await fetch("/api/destinations?all=true");
      const data = await res.json();
      const all: Destination[] = data?.data ?? [];
      setAvailable(all.filter(d => !d.content_status || d.content_status === ""));
    } catch {
      showToast("Error", "Failed to load destinations", "error");
    } finally {
      setLoadingAvail(false);
    }
  }

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "available" && available.length === 0) {
      loadAvailable();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function doAction(id: string, action: string, body: object = {}, isAvailable = false) {
    setActionLoading(`${id}:${action}`);
    try {
      const res = await fetch(`/api/content-queue/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || `Failed to ${action}`);
      showToast("Success", action === "generate" ? "Draft generated — check the Queue tab" : `"${action}" completed`, "success");
      // Refresh both lists
      await loadQueue();
      if (isAvailable) await loadAvailable();
    } catch (err) {
      showToast("Error", err instanceof Error ? err.message : `Failed to ${action}`, "error");
    } finally {
      setActionLoading(null);
    }
  }

  const filteredItems = filterStatus === "all"
    ? items
    : items.filter(i => (i.content_status || "") === filterStatus);

  const statusCounts = items.reduce((acc, i) => {
    const s = i.content_status || "";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const [availPage, setAvailPage] = useState(1);
  const AVAIL_PAGE_SIZE = 25;

  const filteredAvail = available.filter(d =>
    !availFilter || d.name.toLowerCase().includes(availFilter.toLowerCase()) ||
    d.sub_region?.toLowerCase().includes(availFilter.toLowerCase()) ||
    d.category?.toLowerCase().includes(availFilter.toLowerCase())
  );

  const availTotalPages = Math.max(1, Math.ceil(filteredAvail.length / AVAIL_PAGE_SIZE));
  const pagedAvail = filteredAvail.slice((availPage - 1) * AVAIL_PAGE_SIZE, availPage * AVAIL_PAGE_SIZE);

  // Reset to page 1 when filter changes
  const handleAvailFilter = (v: string) => { setAvailFilter(v); setAvailPage(1); };

  const readyCount = available.filter(d => factScore(d) >= 4).length;

  return (
    <>
      <Header activeId="content-queue" />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 font-display flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              Content Queue
            </h1>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">
              AI-generated content review — generate, review, and publish destination copy
            </p>
          </div>
          <button
            onClick={() => { loadQueue(); if (activeTab === "available") loadAvailable(); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "queue" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Queue
            {items.length > 0 && (
              <span className="ml-1 bg-purple-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">{items.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("available")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "available" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Available
            {readyCount > 0 && (
              <span className="ml-1 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">{readyCount} ready</span>
            )}
          </button>
        </div>

        {/* ── QUEUE TAB ── */}
        {activeTab === "queue" && (
          <>
            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
              {(["all", "draft", "review", "flagged", "rejected", "published"] as const).map((s) => {
                const cfg = CONTENT_STATUS_CONFIG[s] ?? CONTENT_STATUS_CONFIG[""];
                const count = s === "all" ? items.length : (statusCounts[s] ?? 0);
                if (count === 0 && s !== "all") return null;
                return (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                      filterStatus === s
                        ? "bg-stone-900 text-white border-stone-900"
                        : `${cfg.color} hover:opacity-80`
                    }`}
                  >
                    {s === "all" ? "All" : cfg.label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
              {loadingQueue ? (
                <div className="py-20 flex justify-center text-stone-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
              ) : filteredItems.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-3 text-stone-400">
                  <FileText className="w-10 h-10 text-stone-300" />
                  <p className="text-sm font-semibold">No items in queue</p>
                  <p className="text-xs">Switch to the <strong>Available</strong> tab to generate drafts.</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {filteredItems.map((dest) => {
                    const isExp = expanded === dest.id;
                    const variant = selectedVariant[dest.id] ?? "narrative";
                    const isActing = (k: string) => actionLoading === `${dest.id}:${k}`;
                    return (
                      <div key={dest.id} className="hover:bg-stone-50/50 transition-colors">
                        <div className="flex items-center gap-4 px-5 py-4">
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-stone-900 truncate max-w-[200px]">{dest.name}</span>
                              <StatusBadge status={dest.content_status || ""} />
                              {dest.template_variant && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">{dest.template_variant}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-stone-400">
                              <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{dest.sub_region}</span>
                              <span className="capitalize">{dest.category}</span>
                              {dest.rating > 0 && <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />{dest.rating.toFixed(1)}</span>}
                              <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{new Date(dest.updated_at).toLocaleDateString("id-ID")}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={variant}
                              onChange={(e) => setSelectedVariant(p => ({ ...p, [dest.id]: e.target.value }))}
                              className="text-[10px] font-semibold px-2 py-1.5 rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer"
                            >
                              {VARIANTS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                            </select>
                            {(!dest.content_status || dest.content_status === "rejected") ? (
                              <button onClick={() => doAction(dest.id, "generate", { variant })} disabled={!!actionLoading}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-[10px] font-bold cursor-pointer">
                                {isActing("generate") ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Generate
                              </button>
                            ) : (
                              <button onClick={() => doAction(dest.id, "regenerate", { variant })} disabled={!!actionLoading}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50 text-[10px] font-bold cursor-pointer">
                                {isActing("regenerate") ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Regen
                              </button>
                            )}
                            {(dest.content_status === "draft" || dest.content_status === "review") && (
                              <button onClick={() => doAction(dest.id, "approve")} disabled={!!actionLoading}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[10px] font-bold cursor-pointer">
                                {isActing("approve") ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                              </button>
                            )}
                            {dest.content_status && dest.content_status !== "rejected" && dest.content_status !== "" && (
                              <button onClick={() => doAction(dest.id, "reject", { reason: "Rejected via admin UI" })} disabled={!!actionLoading}
                                className="p-1.5 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-500 cursor-pointer" title="Reject">
                                {isActing("reject") ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button onClick={() => setExpanded(isExp ? null : dest.id)}
                              className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer">
                              {isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        {isExp && (
                          <div className="px-5 pb-5 space-y-4 bg-stone-50/60 border-t border-stone-100 pt-4">
                            {/* Description */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {dest.description && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1"><FileText className="w-3 h-3" /> Description (ID)</p>
                                  <p className="text-xs text-stone-700 leading-relaxed line-clamp-5 bg-white p-3 rounded-xl border border-stone-200">{dest.description}</p>
                                </div>
                              )}
                              {dest.description_en && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1"><Globe className="w-3 h-3" /> Description (EN)</p>
                                  <p className="text-xs text-stone-700 leading-relaxed line-clamp-5 bg-white p-3 rounded-xl border border-stone-200">{dest.description_en}</p>
                                </div>
                              )}
                            </div>
                            {/* Story */}
                            {(dest.story || dest.story_en) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {dest.story && (
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Story (ID)</p>
                                    <p className="text-xs text-stone-700 leading-relaxed line-clamp-4 bg-white p-3 rounded-xl border border-stone-200 italic">{dest.story}</p>
                                  </div>
                                )}
                                {dest.story_en && (
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Story (EN)</p>
                                    <p className="text-xs text-stone-700 leading-relaxed line-clamp-4 bg-white p-3 rounded-xl border border-stone-200 italic">{dest.story_en}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* Tagline */}
                            {(dest.tagline || dest.tagline_en) && (
                              <div className="flex gap-4 flex-wrap">
                                {dest.tagline && (
                                  <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Tagline (ID)</p>
                                    <p className="text-xs font-semibold text-stone-800 bg-white px-3 py-1.5 rounded-lg border border-stone-200">"{dest.tagline}"</p>
                                  </div>
                                )}
                                {dest.tagline_en && (
                                  <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Tagline (EN)</p>
                                    <p className="text-xs font-semibold text-stone-800 bg-white px-3 py-1.5 rounded-lg border border-stone-200">"{dest.tagline_en}"</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* SEO */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                              <div className="space-y-1.5">
                                {dest.seo_title && <p className="text-[10px] text-stone-500"><span className="font-bold">SEO Title (ID):</span> {dest.seo_title}</p>}
                                {dest.seo_description && <p className="text-[10px] text-stone-500"><span className="font-bold">Meta Desc (ID):</span> {dest.seo_description}</p>}
                                {dest.seo_keywords && <p className="text-[10px] text-stone-400"><span className="font-bold text-stone-500">Keywords (ID):</span> {dest.seo_keywords}</p>}
                              </div>
                              <div className="space-y-1.5">
                                {dest.seo_title_en && <p className="text-[10px] text-stone-500"><span className="font-bold">SEO Title (EN):</span> {dest.seo_title_en}</p>}
                                {dest.seo_description_en && <p className="text-[10px] text-stone-500"><span className="font-bold">Meta Desc (EN):</span> {dest.seo_description_en}</p>}
                                {dest.seo_keywords_en && <p className="text-[10px] text-stone-400"><span className="font-bold text-stone-500">Keywords (EN):</span> {dest.seo_keywords_en}</p>}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── AVAILABLE TAB ── */}
        {activeTab === "available" && (
          <>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={availFilter}
                onChange={e => handleAvailFilter(e.target.value)}
                placeholder="Filter by name, region, category..."
                className="flex-1 px-3.5 py-2 text-xs border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
              />
              <div className="text-xs text-stone-400 shrink-0">
                <span className="font-bold text-emerald-600">{readyCount}</span> ready ·{" "}
                <span className="font-bold text-amber-600">{available.length - readyCount}</span> need more data
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
              {loadingAvail ? (
                <div className="py-20 flex justify-center text-stone-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
              ) : filteredAvail.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-2 text-stone-400">
                  <Database className="w-8 h-8 text-stone-300" />
                  <p className="text-sm font-semibold">No destinations without content</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {filteredAvail.map((dest) => {
                    const score = factScore(dest);
                    const isReady = score >= 4;
                    const variant = selectedVariant[dest.id] ?? "narrative";
                    const isActing = actionLoading === `${dest.id}:generate`;
                    return (
                      <div key={dest.id} className={`flex items-center gap-4 px-5 py-3.5 ${isReady ? "hover:bg-stone-50/50" : "opacity-60"} transition-colors`}>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-stone-900 truncate max-w-[220px]">{dest.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-stone-400">
                            <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{dest.sub_region || "—"}</span>
                            <span className="capitalize">{dest.category}</span>
                            <FactScoreBar score={score} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={variant}
                            onChange={(e) => setSelectedVariant(p => ({ ...p, [dest.id]: e.target.value }))}
                            disabled={!isReady}
                            className="text-[10px] font-semibold px-2 py-1.5 rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer disabled:cursor-not-allowed"
                          >
                            {VARIANTS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                          </select>
                          <button
                            onClick={() => doAction(dest.id, "generate", { variant }, true)}
                            disabled={!isReady || !!actionLoading}
                            title={!isReady ? `Only ${score}/8 fields — needs at least 4` : "Generate AI draft"}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Generate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

      </main>
    </>
  );
}
