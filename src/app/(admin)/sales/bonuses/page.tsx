"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  Trophy, Search, Loader2, CheckCircle, Clock, XCircle, ChevronDown, BadgeCheck, Ban,
} from "lucide-react";
import type { SalesBonusRecord } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  paid:    "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  voided:  "bg-danger/10 text-danger border-danger/20",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  paid:    CheckCircle,
  pending: Clock,
  voided:  XCircle,
};

const TYPE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  milestone: "Milestone",
};

function formatIDR(amount: number) {
  return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function BonusesPage() {
  const { showToast } = useToast();
  const [all, setAll]           = useState<SalesBonusRecord[]>([]);
  const [filtered, setFiltered] = useState<SalesBonusRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/sales/bonuses")
      .then((r) => r.json())
      .then((d) => {
        const list: SalesBonusRecord[] = d?.data ?? [];
        setAll(list);
        setFiltered(list);
      })
      .catch(() => showToast("Error", "Gagal memuat data bonus", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markStatus = (b: SalesBonusRecord, status: "paid" | "voided") => {
    const ok = window.confirm(
      status === "paid"
        ? `Tandai bonus ${formatIDR(b.amount)} sebagai PAID (sudah dibayarkan)?`
        : `Tandai bonus ${formatIDR(b.amount)} sebagai VOIDED (payout dibatalkan)?`
    );
    if (!ok) return;
    fetch(`/api/sales/bonuses/${b.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.status === "success") {
          showToast("Success", `Bonus ditandai ${status}`);
          load();
        } else {
          showToast("Error", d?.message ?? "Gagal memperbarui status", "error");
        }
      })
      .catch(() => showToast("Error", "Gagal memperbarui status", "error"));
  };

  useEffect(() => {
    let list = all;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          (b.sales_user_name ?? "").toLowerCase().includes(q) ||
          String(b.sales_user_id).includes(q)
      );
    }
    if (typeFilter)   list = list.filter((b) => b.type === typeFilter);
    if (statusFilter) list = list.filter((b) => b.status === statusFilter);
    setFiltered(list);
  }, [all, search, typeFilter, statusFilter]);

  const totalPaid = all
    .filter((b) => b.status === "paid")
    .reduce((s, b) => s + b.amount, 0);
  const totalPending = all
    .filter((b) => b.status === "pending")
    .reduce((s, b) => s + b.amount, 0);

  return (
    <>
      <Header activeId="bonuses" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
              Bonus Records
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Seluruh bonus sales — onboarding &amp; milestone — dari aturan aktif.
            </p>
          </div>
          {!loading && (
            <div className="flex gap-3">
              <div className="bg-warning/5 border border-warning/20 rounded-xl px-4 py-2.5 text-right">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Pending</p>
                <p className="text-base font-extrabold text-warning">{formatIDR(totalPending)}</p>
              </div>
              <div className="bg-success/5 border border-success/20 rounded-xl px-4 py-2.5 text-right">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Paid</p>
                <p className="text-base font-extrabold text-success">{formatIDR(totalPaid)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama sales…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium"
            />
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none bg-bg focus:bg-white text-xs px-3.5 py-2.5 pr-8 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer"
            >
              <option value="">Semua Tipe</option>
              <option value="onboarding">Onboarding</option>
              <option value="milestone">Milestone</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-bg focus:bg-white text-xs px-3.5 py-2.5 pr-8 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="voided">Voided</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Memuat bonus…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Trophy className="w-10 h-10" />
            <span className="text-sm font-semibold">Belum ada bonus</span>
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
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Dibuat</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((b) => {
                    const StatusIcon = STATUS_ICONS[b.status] ?? Clock;
                    return (
                      <tr key={b.id} className="hover:bg-bg/60 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-800">{b.sales_user_name || `Sales #${b.sales_user_id}`}</p>
                          {b.sales_user_email && (
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{b.sales_user_email}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {TYPE_LABELS[b.type] ?? b.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono">
                          {b.type === "milestone"
                            ? `${b.metric} ≥ ${b.tier} · ${b.period ?? "—"}`
                            : `Tenant #${b.tenant_user_id ?? "—"}`}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-800">{formatIDR(b.amount)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              STATUS_STYLES[b.status] ?? "bg-gray-100 text-gray-500 border-gray-200"
                            }`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 font-mono">{formatDate(b.created_at)}</td>
                        <td className="px-4 py-3">
                          {b.status === "pending" ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => markStatus(b, "paid")}
                                className="inline-flex items-center gap-1 p-1.5 rounded-lg text-success hover:bg-success/10 transition cursor-pointer"
                                title="Mark Paid"
                              >
                                <BadgeCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => markStatus(b, "voided")}
                                className="inline-flex items-center gap-1 p-1.5 rounded-lg text-danger hover:bg-danger/10 transition cursor-pointer"
                                title="Mark Voided"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-[10px] font-semibold">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && (
          <p className="text-xs text-gray-400 font-semibold">
            {filtered.length} bonus ditampilkan
          </p>
        )}
      </main>
    </>
  );
}
