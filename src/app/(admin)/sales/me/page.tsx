"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  Trophy,
  Coins,
  Loader2,
  Link2,
  RefreshCw,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import type { SalesBonusRecord, SalesCommissionRecord } from "@/types";

const BONUS_STATUS_STYLES: Record<string, string> = {
  paid:    "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  voided:  "bg-danger/10 text-danger border-danger/20",
};

const BONUS_STATUS_ICONS: Record<string, React.ElementType> = {
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

export default function MyEarningsPage() {
  const { showToast } = useToast();
  const [bonuses, setBonuses] = useState<SalesBonusRecord[]>([]);
  const [commissions, setCommissions] = useState<SalesCommissionRecord[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/sales/me/bonuses").then((r) => r.json()),
      fetch("/api/sales/me/commissions").then((r) => r.json()),
      fetch("/api/sales/me/referral-code").then((r) => r.json()),
    ])
      .then(([bonusRes, commRes, refRes]) => {
        setBonuses(bonusRes?.data ?? []);
        setCommissions(commRes?.data ?? []);
        const code = refRes?.data?.referral_code;
        if (code) setReferralCode(code);
      })
      .catch(() => showToast("Error", "Gagal memuat data earnings", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalBonus = useMemo(
    () => bonuses.reduce((s, b) => s + b.amount, 0),
    [bonuses]
  );
  const pendingBonus = useMemo(
    () => bonuses.filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0),
    [bonuses]
  );
  const totalCommission = useMemo(
    () => commissions.reduce((s, c) => s + c.commission_amount, 0),
    [commissions]
  );
  const totalEarnings = totalBonus + totalCommission;

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const regenerate = () => {
    if (!window.confirm("Buat kode referral baru? Kode lama tidak lagi berlaku untuk pendaftaran baru.")) {
      return;
    }
    setRegenerating(true);
    fetch("/api/sales/me/referral-code", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.status === "success" && d?.data?.referral_code) {
          setReferralCode(d.data.referral_code);
          showToast("Success", "Kode referral baru dibuat");
        } else {
          showToast("Error", d?.message ?? "Gagal membuat kode baru", "error");
        }
      })
      .catch(() => showToast("Error", "Gagal membuat kode baru", "error"))
      .finally(() => setRegenerating(false));
  };

  const statCards = [
    {
      label: "Total Bonus",
      value: formatIDR(totalBonus),
      icon: Trophy,
      color: "text-success bg-success/10",
    },
    {
      label: "Bonus Pending",
      value: formatIDR(pendingBonus),
      icon: Clock,
      color: "text-warning bg-warning/10",
    },
    {
      label: "Total Komisi",
      value: formatIDR(totalCommission),
      icon: Coins,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Total Earnings",
      value: formatIDR(totalEarnings),
      icon: Coins,
      color: "text-info bg-info/10",
    },
  ];

  return (
    <>
      <Header activeId="sales-me" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
              My Earnings
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Kode referral, bonus onboarding/milestone, dan komisi transaksi Anda.
            </p>
          </div>
        </div>

        {/* Referral code card */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Kode Referral Anda</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Bagikan kode ini ke calon partner saat pendaftaran bisnis.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-bg border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-primary font-mono">
              {referralCode || "…"}
            </code>
            <button
              onClick={copyCode}
              className="p-2.5 rounded-xl border border-border text-gray-500 hover:bg-bg transition cursor-pointer"
              title="Salin kode"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={regenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border text-xs font-bold text-gray-700 hover:bg-bg transition cursor-pointer disabled:opacity-60"
            >
              {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Generate Ulang
            </button>
          </div>
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

        {/* Bonuses table */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 font-display mb-3">Bonus Saya</h3>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-3 bg-white rounded-card border border-border shadow-soft">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-semibold">Memuat bonus…</span>
            </div>
          ) : bonuses.length === 0 ? (
            <div className="bg-white rounded-card border border-border shadow-soft p-10 flex flex-col items-center gap-2 text-gray-400">
              <Trophy className="w-8 h-8" />
              <span className="text-xs font-semibold">Belum ada bonus</span>
            </div>
          ) : (
            <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-bg">
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Tipe</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Detail</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Jumlah</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Status</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Dibuat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bonuses.map((b) => {
                      const StatusIcon = BONUS_STATUS_ICONS[b.status] ?? Clock;
                      return (
                        <tr key={b.id} className="hover:bg-bg/60 transition-colors">
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
                                BONUS_STATUS_STYLES[b.status] ?? "bg-gray-100 text-gray-500 border-gray-200"
                              }`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 font-mono">{formatDate(b.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Commissions table */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 font-display mb-3">Komisi Transaksi</h3>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-3 bg-white rounded-card border border-border shadow-soft">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-semibold">Memuat komisi…</span>
            </div>
          ) : commissions.length === 0 ? (
            <div className="bg-white rounded-card border border-border shadow-soft p-10 flex flex-col items-center gap-2 text-gray-400">
              <Coins className="w-8 h-8" />
              <span className="text-xs font-semibold">Belum ada komisi</span>
            </div>
          ) : (
            <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-bg">
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Order ID</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Gross</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Rate</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Komisi</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Status</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Dibuat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {commissions.map((c) => {
                      const StatusIcon = BONUS_STATUS_ICONS[c.status] ?? Clock;
                      return (
                        <tr key={c.id} className="hover:bg-bg/60 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-gray-700 font-semibold">{c.order_id}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{formatIDR(c.gross_amount)}</td>
                          <td className="px-4 py-3 text-gray-500 font-mono">{formatPercent(c.commission_rate)}</td>
                          <td className="px-4 py-3 font-bold text-warning">{formatIDR(c.commission_amount)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                BONUS_STATUS_STYLES[c.status] ?? "bg-gray-100 text-gray-500 border-gray-200"
                              }`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 font-mono">{formatDate(c.created_at)}</td>
                        </tr>
                      );
                    })}
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
