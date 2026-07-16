"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { Tag, Search, Loader2, Trash2, Plus, Calendar } from "lucide-react";

interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount?: string;
  start_date?: string;
  end_date?: string;
  image_url?: string;
  category?: string;
  status?: string;
  code?: string;
}

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-success/10 text-success",
  inactive: "bg-gray-100 text-gray-500",
  expired:  "bg-danger/10 text-danger",
};

export default function PromotionsPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<Promotion[]>([]);
  const [filtered, setFiltered] = useState<Promotion[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/promotions")
      .then(r => r.json())
      .then(d => {
        const list: Promotion[] = d?.data ?? [];
        setAll(list);
        setFiltered(list);
      })
      .catch(() => showToast("Error", "Failed to load promotions", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let list = all;
    if (search) list = list.filter(p =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter) list = list.filter(p => p.status === statusFilter);
    setFiltered(list);
  }, [search, statusFilter, all]);

  async function deletePromotion(id: string) {
    if (!confirm("Delete this promotion?")) return;
    const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAll(prev => prev.filter(p => p.id !== id));
      showToast("Deleted", "Promotion removed", "success");
    } else {
      showToast("Error", "Delete failed", "error");
    }
  }

  return (
    <>
      <Header activeId="promotions" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Promotions</h2>
            <p className="text-xs text-gray-500 mt-1">Manage discount codes, seasonal campaigns, and partner promotions.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Plus className="w-4 h-4" /><span>Add Promotion</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, code, or category…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-bg text-xs px-3.5 py-2.5 rounded-xl border border-transparent outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm font-semibold">Loading promotions…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Tag className="w-10 h-10" /><span className="text-sm font-semibold">No promotions found</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-card border border-border shadow-soft overflow-hidden hover:border-primary/20 hover:shadow-premium transition-premium flex flex-col">

                {/* Image */}
                <div className="relative h-40 bg-gray-100">
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.title} fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Tag className="w-10 h-10" />
                    </div>
                  )}
                  {p.discount && (
                    <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg shadow">
                      {p.discount} OFF
                    </span>
                  )}
                  {p.status && (
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {p.status}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 font-display">{p.title}</h4>
                    {p.category && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">{p.category}</span>}
                  </div>

                  {p.description && <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{p.description}</p>}

                  <div className="mt-auto border-t border-border pt-3 space-y-1.5 text-[10px]">
                    {p.code && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Code</span>
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{p.code}</span>
                      </div>
                    )}
                    {(p.start_date || p.end_date) && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{p.start_date}{p.end_date ? ` – ${p.end_date}` : ""}</span>
                      </div>
                    )}
                  </div>

                  <button onClick={() => deletePromotion(p.id)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-border hover:bg-red-50 hover:border-red-200 text-gray-500 hover:text-red-600 text-xs font-semibold transition cursor-pointer mt-1">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="text-xs text-gray-400 font-semibold">Showing {filtered.length} promotion{filtered.length !== 1 ? "s" : ""}</div>
        )}
      </main>
    </>
  );
}
