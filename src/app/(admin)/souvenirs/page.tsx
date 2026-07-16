"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { ShoppingBag, Star, MapPin, Search, Loader2 } from "lucide-react";
import type { Souvenir } from "@/types";

export default function SouvenirsPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<Souvenir[]>([]);
  const [filtered, setFiltered] = useState<Souvenir[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/souvenirs")
      .then(r => r.json())
      .then(d => { const list = d?.data ?? []; setAll(list); setFiltered(list); })
      .catch(() => showToast("Error", "Failed to load souvenirs", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!search) { setFiltered(all); return; }
    setFiltered(all.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.location ?? "").toLowerCase().includes(search.toLowerCase())));
  }, [search, all]);

  const productTypes = (s: Souvenir) => {
    const pt = s.product_types as string[] | undefined;
    return Array.isArray(pt) ? pt.slice(0, 2).join(", ") : "—";
  };

  return (
    <>
      <Header activeId="souvenirs" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Souvenir Marketplace</h2>
            <p className="text-xs text-gray-500 mt-1">Manage local handicrafts, culinary souvenirs, and artisan listings.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <ShoppingBag className="w-4 h-4" /><span>Add Souvenir</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-card border border-border shadow-soft">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search souvenirs…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
          </div>
        </div>

        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Shop</th>
                  <th className="py-4 px-6">Products</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Price Range</th>
                  <th className="py-4 px-6 text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {loading ? (
                  <tr><td colSpan={5} className="py-16 text-center text-gray-400"><div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading…</span></div></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center text-gray-400"><div className="flex flex-col items-center gap-2"><ShoppingBag className="w-8 h-8" /><span>No souvenirs found</span></div></td></tr>
                ) : filtered.map(s => (
                  <tr key={s.id} className="hover:bg-bg/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"><ShoppingBag className="w-4 h-4" /></div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 font-display block">{s.name}</span>
                          {s.description && <span className="text-[10px] text-gray-400 line-clamp-1 max-w-xs">{s.description}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full">{productTypes(s)}</span></td>
                    <td className="py-4 px-6"><div className="flex items-center gap-1 text-gray-600 font-semibold"><MapPin className="w-3 h-3 text-gray-400" />{s.location || "—"}</div></td>
                    <td className="py-4 px-6 font-semibold text-gray-700">{s.price_range || "—"}</td>
                    <td className="py-4 px-6 text-center">
                      {s.rating ? <span className="inline-flex items-center gap-1 font-bold text-warning"><Star className="w-3.5 h-3.5 fill-warning text-warning" />{s.rating.toFixed(1)}</span> : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && <div className="p-4 border-t border-border text-xs text-gray-400 font-semibold">Showing {filtered.length} souvenir shops</div>}
        </div>
      </main>
    </>
  );
}
