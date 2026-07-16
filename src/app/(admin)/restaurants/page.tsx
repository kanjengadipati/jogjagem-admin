"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { Utensils, Star, MapPin, Search, Loader2 } from "lucide-react";
import type { Restaurant } from "@/types";

export default function RestaurantsPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<Restaurant[]>([]);
  const [filtered, setFiltered] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurants")
      .then(r => r.json())
      .then(d => { const list = d?.data ?? []; setAll(list); setFiltered(list); })
      .catch(() => showToast("Error", "Failed to load restaurants", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let list = all;
    if (search) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || (r.location ?? "").toLowerCase().includes(search.toLowerCase()));
    if (cuisine) list = list.filter(r => r.cuisine_type === cuisine);
    setFiltered(list);
  }, [search, cuisine, all]);

  const cuisines = Array.from(new Set(all.map(r => r.cuisine_type).filter(Boolean))) as string[];
  const firstImg = (r: Restaurant) => { const imgs = r.images as string[] | undefined; return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null; };

  return (
    <>
      <Header activeId="restaurants" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Restaurant Directory</h2>
            <p className="text-xs text-gray-500 mt-1">Manage culinary listings, cuisine categories, and partner statuses.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Utensils className="w-4 h-4" /><span>Add Restaurant</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
          </div>
          <select value={cuisine} onChange={e => setCuisine(e.target.value)}
            className="w-full bg-bg text-xs px-3.5 py-2.5 rounded-xl border border-transparent outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Cuisines</option>
            {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Culinary Partners</h4>
            <span className="text-xs font-bold text-primary">{filtered.length} restaurants</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Restaurant</th>
                  <th className="py-4 px-6">Cuisine</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6 text-center">Rating</th>
                  <th className="py-4 px-6">Price Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {loading ? (
                  <tr><td colSpan={5} className="py-16 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading…</span></div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2"><Utensils className="w-8 h-8" /><span>No restaurants found</span></div>
                  </td></tr>
                ) : filtered.map(r => {
                  const img = firstImg(r);
                  return (
                    <tr key={r.id} className="hover:bg-bg/40 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <Image src={img} alt={r.name} width={36} height={36} className="w-9 h-9 rounded-xl object-cover border border-border" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Utensils className="w-4 h-4" /></div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-gray-900 font-display block">{r.name}</span>
                            {r.opening_hours && <span className="text-[10px] text-gray-400">{r.opening_hours}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {r.cuisine_type ? <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2.5 py-0.5 rounded-full">{r.cuisine_type}</span> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-gray-600 font-semibold">
                          <MapPin className="w-3 h-3 text-gray-400" />{r.location || "—"}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {r.rating ? <span className="inline-flex items-center gap-1 font-bold text-warning"><Star className="w-3.5 h-3.5 fill-warning text-warning" />{r.rating.toFixed(1)}</span> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-700">{r.price_range || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && <div className="p-4 border-t border-border text-xs text-gray-400 font-semibold">Showing {filtered.length} restaurants</div>}
        </div>
      </main>
    </>
  );
}
