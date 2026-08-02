"use client";

import { useEffect, useState } from "react";
import PartnerHeader from "@/components/PartnerHeader";
import { useToast } from "@/components/Toast";
import { Tag, Megaphone, Eye, Plus, CheckCircle2, Ticket, Sparkles } from "lucide-react";

interface Promotion {
  id: string;
  title: string;
  code?: string;
  end_date?: string;
  status?: string;
}

export default function PartnerPromotionsPage() {
  const { showToast } = useToast();

  const promotions: Promotion[] = [
    {
      id: "1",
      title: "Diskon 20% tiket masuk",
      code: "SONO20",
      end_date: "31 Agu 2026",
      status: "approved",
    },
  ];

  const ads = [
    {
      title: "Banner halaman utama",
      subtitle: "Paket Pro • Sisa 12 hari",
      status: "Tayang",
    },
    {
      title: "Slot destinasi terkait",
      subtitle: "Muncul di halaman Malioboro, Tugu",
      status: "Tayang",
    },
  ];

  return (
    <>
      <PartnerHeader />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 font-display">Marketing</h1>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Kampanye, iklan, dan promosi untuk bisnis Anda
            </p>
          </div>
          <button className="px-4 py-2.5 rounded-2xl bg-[#B57A21] hover:bg-[#9B671A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Buat promosi</span>
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
            <div className="text-xs font-bold text-stone-500">Promosi aktif</div>
            <div className="text-3xl font-extrabold text-stone-900 font-display">1</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
            <div className="text-xs font-bold text-stone-500">Iklan tayang</div>
            <div className="text-3xl font-extrabold text-stone-900 font-display">2</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
            <div className="text-xs font-bold text-stone-500">Klik iklan (30 hari)</div>
            <div className="text-3xl font-extrabold text-stone-900 font-display">348</div>
          </div>
        </div>

        {/* Section 1: Promosi */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-stone-900 font-display flex items-center gap-2">
            <Ticket className="w-4 h-4 text-amber-600" />
            <span>Promosi</span>
          </h2>

          <div className="space-y-3">
            {promotions.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs font-bold text-stone-900">{p.title}</div>
                  <div className="text-[11px] text-stone-400 font-medium mt-0.5">
                    Kode: {p.code} • Berlaku sampai {p.end_date}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                  Aktif
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Iklan */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-stone-900 font-display flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Iklan</span>
          </h2>

          <div className="space-y-3">
            {ads.map((ad, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs font-bold text-stone-900">{ad.title}</div>
                  <div className="text-[11px] text-stone-400 font-medium mt-0.5">
                    {ad.subtitle}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                  {ad.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}