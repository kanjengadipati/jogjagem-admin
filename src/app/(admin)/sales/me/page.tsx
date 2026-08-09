"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  Trophy,
  Coins,
  Loader2,
  Link2,
  Share2,
  RefreshCw,
  Copy,
  Check,
  Clock,
  Users,
  Receipt,
  Wallet,
  X,
  DollarSign,
  Gift,
  Target,
} from "lucide-react";
import type { SalesBonusRecord, SalesCommissionRecord } from "@/types";

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001";

function formatIDR(amount: number) {
  return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
}

export default function SalesOverviewPage() {
  const { showToast } = useToast();
  const [bonuses, setBonuses] = useState<SalesBonusRecord[]>([]);
  const [commissions, setCommissions] = useState<SalesCommissionRecord[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
  const pendingCommission = useMemo(
    () => commissions.filter((c) => c.status === "pending").reduce((s, c) => s + c.commission_amount, 0),
    [commissions]
  );
  const totalEarnings = totalBonus + totalCommission;
  const referredPartners = useMemo(
    () => new Set(commissions.map((c) => c.partner_user_id)).size,
    [commissions]
  );

  const shareableUrl = useMemo(
    () => (referralCode ? `${FRONTEND_URL}/business/claim?ref=${referralCode}` : ""),
    [referralCode]
  );

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopiedCode(true);
      showToast("Success", "Kode referral berhasil disalin");
      setTimeout(() => setCopiedCode(false), 1500);
    });
  };

  const copyLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl).then(() => {
      setCopiedLink(true);
      showToast("Success", "Link referral berhasil disalin");
      setTimeout(() => setCopiedLink(false), 1500);
    });
  };

  const regenerate = () => {
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
      .finally(() => {
        setRegenerating(false);
        setConfirmOpen(false);
      });
  };

  const statCards = [
    {
      label: "Total Earnings",
      value: formatIDR(totalEarnings),
      icon: Wallet,
      color: "text-info bg-info/10",
    },
    {
      label: "Total Bonus",
      value: formatIDR(totalBonus),
      icon: Trophy,
      color: "text-success bg-success/10",
    },
    {
      label: "Total Komisi",
      value: formatIDR(totalCommission),
      icon: Coins,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Pending",
      value: formatIDR(pendingBonus + pendingCommission),
      icon: Clock,
      color: "text-warning bg-warning/10",
    },
    {
      label: "Partner Direferensikan",
      value: String(referredPartners),
      icon: Users,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Transaksi",
      value: String(commissions.length),
      icon: Receipt,
      color: "text-gray-600 bg-gray-100",
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
              Sales Overview
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Ringkasan earnings, kode referral, dan program komisi Anda.
            </p>
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      {s.label}
                    </p>
                    <p className="text-lg font-extrabold text-gray-900 font-display mt-0.5 truncate">
                      {s.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-3 bg-white rounded-card border border-border shadow-soft">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Memuat earnings…</span>
          </div>
        )}

        {/* Referral code badge + shareable link */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-card border border-border shadow-soft flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 font-display">Kode Referral Anda</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Bagikan kode ini ke calon partner saat pendaftaran bisnis.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-3">
              <code className="font-mono text-xl font-bold tracking-wider text-primary truncate">
                {referralCode || "…"}
              </code>
              <button
                onClick={copyCode}
                disabled={!referralCode}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-bold text-gray-700 hover:bg-bg transition cursor-pointer disabled:opacity-60 shrink-0"
              >
                {copiedCode ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? "Tersalin" : "Salin Kode"}
              </button>
            </div>
            <div className="pt-2 border-t border-border/20 flex items-center justify-between text-[11px] text-gray-500">
              <span>Ingin memperbarui kode?</span>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={regenerating}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-primary transition cursor-pointer disabled:opacity-60"
              >
                {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Generate Ulang
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-card border border-border shadow-soft flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 font-display">Link Referral</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Partner yang daftar lewat link ini otomatis terhubung ke akun Anda.
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-border bg-bg text-[11px] font-mono text-gray-500 break-all flex items-center justify-between gap-2">
              <span className="truncate">{shareableUrl || "…"}</span>
              <button
                onClick={copyLink}
                disabled={!shareableUrl}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-bold text-gray-700 hover:bg-white transition cursor-pointer disabled:opacity-60 shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? "Tersalin" : "Salin Link"}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Tip: cantumkan link ini di proposal, WhatsApp, atau bio media sosial Anda.
            </p>
          </div>
        </div>

        {/* Program info */}
        <div className="bg-white p-5 rounded-card border border-emerald-500/20 bg-emerald-500/5 space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            Ketentuan Komisi Sales
          </h3>
          <ul className="text-xs text-gray-500 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>
              Komisi sebesar <strong>20%</strong> dari nilai transaksi berbayar yang diselesaikan tenant referensi Anda, berlaku <strong>recurring</strong> untuk setiap perpanjangan langganan.
            </li>
            <li>
              <Gift className="inline w-3.5 h-3.5 text-emerald-500" /> Bonus onboarding saat tenant baru pertama kali aktif.
            </li>
            <li>
              <Target className="inline w-3.5 h-3.5 text-emerald-500" /> Bonus milestone bulanan saat jumlah tenant/transaksi melewati ambang tertentu.
            </li>
          </ul>
        </div>
      </main>

      {/* Regenerate confirm dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-border w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-gray-900 font-display">Buat Ulang Kode Referral</h3>
              <button
                onClick={() => setConfirmOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <p className="text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin membuat kode referral baru? Kode lama{" "}
                <strong className="font-mono text-gray-800">{referralCode}</strong> tidak akan berlaku lagi untuk pendaftaran baru.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-gray-700 hover:bg-bg transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={regenerate}
                  disabled={regenerating}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger text-white text-xs font-bold hover:opacity-90 transition cursor-pointer disabled:opacity-60"
                >
                  {regenerating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {regenerating ? "Memproses…" : "Ya, Buat Kode Baru"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
