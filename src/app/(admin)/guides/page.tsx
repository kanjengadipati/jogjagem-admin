"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { Users, Star, Phone, Search, Loader2 } from "lucide-react";
import type { Guide } from "@/types";

export default function GuidesPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<Guide[]>([]);
  const [filtered, setFiltered] = useState<Guide[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guides")
      .then(r => r.json())
      .then(d => { const list = d?.data ?? []; setAll(list); setFiltered(list); })
      .catch(() => showToast("Error", "Failed to load guides", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!search) { setFiltered(all); return; }
    setFiltered(all.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || (g.specialization ?? "").toLowerCase().includes(search.toLowerCase())));
  }, [search, all]);

  const langs = (g: Guide) => Array.isArray(g.languages) ? (g.languages as string[]).join(", ") : "—";

  return (
    <>
      <Header activeId="guides" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Tour Guides Directory</h2>
            <p className="text-xs text-gray-500 mt-1">Manage certified local guides, languages, and availability status.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Users className="w-4 h-4" /><span>Add Guide</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-card border border-border shadow-soft">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guides…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm font-semibold">Loading guides…</span></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3"><Users className="w-10 h-10" /><span className="text-sm font-semibold">No guides found</span></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(g => (
              <div key={g.id} className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4 hover:border-primary/20 transition-premium">
                <div className="flex items-center gap-4">
                  {g.avatar ? (
                    <Image src={g.avatar} alt={g.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{g.name.charAt(0)}</div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 font-display">{g.name}</h4>
                    {g.specialization && <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold">{g.specialization}</span>}
                  </div>
                </div>
                {g.bio && <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{g.bio}</p>}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-bg">
                    <span className="text-sm font-extrabold text-warning block flex items-center justify-center gap-0.5"><Star className="w-3 h-3 fill-warning" />{g.rating?.toFixed(1) ?? "—"}</span>
                    <span className="text-[9px] text-gray-400">Rating</span>
                  </div>
                  <div className="p-2 rounded-xl bg-bg">
                    <span className="text-sm font-extrabold text-gray-900 block">{g.review_count ?? 0}</span>
                    <span className="text-[9px] text-gray-400">Reviews</span>
                  </div>
                  <div className="p-2 rounded-xl bg-bg">
                    <span className="text-xs font-bold text-primary block truncate">{g.price_per_day || "—"}</span>
                    <span className="text-[9px] text-gray-400">Per Day</span>
                  </div>
                </div>
                <div className="border-t border-border pt-3 space-y-1.5 text-[10px]">
                  <div className="flex justify-between"><span className="text-gray-400">Languages</span><span className="font-medium text-gray-700">{langs(g)}</span></div>
                  {g.phone && <div className="flex items-center gap-1.5 text-gray-600"><Phone className="w-3 h-3" />{g.phone}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && <div className="text-xs text-gray-400 font-semibold">Showing {filtered.length} guide{filtered.length !== 1 ? "s" : ""}</div>}
      </main>
    </>
  );
}
