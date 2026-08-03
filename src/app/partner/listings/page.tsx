"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PartnerHeader from "@/components/PartnerHeader";
import { useToast } from "@/components/Toast";
import { MapPin, Plus, CheckCircle2, Eye, Star, Edit3, Image as ImageIcon } from "lucide-react";
import type { Partner } from "@/types";

export default function PartnerListingsPage() {
  const { showToast } = useToast();
  const [listings, setListings] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      try {
        let meRes = await fetch("/api/partners/me");
        let meData = await meRes.json();
        let list: Partner[] = meData?.data ?? [];

        if (!Array.isArray(list) || list.length === 0) {
          const bizRes = await fetch("/api/businesses/me");
          const bizData = await bizRes.json();
          const bizList = bizData?.data ?? (Array.isArray(bizData) ? bizData : []);
          if (Array.isArray(bizList) && bizList.length > 0) {
            list = bizList.map((b: any) => ({
              id: b.external_id || String(b.id),
              name: b.name,
              category: b.category || "Wisata",
              status: b.status || "approved",
              description: b.description || "",
            })) as Partner[];
          }
        }

        setListings(list);
      } catch {
        showToast("Error", "Failed to load listings", "error");
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  return (
    <>
      <PartnerHeader />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 font-display">Kelola destinasi</h1>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Listing yang terhubung ke bisnis Anda
            </p>
          </div>
          <a
            href="http://localhost:3001/business/claim"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-[#B57A21] hover:bg-[#9B671A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan klaim listing lain</span>
          </a>
        </div>

        {/* Listings List */}
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-900">Candi Sonobudoyo Museum</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                      Terverifikasi
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 font-medium mt-0.5">Destinasi • Kraton, Yogyakarta</p>
                  <div className="flex items-center gap-4 text-[11px] text-stone-500 font-semibold mt-2">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-stone-400" />
                      1.240 impresi
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      4.6 rating
                    </span>
                  </div>
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
          ) : (
            listings.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 overflow-hidden relative shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <MapPin className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900">{item.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                        {item.status === "approved" ? "Terverifikasi" : item.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 font-medium mt-0.5">
                      {item.category} • {item.location || "Yogyakarta"}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-stone-500 font-semibold mt-2">
                      <span>{(item.impression_count || 1240).toLocaleString()} impresi</span>
                      <span>{(item.rating || 4.6).toFixed(1)} rating</span>
                    </div>
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
            ))
          )}
        </div>

        {/* Footer Hint Box */}
        <div className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/60 text-center text-xs font-medium text-stone-500">
          Punya tempat lain yang belum diklaim?{" "}
          <a
            href="http://localhost:3001/business/claim"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B57A21] font-bold hover:underline"
          >
            Ajukan klaim listing baru.
          </a>
        </div>
      </main>
    </>
  );
}