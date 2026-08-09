"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  TrendingUp,
  Loader2,
  Users,
  Receipt,
  Coins,
  Trophy,
  ChevronDown,
  Percent,
} from "lucide-react";
import type { SalesPerformanceItem, SalesBonusRecord } from "@/types";

function formatIDR(amount: number) {
  return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
}

function formatPercent(rate: number) {
  return `${(rate * 100).toFixed(0)}%`;
}

const TYPE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  milestone: "Milestone",
};

export default function SalesPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<SalesPerformanceItem[]>([]);
  const [bonuses, setBonuses] = useState<SalesBonusRecord[]>([]);
  const [tier1Rate, setTier1Rate] = useState(0.2);
  const [tier2Rate, setTier2Rate] = useState(0.1);
  const [tier1Input, setTier1Input] = useState("20");
  const [tier2Input, setTier2Input] = useState("10");
  const [editingRate, setEditingRate] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/sales/performance").then((r) => r.json()),
      fetch("/api/sales/bonuses").then((r) => r.json()),
      fetch("/api/sales/commission-rate").then((r) => r.json()),
    ])
      .then(([perf, bonusRes, rateRes]) => {
        const list: SalesPerformanceItem[] = perf?.data ?? [];
        const bonusList: SalesBonusRecord[] = bonusRes?.data ?? [];
        const r = rateRes?.data;
        setItems(list);
        setBonuses(bonusList);
        if (typeof r?.tier1_rate === "number") {
          setTier1Rate(r.tier1_rate);
          setTier1Input(String(Math.round(r.tier1_rate * 100)));
        }
        if (typeof r?.tier2_rate === "number") {
          setTier2Rate(r.tier2_rate);
          setTier2Input(String(Math.round(r.tier2_rate * 100)));
        }
      })
      .catch(() => showToast("Error", "Gagal memuat data penjualan", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    const bonusMap = new Map<number, { pending: number; total: number; count: number }>();
    for (const b of bonuses) {
      const acc = bonusMap.get(b.sales_user_id) ?? { pending: 0, total: 0, count: 0 };
      acc.total += b.amount;
      acc.count += 1;
      if (b.status === "pending") acc.pending += b.amount;
      bonusMap.set(b.sales_user_id, acc);
    }
    return items.map((it) => {
      const b = bonusMap.get(it.sales_user_id) ?? { pending: 0, total: 0, count: 0 };
      return { ...it, bonusPending: b.pending, bonusTotal: b.total, bonusCount: b.count };
    });
  }, [items, bonuses]);

  const totalVolume = items.reduce((s, i) => s + i.total_volume, 0);
  const totalCommission = items.reduce((s, i) => s + i.total_commission_earned, 0);
  const totalBonus = bonuses.reduce((s, b) => s + b.amount, 0);
  const totalPendingBonus = bonuses
    .filter((b) => b.status === "pending")
    .reduce((s, b) => s + b.amount, 0);

  const saveRate = () => {
    const t1 = Number(tier1Input);
    const t2 = Number(tier2Input);
    if (
      Number.isNaN(t1) || t1 <= 0 || t1 >= 100 ||
      Number.isNaN(t2) || t2 <= 0 || t2 >= 100
    ) {
      showToast("Invalid", "Rate harus antara 0% dan 100%", "error");
      return;
    }
    fetch("/api/sales/commission-rate", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier1_rate: t1 / 100, tier2_rate: t2 / 100 }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.status === "success" && typeof d?.data?.tier1_rate === "number") {
          setTier1Rate(d.data.tier1_rate);
          setTier2Rate(d.data.tier2_rate ?? tier2Rate);
          setEditingRate(false);
          showToast("Success", "Rate komisi berhasil diperbarui");
        } else {
          showToast("Error", d?.message ?? "Gagal memperbarui rate", "error");
        }
      })
      .catch(() => showToast("Error", "Gagal memperbarui rate", "error"));
  };

  const statCards = [
    {
      label: "Total Volume",
      value: formatIDR(totalVolume),
      icon: TrendingUp,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Komisi Terkumpul",
      value: formatIDR(totalCommission),
      icon: Coins,
      color: "text-warning bg-warning/10",
    },
    {
      label: "Total Bonus",
      value: formatIDR(totalBonus),
      icon: Trophy,
      color: "text-success bg-success/10",
    },
    {
      label: "Bonus Pending",
      value: formatIDR(totalPendingBonus),
      icon: Users,
      color: "text-info bg-info/10",
    },
  ];

  return (
    <>
      <Header activeId="sales" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
              Sales Performance &amp; Earnings
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Kinerja tim sales — komisi per transaksi dan bonus onboarding/milestone.
            </p>
          </div>
          <Link
            href="/sales/bonus-rules"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            Kelola Bonus Rules
          </Link>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="bg-white rounded-card border border-border shadow-soft p-5 flex items-center gap-4"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      {s.label}
                    </p>
                    <p className="text-lg font-extrabold text-gray-900 font-display mt-0.5">
                      {s.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Commission rate */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Komisi Per Transaksi</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Tier 1 berlaku 12 bulan pertama sejak partner direferensikan, lalu turun ke Tier 2.
              </p>
            </div>
          </div>
          {editingRate ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tier 1</label>
                <div className="relative">
                  <input
                    type="number"
                    value={tier1Input}
                    onChange={(e) => setTier1Input(e.target.value)}
                    className="w-20 bg-bg focus:bg-white text-sm font-bold px-3.5 py-2 rounded-xl border border-transparent focus:border-border outline-none"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400 font-semibold pointer-events-none">
                    %
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tier 2</label>
                <div className="relative">
                  <input
                    type="number"
                    value={tier2Input}
                    onChange={(e) => setTier2Input(e.target.value)}
                    className="w-20 bg-bg focus:bg-white text-sm font-bold px-3.5 py-2 rounded-xl border border-transparent focus:border-border outline-none"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400 font-semibold pointer-events-none">
                    %
                  </span>
                </div>
              </div>
              <button
                onClick={saveRate}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition cursor-pointer"
              >
                Simpan
              </button>
              <button
                onClick={() => {
                  setEditingRate(false);
                  setTier1Input(String(Math.round(tier1Rate * 100)));
                  setTier2Input(String(Math.round(tier2Rate * 100)));
                }}
                className="px-3 py-2 rounded-xl border border-border text-xs font-bold text-gray-500 hover:bg-bg transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingRate(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-gray-700 hover:bg-bg transition cursor-pointer"
            >
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{formatPercent(tier1Rate)}</span>
              <span className="text-gray-400">→</span>
              <span className="bg-warning/10 text-warning px-2 py-0.5 rounded-full">{formatPercent(tier2Rate)}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Performance table */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Memuat data penjualan…</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Users className="w-10 h-10" />
            <span className="text-sm font-semibold">Belum ada data sales</span>
          </div>
        ) : (
          <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-bg">
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Sales</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Kode Referral</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Partner</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Transaksi</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Volume</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Komisi</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Bonus</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Total Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((it) => (
                    <tr key={it.sales_user_id} className="hover:bg-bg/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{it.sales_name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{it.sales_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                          {it.referral_code || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-semibold">{it.total_partners}</td>
                      <td className="px-4 py-3 text-gray-700 font-semibold">{it.total_transactions}</td>
                      <td className="px-4 py-3 font-bold text-gray-800">{formatIDR(it.total_volume)}</td>
                      <td className="px-4 py-3 font-semibold text-warning">
                        {formatIDR(it.total_commission_earned)}
                        {it.pending_commission > 0 && (
                          <span className="block text-[10px] text-gray-400 font-medium">
                            {formatIDR(it.pending_commission)} pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-success">
                        {formatIDR(it.bonusTotal)}
                        {it.bonusCount > 0 && (
                          <span className="block text-[10px] text-gray-400 font-medium">
                            {it.bonusCount}× {TYPE_LABELS[(bonuses.find((b) => b.sales_user_id === it.sales_user_id)?.type) ?? "onboarding"]}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {formatIDR(it.total_commission_earned + it.bonusTotal)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent bonuses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800 font-display">Bonus Terbaru</h3>
            <Link
              href="/sales/bonuses"
              className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
            >
              Lihat semua bonus →
            </Link>
          </div>
          {bonuses.length === 0 ? (
            <div className="bg-white rounded-card border border-border shadow-soft p-10 flex flex-col items-center gap-2 text-gray-400">
              <Receipt className="w-8 h-8" />
              <span className="text-xs font-semibold">Belum ada bonus tercatat</span>
            </div>
          ) : (
            <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-bg">
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Sales</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Tipe</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Detail</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Jumlah</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bonuses.slice(0, 8).map((b) => (
                      <tr key={b.id} className="hover:bg-bg/60 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-800">
                          {b.sales_user_name || `Sales #${b.sales_user_id}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {TYPE_LABELS[b.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono">
                          {b.type === "milestone"
                            ? `${b.metric} ≥ ${b.tier} · ${b.period ?? ""}`
                            : `Partner #${b.partner_user_id ?? "—"}`}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-800">{formatIDR(b.amount)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              b.status === "paid"
                                ? "bg-success/10 text-success border-success/20"
                                : b.status === "voided"
                                ? "bg-danger/10 text-danger border-danger/20"
                                : "bg-warning/10 text-warning border-warning/20"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
