"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  Loader2, Save, Coins, BadgePercent, CalendarRange, RefreshCw, AlertCircle,
} from "lucide-react";
import { PLACEMENT_NAMES } from "@/lib/adPlacements";

interface PlacementPrice {
  placement: string;
  name: string;
  monthly_rate: number;
  effective_monthly_rate: number;
  currency: string;
  promo_pct: number;
  promo_label: string;
  promo_active: boolean;
  promo_start_at?: string;
  promo_end_at?: string;
}

interface PricingResponse {
  placements: PlacementPrice[];
  volume_discounts: Record<string, number>;
}

interface EditState {
  monthly_rate: string;
  promo_pct: string;
  promo_label: string;
  promo_start_at: string;
  promo_end_at: string;
}

function toDateInput(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function fmtRupiah(n?: number) {
  if (n == null) return "—";
  return "Rp " + n.toLocaleString("id-ID");
}

export default function AdPricingPage() {
  const { showToast } = useToast();
  const [pricing, setPricing] = useState<PlacementPrice[]>([]);
  const [volumeDiscounts, setVolumeDiscounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, EditState>>({});

  function load() {
    setLoading(true);
    fetch("/api/ads/pricing")
      .then((r) => r.json())
      .then((d) => {
        const data: PricingResponse | undefined = d?.data;
        const list = data?.placements ?? [];
        setPricing(list);
        setVolumeDiscounts(data?.volume_discounts ?? {});
        const next: Record<string, EditState> = {};
        list.forEach((p) => {
          next[p.placement] = {
            monthly_rate: String(p.monthly_rate ?? ""),
            promo_pct: String(p.promo_pct ?? "0"),
            promo_label: p.promo_label ?? "",
            promo_start_at: toDateInput(p.promo_start_at),
            promo_end_at: toDateInput(p.promo_end_at),
          };
        });
        setEdits(next);
      })
      .catch(() => showToast("Error", "Failed to load placement pricing", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  function edit(p: PlacementPrice, key: keyof EditState, value: string) {
    setEdits((prev) => ({
      ...prev,
      [p.placement]: { ...(prev[p.placement] ?? {}), [key]: value },
    }));
  }

  function effectiveRate(p: PlacementPrice): number {
    const e = edits[p.placement];
    if (!e) return p.effective_monthly_rate;
    const rate = Number(e.monthly_rate) || 0;
    const pct = Number(e.promo_pct) || 0;
    if (pct > 0) return rate * (1 - pct / 100);
    return rate;
  }

  async function savePlacement(p: PlacementPrice) {
    const e = edits[p.placement];
    if (!e) return;
    if (Number(e.monthly_rate) < 0) {
      showToast("Error", "Monthly rate cannot be negative", "error");
      return;
    }
    const pct = Number(e.promo_pct) || 0;
    if (pct < 0 || pct > 100) {
      showToast("Error", "Promo percent must be between 0 and 100", "error");
      return;
    }
    setSaving(p.placement);
    try {
      const res = await fetch(`/api/ads/pricing/${p.placement}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_rate: Number(e.monthly_rate) || 0,
          promo_pct: pct,
          promo_label: e.promo_label.trim(),
          promo_start_at: e.promo_start_at ? new Date(e.promo_start_at).toISOString() : undefined,
          promo_end_at: e.promo_end_at ? new Date(e.promo_end_at).toISOString() : undefined,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json().catch(() => null);
      const data = updated?.data;
      if (data) {
        setPricing((prev) =>
          prev.map((x) =>
            x.placement === p.placement
              ? {
                  ...x,
                  monthly_rate: Number(e.monthly_rate) || 0,
                  promo_pct: pct,
                  promo_label: e.promo_label.trim(),
                  promo_start_at: e.promo_start_at
                    ? new Date(e.promo_start_at).toISOString()
                    : undefined,
                  promo_end_at: e.promo_end_at
                    ? new Date(e.promo_end_at).toISOString()
                    : undefined,
                  effective_monthly_rate:
                    (data.effective_monthly_rate ?? effectiveRate(x)) ||
                    (pct > 0 ? (Number(e.monthly_rate) || 0) * (1 - pct / 100) : Number(e.monthly_rate) || 0),
                }
              : x
          )
        );
      }
      showToast("Saved", `Pricing for "${PLACEMENT_NAMES[p.placement] ?? p.placement}" updated`, "success");
    } catch {
      showToast("Error", "Failed to save placement pricing", "error");
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <Header activeId="ad-pricing" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Placement Pricing</h2>
            <p className="text-xs text-gray-500 mt-1">
              Customize monthly ad rates and run promos/discounts per placement. Effective rate reflects any active promo.
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 bg-bg hover:bg-primary/10 text-gray-600 hover:text-primary px-4 py-2.5 rounded-xl text-xs font-semibold border border-border transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /><span>Reload</span>
          </button>
        </div>

        {/* Volume discounts info */}
        {Object.keys(volumeDiscounts).length > 0 && (
          <div className="flex items-start gap-3 p-5 rounded-card border border-border bg-white shadow-soft">
            <BadgePercent className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-800 font-display">Long-term volume discounts (auto-applied)</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                {Object.entries(volumeDiscounts)
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([months, pct]) => `${months} months → −${Math.round((pct ?? 0) * 100)}%`)
                  .join("  ·  ")}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Applied on top of the effective monthly rate whenever a campaign covers that many months.
              </p>
            </div>
          </div>
        )}

        {/* Pricing list */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Loading placement pricing...</span>
          </div>
        ) : pricing.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Coins className="w-10 h-10" />
            <span className="text-sm font-semibold">No placement pricing found</span>
          </div>
        ) : (
          <div className="space-y-4">
            {pricing.map((p) => {
              const e = edits[p.placement];
              const effective = effectiveRate(p);
              const pct = Number(e?.promo_pct) || 0;
              const hasPromo = pct > 0;
              return (
                <div key={p.placement} className="bg-white rounded-card border border-border shadow-soft p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 font-display">
                        {PLACEMENT_NAMES[p.placement] ?? p.name}
                      </h4>
                      <span className="text-[10px] font-mono text-gray-400">{p.placement}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-gray-900">{fmtRupiah(effective)}</span>
                      <span className="text-[10px] text-gray-400 ml-1">/bulan efektif</span>
                      {hasPromo && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                          <BadgePercent className="w-3 h-3" /> −{pct}% promo
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Monthly rate (IDR)</label>
                      <input
                        type="number"
                        min={0}
                        value={e?.monthly_rate ?? ""}
                        onChange={(ev) => edit(p, "monthly_rate", ev.target.value)}
                        placeholder="0"
                        className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Promo %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={e?.promo_pct ?? "0"}
                        onChange={(ev) => edit(p, "promo_pct", ev.target.value)}
                        placeholder="0"
                        className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Promo label</label>
                      <input
                        type="text"
                        value={e?.promo_label ?? ""}
                        onChange={(ev) => edit(p, "promo_label", ev.target.value)}
                        placeholder="e.g. Promo Ramadan −20%"
                        className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                        <CalendarRange className="w-3 h-3 inline mr-1 -mt-0.5" />Promo window (optional)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" value={e?.promo_start_at ?? ""} onChange={(ev) => edit(p, "promo_start_at", ev.target.value)}
                          className="w-full bg-bg focus:bg-white text-[11px] px-2.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition font-medium" />
                        <input type="date" value={e?.promo_end_at ?? ""} onChange={(ev) => edit(p, "promo_end_at", ev.target.value)}
                          className="w-full bg-bg focus:bg-white text-[11px] px-2.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition font-medium" />
                      </div>
                    </div>
                  </div>

                  {hasPromo && Number(e?.monthly_rate) > 0 && (
                    <p className="mt-3 text-[10px] text-gray-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Base {fmtRupiah(Number(e.monthly_rate))} → effective {fmtRupiah(effective)}/bulan selama promo aktif.
                      Kosongkan tanggal agar promo berlaku selamanya.
                    </p>
                  )}

                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={() => savePlacement(p)}
                      disabled={saving === p.placement}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      {saving === p.placement ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      {saving === p.placement ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
