"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { SnapCheckoutButton } from "@/components/SnapCheckoutButton";
import { Megaphone, Search, Loader2, Trash2, Plus, Calendar, MousePointerClick, Eye, Power } from "lucide-react";
import type { AdCampaign } from "@/types";

const PLACEMENT_LABELS: Record<string, string> = {
  homepage_hero_aicard: "Homepage Hero AIPick Card",
  homepage_hero_trending: "Homepage Hero Trending",
  homepage_category_banner: "Homepage Category Banner",
  listing_top: "Listing Top Banner",
  listing_native: "Listing Native Card",
  destination_detail: "Destination Detail",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  overdue: "bg-danger/10 text-danger",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Payment paid",
  pending: "Payment pending",
  overdue: "Payment overdue",
};

function formatPrice(amount?: number, currency?: string) {
  if (!amount) return null;
  return `${currency ?? "IDR"} ${amount.toLocaleString("id-ID")}`;
}

export default function AdCampaignsPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<AdCampaign[]>([]);
  const [filtered, setFiltered] = useState<AdCampaign[]>([]);
  const [search, setSearch] = useState("");
  const [placementFilter, setPlacementFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  // Status pembayaran nyata per campaign (dari Midtrans via backend)
  const [paymentBySubject, setPaymentBySubject] = useState<Record<string, string>>({});

  function load() {
    setLoading(true);
    fetch("/api/ad-campaigns")
      .then((r) => r.json())
      .then((d) => {
        const list: AdCampaign[] = d?.data ?? [];
        setAll(list);
        setFiltered(list);
      })
      .catch(() => showToast("Error", "Failed to load ad campaigns", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setelah campaign list ter-load, fetch status transaksi per campaign dari backend
  useEffect(() => {
    if (all.length === 0) return;
    all.forEach((c) => {
      fetch(`/api/payments?subject_type=ad_campaign&subject_external_id=${c.id}`)
        .then((r) => r.json())
        .then((d) => {
          // Backend mengembalikan transaksi terbaru pertama (ORDER BY id DESC)
          const latest = d?.data?.[0];
          if (latest?.status) {
            setPaymentBySubject((prev) => ({ ...prev, [c.id]: latest.status }));
          }
        })
        .catch(() => {});
    });
  }, [all]);

  useEffect(() => {
    let list = all;
    if (search) {
      list = list.filter(
        (c) =>
          (c.business_name ?? c.partner_name).toLowerCase().includes(search.toLowerCase()) ||
          (c.category ?? "").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (placementFilter) list = list.filter((c) => c.placement === placementFilter);
    if (paymentFilter) list = list.filter((c) => (c.payment_status ?? "pending") === paymentFilter);
    setFiltered(list);
  }, [all, search, placementFilter, paymentFilter]);

  async function deleteCampaign(id: string) {
    if (!confirm("Delete this ad campaign?")) return;
    const res = await fetch(`/api/ad-campaigns/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAll((prev) => prev.filter((c) => c.id !== id));
      showToast("Deleted", "Ad campaign removed", "success");
    } else {
      showToast("Error", "Delete failed", "error");
    }
  }

  async function toggleActive(campaign: AdCampaign) {
    const res = await fetch(`/api/ad-campaigns/${campaign.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !campaign.is_active }),
    });
    if (res.ok) {
      setAll((prev) =>
        prev.map((c) => (c.id === campaign.id ? { ...c, is_active: !c.is_active } : c))
      );
      showToast(
        campaign.is_active ? "Paused" : "Activated",
        `Campaign "${campaign.business_name ?? campaign.partner_name}" ${campaign.is_active ? "paused" : "activated"}`,
        "success"
      );
    } else {
      showToast("Error", "Failed to update campaign status", "error");
    }
  }

  // cyclePaymentStatus dihapus — sekarang pakai Midtrans Snap (SnapCheckoutButton)

  const placements = Array.from(new Set(all.map((c) => c.placement).filter(Boolean)));

  return (
    <>
      <Header activeId="ad-campaigns" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Ad Campaigns</h2>
            <p className="text-xs text-gray-500 mt-1">
              Manage partner display banners across homepage, listings, and detail placements.
            </p>
          </div>
          <Link
            href="/ad-campaigns/create"
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /><span>New Campaign</span>
          </Link>
        </div>

        <div className="bg-white p-5 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by business name or category..."
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium"
            />
          </div>
          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer"
          >
            <option value="">All Placements</option>
            {placements.map((p) => (
              <option key={p} value={p}>{PLACEMENT_LABELS[p] ?? p}</option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer"
          >
            <option value="">All Payment Status</option>
            <option value="pending">Payment Pending</option>
            <option value="paid">Payment Paid</option>
            <option value="overdue">Payment Overdue</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Loading ad campaigns...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Megaphone className="w-10 h-10" />
            <span className="text-sm font-semibold">No ad campaigns found</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-card border border-border shadow-soft overflow-hidden hover:border-primary/20 hover:shadow-premium transition-premium flex flex-col"
              >
                <div className="relative h-40 bg-gray-100 flex-shrink-0">
                  {c.image_url ? (
                    <Image src={c.image_url} alt={c.business_name ?? c.partner_name} fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Megaphone className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 text-[10px] font-bold text-primary bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-lg shadow-sm">
                    {PLACEMENT_LABELS[c.placement] ?? c.placement}
                  </span>
                  <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.is_active ? "bg-success/10 text-success" : "bg-gray-100 text-gray-500"
                  }`}>
                    {c.is_active ? "Active" : "Paused"}
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-gray-900 font-display leading-snug">{c.business_name ?? c.partner_name}</h4>
                    <button onClick={() => deleteCampaign(c.id)} className="p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-3.5 h-3.5 text-danger" />
                    </button>
                  </div>

                  {c.category && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit capitalize">
                      {c.category}
                    </span>
                  )}

                  {formatPrice(c.price_amount, c.price_currency) && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-gray-800">
                        {formatPrice(c.price_amount, c.price_currency)}
                      </span>
                      {/* Kalau sudah paid → badge statis. Belum paid → tombol Generate Invoice */}
                      {(paymentBySubject[c.id] ?? c.payment_status) === "paid" ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PAYMENT_STATUS_STYLES.paid}`}>
                          {PAYMENT_STATUS_LABELS.paid}
                        </span>
                      ) : (
                        <SnapCheckoutButton
                          subjectType="ad_campaign"
                          subjectExternalId={c.id}
                          amount={c.price_amount ?? 0}
                          itemName={`Ad Campaign: ${c.business_name ?? c.partner_name}`}
                          customerName={c.business_name ?? c.partner_name}
                          onPaid={() => {
                            setPaymentBySubject((prev) => ({ ...prev, [c.id]: "paid" }));
                            showToast(
                              "Invoice dikirim",
                              "Status akan diperbarui setelah webhook Midtrans dikonfirmasi",
                              "info"
                            );
                          }}
                        />
                      )}
                    </div>
                  )}

                  <div className="text-[10px] text-gray-400 space-y-1.5 border-t border-border pt-3 mt-auto">
                    {(c.start_at || c.end_at) && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="text-gray-600 font-medium">
                          {c.start_at ? new Date(c.start_at).toLocaleDateString() : "No start"} -{" "}
                          {c.end_at ? new Date(c.end_at).toLocaleDateString() : "No end"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3 h-3" /> {c.impressions ?? 0} impressions
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MousePointerClick className="w-3 h-3" /> {c.clicks ?? 0} clicks
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleActive(c)}
                    className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      c.is_active
                        ? "border-border hover:bg-red-50 hover:border-red-200 text-gray-500 hover:text-red-600"
                        : "border-success/30 bg-success/10 hover:bg-success/20 text-success"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" /> {c.is_active ? "Pause Campaign" : "Activate Campaign"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="text-xs text-gray-400 font-semibold">
            Showing {filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </main>
    </>
  );
}
