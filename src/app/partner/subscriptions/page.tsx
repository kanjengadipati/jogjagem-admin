"use client";

import PartnerHeader from "@/components/PartnerHeader";
import { CreditCard, CheckCircle2, Shield, ArrowUpRight, Zap } from "lucide-react";

export default function PartnerSubscriptionsPage() {
  const plans = [
    {
      name: "Free",
      description: "Baru mulai, coba-coba dulu",
      isCurrent: false,
      buttonText: "Bukan paket saat ini",
      disabled: true,
    },
    {
      name: "Pro",
      description: "Tampil lebih menonjol",
      isCurrent: true,
      buttonText: "Paket aktif",
      disabled: true,
      badge: "Aktif",
    },
    {
      name: "Business+",
      description: "Slot iklan lebih banyak",
      isCurrent: false,
      buttonText: "Upgrade",
      disabled: false,
    },
    {
      name: "Enterprise",
      description: "Banyak listing sekaligus",
      isCurrent: false,
      buttonText: "Hubungi sales",
      disabled: false,
    },
  ];

  return (
    <>
      <PartnerHeader />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900 font-display">Langganan</h1>
          <p className="text-xs text-stone-500 font-medium mt-1">Paket aktif dan opsi upgrade untuk bisnis Anda</p>
        </div>

        {/* Current Subscription Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FAF3E6] to-[#FFFDF7] border border-[#F3E2BD] flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F8E3B9] text-[#A66E19] flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 fill-[#A66E19]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#6B440A]">Paket Pro</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAD4A6] text-[#6B440A] text-[10px] font-extrabold uppercase tracking-wide">
                  Aktif
                </span>
              </div>
              <p className="text-xs text-[#8F5D15] font-medium mt-1">
                Perpanjang otomatis 1 Sep 2026
              </p>
            </div>
          </div>
          <button className="px-4 py-2.5 rounded-2xl border border-[#EACD96] bg-white hover:bg-stone-50 text-xs font-bold text-[#825410] shadow-2xs transition-all cursor-pointer">
            Kelola pembayaran
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-3xl border bg-white flex flex-col justify-between space-y-5 transition-all shadow-xs relative ${
                plan.isCurrent ? "border-[#D9A34A] ring-2 ring-[#D9A34A]/20" : "border-stone-200/80"
              }`}
            >
              <div>
                {plan.badge && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FAF3E6] text-[#B5781E] border border-[#F2E3C6] text-[10px] font-extrabold uppercase tracking-wide mb-2">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-lg font-extrabold text-stone-900 font-display">{plan.name}</h3>
                <p className="text-xs text-stone-500 font-medium mt-1 leading-relaxed">{plan.description}</p>
              </div>

              <button
                disabled={plan.disabled}
                className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  plan.isCurrent
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                    : plan.disabled
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                    : "bg-[#B57A21] hover:bg-[#9B671A] text-white shadow-xs"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
