"use client";

import { useEffect, useState } from "react";
import PartnerHeader from "@/components/PartnerHeader";
import { useToast } from "@/components/Toast";
import { CreditCard, CheckCircle2, Shield, ArrowUpRight, Zap, Loader2, AlertCircle } from "lucide-react";

interface Subscription {
  external_id: string;
  business_id: number;
  plan: string;
  status: string;
  current_period_end?: string;
}

interface BusinessInfo {
  id: string;
  name: string;
  category: string;
}

const PLAN_META: Record<string, { description: string; label: string }> = {
  free: { label: "Free", description: "Baru mulai, coba-coba dulu" },
  pro: { label: "Pro", description: "Tampil lebih menonjol" },
  business_plus: { label: "Business+", description: "Slot iklan lebih banyak" },
  enterprise: { label: "Enterprise", description: "Banyak listing sekaligus" },
};

const PLAN_ORDER = ["free", "pro", "business_plus", "enterprise"];

function fmtDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PartnerSubscriptionsPage() {
  const { showToast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const bizRes = await fetch("/api/businesses/me");
        const bizJson = await bizRes.json();
        const bizList = bizJson?.data ?? (Array.isArray(bizJson) ? bizJson : []);
        if (!Array.isArray(bizList) || bizList.length === 0) return;
        const first = bizList[0];
        setBusiness({
          id: first.external_id || String(first.id),
          name: first.name || "Bisnis Saya",
          category: first.category || "Wisata",
        });

        const subRes = await fetch(
          `/api/businesses/me/${first.external_id || String(first.id)}/subscription`
        );
        const subJson = await subRes.json();
        const data = subJson?.data ?? subJson;
        if (data && typeof data === "object" && data.plan) {
          setSubscription(data as Subscription);
        }
      } catch {
        showToast("Error", "Gagal memuat data langganan", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const currentPlan = subscription?.plan ?? "free";
  const currentMeta = PLAN_META[currentPlan] ?? PLAN_META.free;

  if (loading) {
    return (
      <>
        <PartnerHeader />
        <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-center py-24 text-stone-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Memuat data langganan...</span>
          </div>
        </main>
      </>
    );
  }

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
                <span className="text-base font-extrabold text-[#6B440A]">Paket {currentMeta.label}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAD4A6] text-[#6B440A] text-[10px] font-extrabold uppercase tracking-wide">
                  {subscription?.status ?? "aktif"}
                </span>
              </div>
              <p className="text-xs text-[#8F5D15] font-medium mt-1">
                {business ? business.name : "Bisnis Anda"}
                {subscription?.current_period_end
                  ? ` • Perpanjang otomatis ${fmtDate(subscription.current_period_end)}`
                  : ""}
              </p>
            </div>
          </div>
          {/* TODO: Implement functional subscription purchase flow using SnapCheckoutButton + Payment */}
          <button
            onClick={() => showToast("Fitur upgrade akan segera hadir", "info")}
            className="px-4 py-2.5 rounded-2xl border border-[#EACD96] bg-white hover:bg-stone-50 text-xs font-bold text-[#825410] shadow-2xs transition-all cursor-pointer"
          >
            Kelola pembayaran
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLAN_ORDER.map((planKey) => {
            const plan = PLAN_META[planKey];
            const isCurrent = planKey === currentPlan;
            return (
              <div
                key={planKey}
                className={`p-6 rounded-3xl border bg-white flex flex-col justify-between space-y-5 transition-all shadow-xs relative ${
                  isCurrent ? "border-[#D9A34A] ring-2 ring-[#D9A34A]/20" : "border-stone-200/80"
                }`}
              >
                <div>
                  {isCurrent && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FAF3E6] text-[#B5781E] border border-[#F2E3C6] text-[10px] font-extrabold uppercase tracking-wide mb-2">
                      Paket aktif
                    </span>
                  )}
                  <h3 className="text-lg font-extrabold text-stone-900 font-display">{plan.label}</h3>
                  <p className="text-xs text-stone-500 font-medium mt-1 leading-relaxed">{plan.description}</p>
                </div>

                {isCurrent ? (
                  <div className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-stone-100 text-stone-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Paket aktif
                  </div>
                ) : planKey === "enterprise" ? (
                  <button
                    onClick={() => showToast("Hubungi tim sales untuk paket Enterprise", "info")}
                    className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer bg-stone-100 text-stone-700 hover:bg-stone-200"
                  >
                    Hubungi sales
                  </button>
                ) : (
                  // TODO: Implement functional subscription purchase flow using SnapCheckoutButton + Payment
                  <button
                    onClick={() => showToast("Fitur upgrade akan segera hadir", "info")}
                    className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer bg-[#B57A21] hover:bg-[#9B671A] text-white shadow-xs"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {!subscription && (
          <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Data langganan belum tersedia. Coba muat ulang halaman.
          </div>
        )}
      </main>
    </>
  );
}
