"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { Calendar, MapPin, Search, Loader2, Tag } from "lucide-react";
import type { Event } from "@/types";

export default function EventsPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(d => { const list = d?.data ?? []; setAll(list); setFiltered(list); })
      .catch(() => showToast("Error", "Failed to load events", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let list = all;
    if (search) list = list.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || (e.location ?? "").toLowerCase().includes(search.toLowerCase()));
    if (category) list = list.filter(e => e.category === category);
    setFiltered(list);
  }, [search, category, all]);

  const categories = Array.from(new Set(all.map(e => e.category).filter(Boolean))) as string[];
  const statusColor = (s?: string) => s === "active" ? "bg-success/10 text-success" : s === "cancelled" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning";

  return (
    <>
      <Header activeId="events" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Cultural Events & Festival Calendar</h2>
            <p className="text-xs text-gray-500 mt-1">Manage ticketing states, event categories, and promotional schedules.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Calendar className="w-4 h-4" /><span>Add Event</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full bg-bg text-xs px-3.5 py-2.5 rounded-xl border border-transparent outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm font-semibold">Loading events…</span></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3"><Calendar className="w-10 h-10" /><span className="text-sm font-semibold">No events found</span></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(ev => (
              <div key={ev.id} className="bg-white rounded-card border border-border shadow-soft overflow-hidden hover:border-primary/20 hover:shadow-premium transition-premium flex flex-col">
                <div className="relative h-40 bg-gray-100">
                  {ev.image_url ? (
                    <Image src={ev.image_url} alt={ev.title} fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Calendar className="w-10 h-10" /></div>
                  )}
                  {ev.category && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-white/90 text-primary px-2.5 py-0.5 rounded-lg capitalize shadow-sm">{ev.category}</span>
                  )}
                  {ev.status && (
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor(ev.status)}`}>{ev.status}</span>
                  )}
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <h4 className="text-sm font-bold text-gray-900 font-display leading-snug">{ev.title}</h4>
                  {ev.description && <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{ev.description}</p>}
                  <div className="mt-auto border-t border-border pt-3 space-y-1.5 text-[10px] text-gray-400">
                    {ev.location && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /><span className="text-gray-600 font-medium">{ev.location}</span></div>}
                    {(ev.start_date || ev.end_date) && (
                      <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />
                        <span className="text-gray-600 font-medium">{ev.start_date}{ev.end_date && ev.end_date !== ev.start_date ? ` – ${ev.end_date}` : ""}</span>
                      </div>
                    )}
                    {ev.ticket_price && <div className="flex items-center gap-1.5"><Tag className="w-3 h-3" /><span className="text-primary font-bold">{ev.ticket_price}</span></div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && <div className="text-xs text-gray-400 font-semibold">Showing {filtered.length} event{filtered.length !== 1 ? "s" : ""}</div>}
      </main>
    </>
  );
}
