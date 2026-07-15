"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { firstImage } from "@/lib/images";
import { DownloadCloud, FileSpreadsheet, Plus, Search, Star, Edit3 } from "lucide-react";
import type { Destination } from "@/types";

const CATEGORIES = ["Temple","Beach","Nature","Heritage","Cultural","Culinary","Shopping"];
const REGIONS = ["Sleman","Bantul","Yogyakarta","Gunungkidul","Kulon Progo"];

export default function DestinationsPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<Destination[]>([]);
  const [filtered, setFiltered] = useState<Destination[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/destinations")
      .then(r => r.json())
      .then(d => {
        const list: Destination[] = d?.data ?? [];
        setAll(list);
        setFiltered(list);
      })
      .catch(() => showToast("Error", "Failed to load destinations", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let list = all;
    if (search) list = list.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.location ?? "").toLowerCase().includes(search.toLowerCase())
    );
    if (category) list = list.filter(d => d.category === category);
    if (region)   list = list.filter(d => d.sub_region === region);
    if (rating === "high") list = list.filter(d => (d.rating ?? 0) >= 4.5);
    else if (rating === "mid") list = list.filter(d => (d.rating ?? 0) >= 3.5 && (d.rating ?? 0) < 4.5);
    else if (rating === "low") list = list.filter(d => (d.rating ?? 0) < 3.5);
    setFiltered(list);
  }, [all, search, category, region, rating]);

  function exportCSV() {
    const rows = [["Name","Category","Region","Rating","Reviews"]];
    filtered.forEach(d => rows.push([d.name, d.category ?? "", d.sub_region ?? "", String(d.rating ?? 0), String(d.review_count ?? 0)]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "destinations.csv";
    a.click();
    showToast("Export", "CSV download started", "success");
  }

  const imgFor = (dest: Destination): string => firstImage(dest.images);

  return (
    <>
      <Header activeId="destinations" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Destination Registry</h2>
            <p className="text-xs text-gray-500 mt-1">Manage locations, categories, AI scoring, and publishing statuses.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => showToast("Import Registry","Uploading CSV manifest","info")} className="flex items-center gap-2 bg-white hover:bg-bg border border-border text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-apple transition-premium cursor-pointer">
              <DownloadCloud className="w-4 h-4 text-gray-500" /><span>Import CSV</span>
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 bg-white hover:bg-bg border border-border text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-apple transition-premium cursor-pointer">
              <FileSpreadsheet className="w-4 h-4 text-gray-500" /><span>Export Excel</span>
            </button>
            <Link href="/destinations/create" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition-premium cursor-pointer">
              <Plus className="w-4 h-4" /><span>Add Destination</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none"><Search className="w-4 h-4" /></span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, address or tags..." className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={rating} onChange={e => setRating(e.target.value)} className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Ratings</option>
            <option value="high">High (4.5+)</option>
            <option value="mid">Mid (3.5–4.5)</option>
            <option value="low">Low (below 3.5)</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Destination</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Region</th>
                  <th className="py-4 px-4 text-center">Rating</th>
                  <th className="py-4 px-4 text-center">Reviews</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {loading ? (
                  <tr><td colSpan={7} className="py-16 text-center text-gray-400 text-sm">Loading destinations…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <Search className="w-10 h-10" />
                        <span className="text-sm font-semibold">No destinations found</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(dest => (
                  <tr key={dest.id} className="hover:bg-bg/40 transition-premium">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <Image src={imgFor(dest)} alt={dest.name} width={48} height={48} className="w-12 h-12 rounded-xl object-cover border border-border" />
                        <div>
                          <Link href={`/destinations/${dest.id}`} className="text-sm font-bold text-gray-900 font-display hover:text-primary transition-colors block">{dest.name}</Link>
                          <span className="text-[10px] text-gray-400 block mt-0.5">{dest.location || dest.sub_region || "Yogyakarta"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-display">{dest.category || "N/A"}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold">{dest.sub_region || "N/A"}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-warning">
                        <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                        {dest.rating ? dest.rating.toFixed(1) : "0.0"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-gray-800">{dest.review_count ?? 0}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-success/10 text-success text-[10px] font-bold px-2.5 py-0.5 rounded-full">Published</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/destinations/${dest.id}`} className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 hover:text-text cursor-pointer transition-premium inline-flex">
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5 border-t border-border flex items-center justify-between">
            <span className="text-xs text-gray-500 font-semibold">Showing {filtered.length} destinations</span>
          </div>
        </div>
      </main>
    </>
  );
}
