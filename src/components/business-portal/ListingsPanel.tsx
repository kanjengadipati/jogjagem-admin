"use client";

import { useEffect, useState } from "react";
import BusinessHeader from "@/components/BusinessHeader";
import { useToast } from "@/components/Toast";
import { MapPin, Plus, Tag, Info, Loader2 } from "lucide-react";
import { useActiveBusiness } from "@/hooks/useActiveBusiness";

interface OwnedListing {
  listing_type: string;
  id: string;
  name: string;
  status?: string;
}

const CATEGORY_TITLES: Record<string, string> = {
  "Wisata & Destinasi": "Kelola Destinasi",
  Kuliner: "Kelola Kuliner",
  "Hotel & Penginapan": "Kelola Hotel & Penginapan",
  "Oleh-oleh": "Kelola Oleh-oleh",
  Jasa: "Layanan Jasa",
};

const JASA_CATEGORIES = ["Jasa", "Lainnya"];

export default function ListingsPanel() {
  const { showToast } = useToast();
  const { active: business, loading: loadingBiz, externalId } = useActiveBusiness();
  const [listings, setListings] = useState<OwnedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business) return;

    const targetId = externalId || business.id;
    async function loadListings() {
      setLoading(true);
      try {
        const res = await fetch(`/api/businesses/me/${targetId}/listings`);
        const data = await res.json();
        const list: OwnedListing[] = data?.data ?? (Array.isArray(data) ? data : []);
        setListings(Array.isArray(list) ? list : []);
      } catch {
        setListings([]);
        showToast("Error", "Failed to load listings", "error");
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, [business, externalId]);

  const category = business?.category || "Wisata & Destinasi";
  const isJasa = JASA_CATEGORIES.includes(category);
  const title = CATEGORY_TITLES[category] ?? "Kelola Listing";
  const loadingAny = loadingBiz || (!!business && loading);

  return (
    <>
      <BusinessHeader />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 font-display">{title}</h1>
            <p className="text-xs text-stone-500 font-medium mt-1">
              {business ? `Listing milik ${business.name}` : "Listing yang terhubung ke bisnis Anda"}
            </p>
          </div>
          {!isJasa && (
            <a
              href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001'}/business/claim`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-[#B57A21] hover:bg-[#9B671A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan klaim listing lain</span>
            </a>
          )}
        </div>

        {isJasa ? (
          <div className="p-6 rounded-3xl border border-amber-200/70 bg-amber-50/60 flex items-start gap-3.5">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">Bisnis kategori {category}</h3>
              <p className="text-xs text-stone-600 font-medium mt-1 leading-relaxed">
                Bisnis di kategori ini (misalnya penyewaan, tour guide, event organizer) dikelola langsung
                melalui profil bisnis dan layanan yang Anda jual, tanpa perlu mengklaim listing destinasi.
              </p>
            </div>
          </div>
        ) : loadingAny ? (
          <div className="flex items-center justify-center py-24 text-stone-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Memuat listing...</span>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-stone-200 rounded-3xl bg-white shadow-xs">
            <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-stone-900">Belum ada {title.toLowerCase()} terdaftar</h3>
            <p className="text-xs text-stone-500 font-medium mt-1 mb-4">
              Mulai kelola bisnis Anda dengan mengklaim listing.
            </p>
            <a
              href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001'}/business/claim`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2.5 rounded-2xl bg-[#B57A21] hover:bg-[#9B671A] text-white text-xs font-bold transition-all"
            >
              Ajukan klaim listing baru
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((item) => (
              <div
                key={`${item.listing_type}:${item.id}`}
                className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 overflow-hidden relative shrink-0 flex items-center justify-center text-stone-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900">{item.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                        {item.status === "approved" || !item.status ? "Terverifikasi" : item.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 font-medium mt-0.5 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {item.listing_type} • {item.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 transition-all cursor-pointer">
                    Edit profil
                  </button>
                  <button className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 transition-all cursor-pointer">
                    Kelola media
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isJasa && listings.length > 0 && (
          <div className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/60 text-center text-xs font-medium text-stone-500">
            Punya tempat lain yang belum diklaim?{" "}
            <a
              href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001'}/business/claim`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B57A21] font-bold hover:underline"
            >
              Ajukan klaim listing baru.
            </a>
          </div>
        )}
      </main>
    </>
  );
}
