"use client";

import { useEffect, useState } from "react";
import PartnerHeader from "@/components/PartnerHeader";
import { useToast } from "@/components/Toast";
import { 
  Tag, 
  Search, 
  Loader2, 
  Calendar,
  Percent,
  Plus,
  Edit3,
  Trash2
} from "lucide-react";
import type { Partner } from "@/types";

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
  partner_id?: string;
}

export default function PartnerPromotionsPage() {
  const { showToast } = useToast();
  const [listings, setListings] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filtered, setFiltered] = useState<Promotion[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingPromos, setLoadingPromos] = useState(false);

  useEffect(() => {
    fetch("/api/partners/me")
      .then((r) => r.json())
      .then((d) => {
        const list: Partner[] = d?.data ?? [];
        setListings(list);
        if (list.length > 0) {
          setSelectedPartnerId(list[0].id);
        }
      })
      .catch(() => showToast("Error", "Failed to load your listings", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedPartnerId) return;
    
    setLoadingPromos(true);
    fetch(`/api/partners/me/${selectedPartnerId}/promotions`)
      .then((r) => r.json())
      .then((d) => {
        const list: Promotion[] = d?.data ?? [];
        setPromotions(list);
        setFiltered(list);
      })
      .catch(() => showToast("Error", "Failed to load promotions", "error"))
      .finally(() => setLoadingPromos(false));
  }, [selectedPartnerId, showToast]);

  useEffect(() => {
    let list = promotions;
    if (search)
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (p.code ?? "").toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(list);
  }, [promotions, search]);

  async function deletePromotion(promoId: string) {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    const res = await fetch(`/api/partners/me/${selectedPartnerId}/promotions/${promoId}`, { method: "DELETE" });
    if (res.ok) {
      setPromotions(prev => prev.filter(p => p.id !== promoId));
      showToast("Deleted", "Promotion removed", "success");
    } else {
      showToast("Error", "Delete failed", "error");
    }
  }

  return (
    <>
      <PartnerHeader />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">My Promotions</h2>
            <p className="text-xs text-gray-500 mt-1">Manage promotions for your listings.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Plus className="w-4 h-4" /><span>Create Promotion</span>
          </button>
        </div>

        {/* Partner selector */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft">
          <label className="block text-xs font-bold text-gray-700 mb-2">Select Listing</label>
          <select
            value={selectedPartnerId}
            onChange={(e) => setSelectedPartnerId(e.target.value)}
            className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer"
            disabled={loading}
          >
            {listings.length === 0 ? (
              <option value="">No listings available</option>
            ) : (
              listings.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))
            )}
          </select>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, or code..."
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium"
              disabled={!selectedPartnerId}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Loading your listings...</span>
          </div>
        ) : !selectedPartnerId ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Tag className="w-10 h-10" />
            <span className="text-sm font-semibold">Select a listing to manage promotions</span>
          </div>
        ) : loadingPromos ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Loading promotions...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Tag className="w-10 h-10" />
            <span className="text-sm font-semibold">No promotions found</span>
            <p className="text-xs text-gray-400">Create your first promotion to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-card border border-border shadow-soft overflow-hidden hover:border-primary/20 hover:shadow-premium transition-premium flex flex-col"
              >
                {/* Hero image */}
                <div className="relative h-44 bg-gray-100 flex-shrink-0">
                  {promo.image_url ? (
                    <img
                      src={promo.image_url}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Tag className="w-10 h-10" />
                    </div>
                  )}
                  {promo.discount && (
                    <span className="absolute top-3 left-3 flex items-center gap-1 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <Percent className="w-3 h-3" /> {promo.discount}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-gray-900 font-display leading-snug">{promo.title}</h4>
                    <div className="flex gap-1">
                        <button className="p-1 hover:bg-bg rounded"><Edit3 className="w-3.5 h-3.5 text-gray-400" /></button>
                        <button onClick={() => deletePromotion(promo.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-danger" /></button>
                    </div>
                  </div>

                  {promo.description && (
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{promo.description}</p>
                  )}

                  <div className="text-[10px] text-gray-400 space-y-1.5 border-t border-border pt-3 mt-auto">
                    {promo.start_date && promo.end_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="text-gray-600 font-medium">
                          {new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {promo.code && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-600 font-medium">Code: {promo.code}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full w-fit ${
                      promo.status === "active" 
                        ? "bg-success/10 text-success" 
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {promo.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer count */}
        {!loading && selectedPartnerId && !loadingPromos && (
          <div className="text-xs text-gray-400 font-semibold">
            Showing {filtered.length} promotion{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </main>
    </>
  );
}