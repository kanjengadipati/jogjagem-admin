"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PartnerHeader from "@/components/PartnerHeader";
import { useToast } from "@/components/Toast";
import { SnapCheckoutButton } from "@/components/SnapCheckoutButton";
import {
  Tag,
  Megaphone,
  Eye,
  Plus,
  Ticket,
  Sparkles,
  Loader2,
  Trash2,
  Calendar,
  MousePointerClick,
  Power,
  X,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";
import type { AdCampaign } from "@/types";
import { useActiveBusiness } from "@/hooks/useActiveBusiness";

interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount?: string;
  start_date?: string;
  end_date?: string;
  code?: string;
  status?: string;
  category?: string;
  image_url?: string;
}

interface NewPromoForm {
  title: string;
  description: string;
  discount: string;
  code: string;
  start_date: string;
  end_date: string;
}

const PLACEMENT_LABELS: Record<string, string> = {
  homepage_hero: "Homepage Hero",
  listing_top: "Listing Top Banner",
  listing_native: "Listing Native Card",
  destination_detail: "Destination Detail Sidebar",
};

const PLACEMENT_DESCRIPTIONS: Record<string, string> = {
  homepage_hero: "Banner besar di halaman utama — visibilitas tertinggi",
  listing_top: "Card sponsor di grid Destinasi Populer (posisi #1 & #5)",
  listing_native: "Card sponsor di carousel Trending & Festival",
  destination_detail: "Banner di halaman detail destinasi",
};

function statusBadge(status?: string) {
  if (!status || status === "active" || status === "approved")
    return "bg-emerald-100 text-emerald-800";
  if (status === "pending") return "bg-amber-100 text-amber-800";
  if (status === "expired" || status === "inactive")
    return "bg-stone-100 text-stone-500";
  return "bg-stone-100 text-stone-500";
}

function statusLabel(status?: string) {
  if (!status) return "Tidak Diketahui";
  const map: Record<string, string> = {
    active: "Aktif",
    approved: "Aktif",
    pending: "Menunggu",
    inactive: "Nonaktif",
    expired: "Kedaluwarsa",
    paused: "Dijeda",
  };
  return map[status] ?? status;
}

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtPrice(amount?: number, currency?: string) {
  if (!amount) return null;
  return `${currency ?? "IDR"} ${amount.toLocaleString("id-ID")}`;
}

