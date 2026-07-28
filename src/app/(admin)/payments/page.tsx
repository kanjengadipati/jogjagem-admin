"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  Receipt,
  Search,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ChevronDown,
  X,
} from "lucide-react";
import type { PaymentTransaction } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  paid:      "bg-success/10 text-success border-success/20",
  pending:   "bg-warning/10 text-warning border-warning/20",
  expired:   "bg-gray-100 text-gray-500 border-gray-200",
  failed:    "bg-danger/10 text-danger border-danger/20",
  refunded:  "bg-info/10 text-info border-info/20",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  paid:     CheckCircle,
  pending:  Clock,
  expired:  XCircle,
  failed:   XCircle,
  refunded: RefreshCw,
};

const SUBJECT_LABELS: Record<string, string> = {
  ad_campaign:          "Ad Campaign",
  partner_sponsorship:  "Partner Sponsorship",
};

function formatIDR(amount: number, currency = "IDR") {
  return `${currency} ${amount.toLocaleString("id-ID")}`;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Detail modal (raw notification / debugging) ─────────────────────────────

function DetailModal({
  tx,
  onClose,
}: {
  tx: PaymentTransaction;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-border w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display">Detail Transaksi</h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">{tx.order_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3 text-xs">
          {[
            ["ID",             tx.id],
            ["Order ID",       tx.order_id],
            ["Subject Type",   SUBJECT_LABELS[tx.subject_type] ?? tx.subject_type],
            ["Subject ID",     tx.subject_external_id],
            ["Jumlah",         formatIDR(tx.amount, tx.currency)],
            ["Status",         tx.status],
            ["Payment Type",   tx.payment_type ?? "—"],
            ["Transaction ID", tx.transaction_id ?? "—"],
            ["Paid At",        formatDate(tx.paid_at)],
            ["Expires At",     formatDate(tx.expires_at)],
            ["Created At",     formatDate(tx.created_at)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-stone-100 pb-1.5">
              <span className="text-gray-500 font-medium">{label}</span>
              <span className="text-gray-800 font-mono text-right max-w-[60%] break-all">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const { showToast } = useToast();
  const [all, setAll]           = useState<PaymentTransaction[]>([]);
  const [filtered, setFiltered] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/payments")
      .then((r) => r.json())
      .then((d) => {
        const list: PaymentTransaction[] = d?.data ?? [];
        setAll(list);
        setFiltered(list);
      })
      .catch(() => showToast("Error", "Gagal memuat data transaksi", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let list = all;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.order_id.toLowerCase().includes(q) ||
          t.subject_external_id.toLowerCase().includes(q) ||
          (t.transaction_id ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter)  list = list.filter((t) => t.status === statusFilter);
    if (subjectFilter) list = list.filter((t) => t.subject_type === subjectFilter);
    setFiltered(list);
  }, [all, search, statusFilter, subjectFilter]);

  const totalPaid = all
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      {selectedTx && (
        <DetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}

      <Header activeId="payments" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
              Riwayat Pembayaran
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Semua transaksi Midtrans — Ad Campaign &amp; Partner Sponsorship.
            </p>
          </div>
          {!loading && (
            <div className="bg-success/5 border border-success/20 rounded-xl px-4 py-2.5 text-right">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Total Terkonfirmasi</p>
              <p className="text-base font-extrabold text-success">{formatIDR(totalPaid)}</p>
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
              placeholder="Cari order ID atau transaction ID…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-bg focus:bg-white text-xs px-3.5 py-2.5 pr-8 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full appearance-none bg-bg focus:bg-white text-xs px-3.5 py-2.5 pr-8 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer"
            >
              <option value="">Semua Jenis</option>
              <option value="ad_campaign">Ad Campaign</option>
              <option value="partner_sponsorship">Partner Sponsorship</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Memuat transaksi…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Receipt className="w-10 h-10" />
            <span className="text-sm font-semibold">Belum ada transaksi</span>
          </div>
        ) : (
          <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-bg">
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Order ID</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Jenis</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Jumlah</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Status</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Paid At</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((tx) => {
                    const StatusIcon = STATUS_ICONS[tx.status] ?? Clock;
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-bg/60 cursor-pointer transition-colors"
                        onClick={() => setSelectedTx(tx)}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-gray-700 font-semibold">{tx.order_id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {SUBJECT_LABELS[tx.subject_type] ?? tx.subject_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-800">
                          {formatIDR(tx.amount, tx.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              STATUS_STYLES[tx.status] ?? "bg-gray-100 text-gray-500 border-gray-200"
                            }`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono">
                          {formatDate(tx.paid_at)}
                        </td>
                        <td className="px-4 py-3 text-gray-400 font-mono">
                          {formatDate(tx.created_at)}
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
            {filtered.length} transaksi ditampilkan · Klik baris untuk detail
          </p>
        )}
      </main>
    </>
  );
}
