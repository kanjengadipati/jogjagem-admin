"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { Hotel, Star, MapPin, Search, Loader2 } from "lucide-react";
import { firstImage } from "@/lib/images";
import type { Hotel as HotelType } from "@/types";

export default function HotelsPage() {
  const { showToast } = useToast();
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [filtered, setFiltered] = useState<HotelType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hotels")
      .then(r => r.json())
      .then(d => { const list = d?.data ?? []; setHotels(list); setFiltered(list); })
      .catch(() => showToast("Error", "Failed to load hotels", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!search) { setFiltered(hotels); return; }
    setFiltered(hotels.filter(h =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.location ?? "").toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, hotels]);

  const getFirstImg = (h: HotelType) => firstImage(h.images as never);

  return (
    <>
      <Header activeId="hotels" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Hotel Directory</h2>
            <p className="text-xs text-gray-500 mt-1">Manage hotel listings, star ratings, and partnership statuses.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Hotel className="w-4 h-4" /><span>Add Hotel</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-card border border-border shadow-soft">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hotels…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Registered Hotels</h4>
            <span className="text-xs font-bold text-primary">{filtered.length} hotels</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Hotel</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6 text-center">Stars</th>
                  <th className="py-4 px-6 text-center">Rating</th>
                  <th className="py-4 px-6">Price / Night</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {loading ? (
                  <tr><td colSpan={5} className="py-16 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading…</span></div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2"><Hotel className="w-8 h-8" /><span>No hotels found</span></div>
                  </td></tr>
                ) : filtered.map(h => {
                  const img = getFirstImg(h);
                  return (
                    <tr key={h.id} className="hover:bg-bg/40 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <Image src={img} alt={h.name} width={36} height={36} className="w-9 h-9 rounded-xl object-cover border border-border" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Hotel className="w-4 h-4" /></div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-gray-900 font-display block">{h.name}</span>
                            {h.description && <span className="text-[10px] text-gray-400 line-clamp-1 max-w-xs">{h.description}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-gray-600 font-semibold">
                          <MapPin className="w-3 h-3 text-gray-400" />{h.location || "—"}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-warning">
                        {h.stars ? "★".repeat(Math.min(h.stars, 5)) : "—"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {h.rating ? (
                          <span className="inline-flex items-center gap-1 font-bold text-warning">
                            <Star className="w-3.5 h-3.5 fill-warning text-warning" />{h.rating.toFixed(1)}
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-4 px-6 font-semibold text-primary">{h.price_per_night || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && <div className="p-4 border-t border-border text-xs text-gray-400 font-semibold">Showing {filtered.length} hotels</div>}
        </div>
      </main>
    </>
  );
}