export default function PartnerMarketingPage() {
  const { showToast } = useToast();
  const { active: business, externalId } = useActiveBusiness();

  // ── State ──────────────────────────────────────────────────────────────────
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isBusiness, setIsBusiness] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [paymentBySubject, setPaymentBySubject] = useState<
    Record<string, string>
  >({});
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // Modal tambah promosi
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);
  const [promoForm, setPromoForm] = useState<NewPromoForm>({
    title: "",
    description: "",
    discount: "",
    code: "",
    start_date: "",
    end_date: "",
  });

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!business) {
      setLoadingPromos(false);
      return;
    }
    async function load() {
      if (!business) return;
      const id = externalId || business.id;
      setPartnerId(id);
      setIsBusiness(true);
      try {
        const promoRes = await fetch(`/api/businesses/me/${id}/promotions`);
        const promoData = await promoRes.json();
        setPromotions(promoData?.data ?? []);
      } catch {
        showToast("Error", "Gagal memuat promosi", "error");
      } finally {
        setLoadingPromos(false);
      }
    }
    load();
  }, [business, externalId]);

  useEffect(() => {
    // Fetch semua campaign lalu filter ke bisnis ini
    fetch("/api/ad-campaigns")
      .then((r) => r.json())
      .then((d) => {
        const list: AdCampaign[] = d?.data ?? [];
        setCampaigns(list);
        // Fetch payment status per campaign
        list.forEach((c) => {
          fetch(
            `/api/payments?subject_type=ad_campaign&subject_external_id=${c.id}`
          )
            .then((r) => r.json())
            .then((d) => {
              const latest = d?.data?.[0];
              if (latest?.status) {
                setPaymentBySubject((prev) => ({
                  ...prev,
                  [c.id]: latest.status,
                }));
              }
            })
            .catch(() => {});
        });
      })
      .catch(() => {})
      .finally(() => setLoadingCampaigns(false));
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const activePromos = promotions.filter(
    (p) => p.status === "active" || p.status === "approved"
  ).length;
  const activeCampaigns = campaigns.filter((c) => c.is_active).length;
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks ?? 0), 0);
  const totalImpressions = campaigns.reduce(
    (s, c) => s + (c.impressions ?? 0),
    0
  );

  const isPending = business?.status === "pending";

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleSavePromo() {
    if (isPending) {
      showToast("Bisnis masih dalam peninjauan", "info");
      return;
    }
    if (!partnerId || !promoForm.title.trim()) {
      showToast("Error", "Judul promosi wajib diisi", "error");
      return;
    }
    setSavingPromo(true);
    try {
      const endpoint = isBusiness ? `/api/businesses/me/${partnerId}/promotions` : `/api/partners/me/${partnerId}/promotions`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: promoForm.title,
          description: promoForm.description,
          discount: promoForm.discount,
          code: promoForm.code,
          start_date: promoForm.start_date || undefined,
          end_date: promoForm.end_date || undefined,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        const newPromo: Promotion = d?.data ?? d;
        setPromotions((prev) => [newPromo, ...prev]);
        setShowPromoModal(false);
        setPromoForm({
          title: "",
          description: "",
          discount: "",
          code: "",
          start_date: "",
          end_date: "",
        });
        showToast("Berhasil", "Promosi berhasil dibuat", "success");
      } else {
        showToast("Error", d?.message ?? "Gagal membuat promosi", "error");
      }
    } catch {
      showToast("Error", "Gagal menghubungi server", "error");
    } finally {
      setSavingPromo(false);
    }
  }

  async function handleDeletePromo(id: string) {
    if (!partnerId) return;
    if (!confirm("Hapus promosi ini?")) return;
    const endpoint = isBusiness ? `/api/businesses/me/${partnerId}/promotions/${id}` : `/api/partners/me/${partnerId}/promotions/${id}`;
    const res = await fetch(endpoint, {
      method: "DELETE",
    });
    if (res.ok) {
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      showToast("Dihapus", "Promosi berhasil dihapus", "success");
    } else {
      showToast("Error", "Gagal menghapus promosi", "error");
    }
  }

  async function handleToggleCampaign(campaign: AdCampaign) {
    const res = await fetch(`/api/ad-campaigns/${campaign.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !campaign.is_active }),
    });
    if (res.ok) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaign.id ? { ...c, is_active: !c.is_active } : c
        )
      );
      showToast(
        campaign.is_active ? "Dijeda" : "Diaktifkan",
        `Campaign "${campaign.business_name ?? campaign.partner_name}" ${campaign.is_active ? "dijeda" : "diaktifkan"}`,
        "success"
      );
    } else {
      showToast("Error", "Gagal memperbarui status kampanye", "error");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <PartnerHeader />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-5 md:p-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 font-display">
              Marketing
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Kampanye iklan dan promosi untuk bisnis Anda
            </p>
          </div>
          <button
            onClick={() => setShowPromoModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#B57A21] hover:bg-[#9B671A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Promosi</span>
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
              <Tag className="w-3.5 h-3.5" /> Promosi aktif
            </div>
            <div className="text-3xl font-extrabold text-stone-900 font-display">
              {loadingPromos ? (
                <Loader2 className="w-6 h-6 animate-spin text-stone-300" />
              ) : (
                activePromos
              )}
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
              <Megaphone className="w-3.5 h-3.5" /> Iklan tayang
            </div>
            <div className="text-3xl font-extrabold text-stone-900 font-display">
              {loadingCampaigns ? (
                <Loader2 className="w-6 h-6 animate-spin text-stone-300" />
              ) : (
                activeCampaigns
              )}
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
              <Eye className="w-3.5 h-3.5" /> Impresi iklan
            </div>
            <div className="text-3xl font-extrabold text-stone-900 font-display">
              {loadingCampaigns ? (
                <Loader2 className="w-6 h-6 animate-spin text-stone-300" />
              ) : (
                totalImpressions.toLocaleString("id-ID")
              )}
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
              <MousePointerClick className="w-3.5 h-3.5" /> Klik (total)
            </div>
            <div className="text-3xl font-extrabold text-stone-900 font-display">
              {loadingCampaigns ? (
                <Loader2 className="w-6 h-6 animate-spin text-stone-300" />
              ) : (
                totalClicks.toLocaleString("id-ID")
              )}
            </div>
          </div>
        </div>

        {/* ── Seksi Promosi ── */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 font-display flex items-center gap-2">
              <Ticket className="w-4 h-4 text-amber-600" />
              <span>Promosi</span>
            </h2>
            <button
              onClick={() => setShowPromoModal(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>

          {loadingPromos ? (
            <div className="flex items-center justify-center py-8 text-stone-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium">Memuat promosi...</span>
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-stone-200 rounded-2xl">
              <Tag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-stone-400">
                Belum ada promosi
              </p>
              <button
                onClick={() => setShowPromoModal(true)}
                className="mt-3 text-xs font-bold text-amber-700 hover:underline cursor-pointer"
              >
                Buat promosi pertama →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {promotions.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {p.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {p.code && (
                        <span className="text-[10px] font-mono font-bold bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-lg">
                          {p.code}
                        </span>
                      )}
                      {p.discount && (
                        <span className="text-[10px] font-bold text-stone-600">
                          {p.discount}
                        </span>
                      )}
                      {(p.end_date) && (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          s/d {fmtDate(p.end_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${statusBadge(p.status)}`}
                    >
                      {statusLabel(p.status)}
                    </span>
                    <button
                      onClick={() => handleDeletePromo(p.id)}
                      className="p-1.5 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Hapus promosi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Seksi Iklan ── */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Kampanye Iklan</span>
            </h2>
            <Link
              href="/ads"
              className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 transition-colors"
            >
              Pasang iklan baru <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingCampaigns ? (
            <div className="flex items-center justify-center py-8 text-stone-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium">Memuat kampanye...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-stone-200 rounded-2xl">
              <Megaphone className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-stone-400 mb-1">
                Belum ada kampanye iklan aktif
              </p>
              <p className="text-[11px] text-stone-400 mb-3">
                Tampilkan bisnis Anda ke lebih banyak traveler
              </p>
              <Link
                href="/ads"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#B57A21] hover:bg-[#9B671A] px-4 py-2 rounded-xl transition-colors"
              >
                <Zap className="w-3.5 h-3.5" /> Pasang Iklan Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => {
                const payStatus = paymentBySubject[c.id] ?? c.payment_status;
                return (
                  <div
                    key={c.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${
                      c.is_active
                        ? "border-amber-200/80 bg-amber-50/20"
                        : "border-stone-200/90 bg-stone-50/50"
                    }`}
                  >
                    {/* Info kiri */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {c.business_name ?? c.partner_name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {c.is_active ? "Tayang" : "Dijeda"}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg w-fit">
                        {PLACEMENT_LABELS[c.placement] ?? c.placement}
                      </div>
                      {PLACEMENT_DESCRIPTIONS[c.placement] && (
                        <p className="text-[10px] text-stone-400">
                          {PLACEMENT_DESCRIPTIONS[c.placement]}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[10px] text-stone-500 pt-0.5">
                        {(c.start_at || c.end_at) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {fmtDate(c.start_at)} – {fmtDate(c.end_at)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="w-2.5 h-2.5" /> {c.impressions ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="w-2.5 h-2.5" />{" "}
                          {c.clicks ?? 0}
                        </span>
                      </div>
                    </div>

                    {/* Aksi kanan */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Payment badge / tombol bayar */}
                      {fmtPrice(c.price_amount, c.price_currency) && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-stone-800">
                            {fmtPrice(c.price_amount, c.price_currency)}
                          </span>
                          {payStatus === "paid" ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Lunas
                            </span>
                          ) : (
                            <SnapCheckoutButton
                              subjectType="ad_campaign"
                              subjectExternalId={c.id}
                              amount={c.price_amount ?? 0}
                              itemName={`Ad Campaign: ${c.business_name ?? c.partner_name}`}
                              customerName={c.business_name ?? c.partner_name}
                              onPaid={() => {
                                setPaymentBySubject((prev) => ({
                                  ...prev,
                                  [c.id]: "paid",
                                }));
                                showToast(
                                  "Pembayaran diproses",
                                  "Status diperbarui setelah konfirmasi",
                                  "info"
                                );
                              }}
                            />
                          )}
                        </div>
                      )}
                      {/* Toggle aktif/jeda */}
                      <button
                        onClick={() => handleToggleCampaign(c)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-bold transition cursor-pointer ${
                          c.is_active
                            ? "border-stone-200 hover:border-red-200 hover:bg-red-50 text-stone-500 hover:text-red-600"
                            : "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                        }`}
                        title={c.is_active ? "Jeda kampanye" : "Aktifkan kampanye"}
                      >
                        <Power className="w-3 h-3" />
                        {c.is_active ? "Jeda" : "Aktifkan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Slot Iklan Tersedia ── */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-stone-900 font-display flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Slot Iklan Tersedia</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(PLACEMENT_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-stone-900">{label}</div>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {PLACEMENT_DESCRIPTIONS[key]}
                  </p>
                </div>
                <Link
                  href={`/ads?placement=${key}`}
                  className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-xl transition-colors"
                >
                  Pilih <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Modal Buat Promosi ── */}
      {showPromoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowPromoModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 font-display flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-600" />
                Buat Promosi Baru
              </h3>
              <button
                onClick={() => setShowPromoModal(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-stone-600 block mb-1.5">
                  Judul Promosi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={promoForm.title}
                  onChange={(e) =>
                    setPromoForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Contoh: Diskon 20% tiket masuk"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 block mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  value={promoForm.description}
                  onChange={(e) =>
                    setPromoForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Detail promo, syarat, dsb."
                  rows={3}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1.5">
                    Diskon / Nilai
                  </label>
                  <input
                    type="text"
                    value={promoForm.discount}
                    onChange={(e) =>
                      setPromoForm((f) => ({
                        ...f,
                        discount: e.target.value,
                      }))
                    }
                    placeholder="Contoh: 20% atau Rp 50.000"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1.5">
                    Kode Promo
                  </label>
                  <input
                    type="text"
                    value={promoForm.code}
                    onChange={(e) =>
                      setPromoForm((f) => ({
                        ...f,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Contoh: JEMPUT20"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1.5">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={promoForm.start_date}
                    onChange={(e) =>
                      setPromoForm((f) => ({
                        ...f,
                        start_date: e.target.value,
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1.5">
                    Tanggal Berakhir
                  </label>
                  <input
                    type="date"
                    value={promoForm.end_date}
                    onChange={(e) =>
                      setPromoForm((f) => ({
                        ...f,
                        end_date: e.target.value,
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none transition"
                  />
                </div>
              </div>

              {!partnerId && (
                <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Data bisnis belum termuat. Coba muat ulang halaman.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowPromoModal(false)}
                className="flex-1 py-2.5 rounded-2xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSavePromo}
                disabled={savingPromo || !partnerId}
                className="flex-1 py-2.5 rounded-2xl bg-[#B57A21] hover:bg-[#9B671A] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {savingPromo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Promosi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}