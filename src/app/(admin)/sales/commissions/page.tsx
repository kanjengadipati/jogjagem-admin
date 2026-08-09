"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  DollarSign,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Award,
  Sparkles,
  Gift,
  Target,
} from "lucide-react";
import type { SalesBonusRecord, SalesCommissionRecord } from "@/types";

const PAGE_SIZE = 10;

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

function formatPercent(rate: number) {
  return `${(rate * 100).toFixed(0)}%`;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function SalesCommissionsPage() {
  const { showToast } = useToast();
  const [bonuses, setBonuses] = useState<SalesBonusRecord[]>([]);
  const [commissions, setCommissions] = useState<SalesCommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"commissions" | "bonuses">("commissions");
  const [commPage, setCommPage] = useState(1);
  const [bonusPage, setBonusPage] = useState(1);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/sales/me/commissions?limit=100").then((r) => r.json()),
      fetch("/api/sales/me/bonuses?limit=100").then((r) => r.json()),
    ])
      .then(([commRes, bonusRes]) => {
        setCommissions(commRes?.data ?? []);
        setBonuses(bonusRes?.data ?? []);
      })
      .catch(() => showToast("Error", "Gagal memuat data komisi", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCommission = useMemo(
    () => commissions.reduce((s, c) => s + c.commission_amount, 0),
    [commissions]
  );
  const pendingCommission = useMemo(
    () => commissions.filter((c) => c.status === "pending").reduce((s, c) => s + c.commission_amount, 0),
    [commissions]
  );
  const totalBonus = useMemo(
    () => bonuses.reduce((s, b) => s + b.amount, 0),
    [bonuses]
  );
  const pendingBonus = useMemo(
    () => bonuses.filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0),
    [bonuses]
  );
  const onboardingCount = useMemo(
    () => bonuses.filter((b) => b.type === "onboarding").length,
    [bonuses]
  );
  const milestoneCount = useMemo(
    () => bonuses.filter((b) => b.type === "milestone").length,
    [bonuses]
  );
  const grandTotal = totalCommission + totalBonus;
  const pendingTotal = pendingCommission + pendingBonus;

  const totalCommPages = Math.max(1, Math.ceil(commissions.length / PAGE_SIZE));
  const totalBonusPages = Math.max(1, Math.ceil(bonuses.length / PAGE_SIZE));

  const pageCommissions = useMemo(
    () => commissions.slice((commPage - 1) * PAGE_SIZE, commPage * PAGE_SIZE),
    [commissions, commPage]
  );
  const pageBonuses = useMemo(
    () => bonuses.slice((bonusPage - 1) * PAGE_SIZE, bonusPage * PAGE_SIZE),
    [bonuses, bonusPage]
  );

  const summaryCards = [
    {
      label: "Total Pendapatan",
      value: formatIDR(grandTotal),
      icon: Sparkles,
      color: "text-emerald-600 bg-emerald-500/10",
      sub: "Komisi + Bonus terakumulasi",
    },
    {
      label: "Komisi Recurring",
      value: formatIDR(totalCommission),
      icon: DollarSign,
      color: "text-primary bg-primary/10",
      sub: "Komisi 20% per pembayaran",
    },
    {
      label: "Total Bonus",
      value: formatIDR(totalBonus),
      icon: Award,
      color: "text-amber-600 bg-amber-500/10",
      sub: `${onboardingCount} Onboarding · ${milestoneCount} Milestone`,
    },
    {
      label: "Pending Payout",
      value: formatIDR(pendingTotal),
      icon: Clock,
      color: "text-amber-600 bg-amber-500/10",
      sub: "Menunggu proses pencairan",
    },
  ];

  const renderStatus = (status: string) => {
    const StatusIcon = STATUS_ICONS[status] ?? Clock;
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500 border-gray-200"
        }`}
      >
        <StatusIcon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const renderPagination = (page: number, totalPages: number, onChange: (p: number) => void) =>
    totalPages > 1 ? (
      <div className="flex items-center justify-between px-5 py-4 border-t border-border">
        <span className="text-[11px] font-semibold text-gray-400">
          Halaman {page} dari {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-bold text-gray-600 hover:bg-bg transition cursor-pointer disabled:opacity-50"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Sebelumnya
          </button>
          <button
            onClick={() => onChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-bold text-gray-600 hover:bg-bg transition cursor-pointer disabled:opacity-50"
          >
            Selanjutnya
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    ) : null;

  return (
    <>
      <Header activeId="sales-commissions" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
            Komisi Saya
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Ringkasan komisi recurring 20% dan bonus onboarding/milestone dari tenant referensi Anda.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-3 bg-white rounded-card border border-border shadow-soft">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Memuat pendapatan…</span>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {summaryCards.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-white rounded-card border border-border shadow-soft p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xl font-extrabold text-gray-900 font-display truncate">{s.value}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{s.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border gap-2">
              <button
                onClick={() => setActiveTab("commissions")}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === "commissions"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Komisi Recurring ({commissions.length})
              </button>
              <button
                onClick={() => setActiveTab("bonuses")}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === "bonuses"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <Award className="w-4 h-4" />
                Bonus Onboarding & Milestone ({bonuses.length})
              </button>
            </div>

            {/* Commissions tab */}
            {activeTab === "commissions" && (
              <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
                {commissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                    <DollarSign className="w-8 h-8 opacity-40" />
                    <p className="text-xs font-semibold">Belum ada komisi tercatat.</p>
                    <p className="text-[11px] opacity-75">Bagikan kode referral Anda untuk mulai mendapatkan komisi.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-bg">
                            <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Tanggal</th>
                            <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Order ID</th>
                            <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Gross</th>
                            <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Rate</th>
                            <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Komisi</th>
                            <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {pageCommissions.map((c) => (
                            <tr key={c.id} className="hover:bg-bg/60 transition-colors">
                              <td className="px-4 py-3 text-gray-400 font-mono">{formatDate(c.created_at)}</td>
                              <td className="px-4 py-3 font-mono text-gray-700 font-semibold">{c.order_id}</td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatIDR(c.gross_amount)}</td>
                              <td className="px-4 py-3 text-right text-gray-500 font-mono">{formatPercent(c.commission_rate)}</td>
                              <td className="px-4 py-3 text-right font-bold text-warning">{formatIDR(c.commission_amount)}</td>
                              <td className="px-4 py-3">{renderStatus(c.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {renderPagination(commPage, totalCommPages, setCommPage)}
                  </>
                )}
              </div>
            )}

            {/* Bonuses tab */}
            {activeTab === "bonuses" && (
              <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
                {bonuses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                    <Award className="w-8 h-8 opacity-40" />
                    <p className="text-xs font-semibold">Belum ada bonus tercatat.</p>
                    <p className="text-[11px] opacity-75">
                      Bonus onboarding dan milestone akan tercatat otomatis ketika tenant aktif.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-bg">
                            <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Tanggal</th>
                            <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Jenis</th>
                            <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Detail</th>
                            <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Nominal</th>
                            <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {pageBonuses.map((b) => (
                            <tr key={b.id} className="hover:bg-bg/60 transition-colors">
                              <td className="px-4 py-3 text-gray-400 font-mono">{formatDate(b.created_at)}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  {b.type === "milestone" ? <Target className="w-3 h-3" /> : <Gift className="w-3 h-3" />}
                                  {TYPE_LABELS[b.type] ?? b.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-500 font-mono">
                                {b.type === "milestone"
                                  ? `${b.metric ?? "tenant"} ≥ ${b.tier ?? "—"} · ${b.period ?? "—"}`
                                  : `Tenant #${b.tenant_user_id ?? "—"}`}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-amber-600">{formatIDR(b.amount)}</td>
                              <td className="px-4 py-3">{renderStatus(b.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {renderPagination(bonusPage, totalBonusPages, setBonusPage)}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
