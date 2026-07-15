"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { Briefcase, CheckCircle, Clock, Search, Star, Loader2, MapPin, Phone, Globe } from "lucide-react";
import type { Partner } from "@/types";

export default function PartnersPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<Partner[]>([]);
  const [filtered, setFiltered] = useState<Partner[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partners")
      .then((r) => r.json())
      .then((d) => {
        const list: Partner[] = d?.data ?? [];
        setAll(list);
        setFiltered(list);
      })
      .catch(() => showToast("Error", "Failed to load partners", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let list = all;
    if (search)
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.location ?? "").toLowerCase().includes(search.toLowerCase())
      );
    if (category) list = list.filter((p) => p.category === category);
    setFiltered(list);
  }, [all, search, category]);

  const categories = Array.from(new Set(all.map((p) => p.category).filter(Boolean))) as string[];

  return (
    <>
      <Header activeId="partners" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Tourism Partners</h2>
            <p className="text-xs text-gray-500 mt-1">Manage business partnerships, verification statuses, and listing agreements.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Briefcase className="w-4 h-4" /><span>Add Partner</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or location…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Loading partners…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Search className="w-10 h-10" />
            <span className="text-sm font-semibold">No partners found</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-card border border-border shadow-soft overflow-hidden hover:border-primary/20 hover:shadow-premium transition-premium flex flex-col"
              >
                {/* Hero image */}
                <div className="relative h-44 bg-gray-100 flex-shrink-0">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Briefcase className="w-10 h-10" />
                    </div>
                  )}
                  {/* Category badge */}
                  {p.category && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold text-primary bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-lg shadow-sm">
                      {p.category}
                    </span>
                  )}
                  {/* Rating badge */}
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {p.rating && p.rating > 0 ? (
                      <><Star className="w-3 h-3 fill-warning text-warning" />{p.rating.toFixed(1)}</>
                    ) : (
                      <><Clock className="w-3 h-3" /> Pending</>
                    )}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  {/* Name */}
                  <h4 className="text-sm font-bold text-gray-900 font-display leading-snug">{p.name}</h4>

                  {/* Description */}
                  {p.description && (
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{p.description}</p>
                  )}

                  {/* Details */}
                  <div className="text-[10px] text-gray-400 space-y-1.5 border-t border-border pt-3 mt-auto">
                    {p.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="text-gray-600 font-medium truncate">{p.location}</span>
                      </div>
                    )}
                    {p.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="text-gray-600 font-medium">{p.phone}</span>
                      </div>
                    )}
                    {p.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 flex-shrink-0" />
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-medium hover:underline truncate"
                        >
                          {p.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    {p.price && (
                      <div className="flex justify-between">
                        <span>Price</span>
                        <span className="text-gray-600 font-medium">{p.price}</span>
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <div>
                    {p.rating && p.rating > 0 ? (
                      <span className="flex items-center gap-1 bg-success/10 text-success text-[10px] font-bold px-2.5 py-1 rounded-full w-fit">
                        <CheckCircle className="w-3 h-3" /> Active Partner
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-warning/10 text-warning text-[10px] font-bold px-2.5 py-1 rounded-full w-fit">
                        <Clock className="w-3 h-3" /> Pending Verification
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer count */}
        {!loading && (
          <div className="text-xs text-gray-400 font-semibold">
            Showing {filtered.length} partner{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </main>
    </>
  );
}
