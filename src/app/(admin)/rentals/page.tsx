"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { Car, MapPin, Phone, Search, Loader2 } from "lucide-react";
import type { Rental } from "@/types";

export default function RentalsPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<Rental[]>([]);
  const [filtered, setFiltered] = useState<Rental[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rentals")
      .then(r => r.json())
      .then(d => { const list = d?.data ?? []; setAll(list); setFiltered(list); })
      .catch(() => showToast("Error", "Failed to load rentals", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!search) { setFiltered(all); return; }
    setFiltered(all.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || (r.location ?? "").toLowerCase().includes(search.toLowerCase())));
  }, [search, all]);

  const vehicleTypes = (r: Rental) => {
    const vt = r.vehicle_types as string[] | undefined;
    return Array.isArray(vt) ? vt.slice(0, 2).join(", ") : "—";
  };

  return (
    <>
      <Header activeId="rentals" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Vehicle Rentals</h2>
            <p className="text-xs text-gray-500 mt-1">Manage transportation rental listings, providers, and availability.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Car className="w-4 h-4" /><span>Add Rental</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-card border border-border shadow-soft">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rentals…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm font-semibold">Loading rentals…</span></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3"><Car className="w-10 h-10" /><span className="text-sm font-semibold">No rentals found</span></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4 hover:border-primary/20 transition-premium">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Car className="w-5 h-5" /></div>
                  {r.rating && r.rating > 0 && (
                    <span className="bg-warning/10 text-warning text-[10px] font-bold px-2 py-0.5 rounded-full">★ {r.rating.toFixed(1)}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 font-display">{r.name}</h4>
                  <span className="text-[10px] text-gray-500">{vehicleTypes(r)}</span>
                </div>
                {r.description && <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{r.description}</p>}
                <div className="border-t border-border pt-3 space-y-1.5 text-[10px]">
                  <div className="flex justify-between"><span className="text-gray-400">Price</span><span className="font-bold text-primary">{r.price_per_day || "—"}</span></div>
                  {r.location && <div className="flex items-center gap-1.5 text-gray-600"><MapPin className="w-3 h-3 flex-shrink-0" />{r.location}</div>}
                  {r.phone && <div className="flex items-center gap-1.5 text-gray-600"><Phone className="w-3 h-3 flex-shrink-0" />{r.phone}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && <div className="text-xs text-gray-400 font-semibold">Showing {filtered.length} rental{filtered.length !== 1 ? "s" : ""}</div>}
      </main>
    </>
  );
}
