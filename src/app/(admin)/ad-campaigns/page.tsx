"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { SnapCheckoutButton } from "@/components/SnapCheckoutButton";
import CoverImageUpload from "@/components/CoverImageUpload";
import {
  Megaphone, Search, Loader2, Trash2, Plus, Calendar,
  MousePointerClick, Eye, Power, Pencil, X, Save, CheckCircle, XCircle, AlertCircle,
} from "lucide-react";
import type { AdCampaign, Business } from "@/types";
import { PLACEMENT_NAMES, AD_PLACEMENTS, SELLABLE_PLACEMENTS } from "@/lib/adPlacements";

const PLACEMENTS = SELLABLE_PLACEMENTS.map((value) => ({
  value,
  label: AD_PLACEMENTS[value].name,
}));

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "Temple", label: "Temple" },
  { value: "Beach", label: "Beach" },
  { value: "Nature", label: "Nature" },
  { value: "Heritage", label: "Heritage" },
  { value: "Cultural", label: "Cultural" },
  { value: "Culinary", label: "Culinary" },
  { value: "Shopping", label: "Shopping" },
  { value: "Adventure", label: "Adventure" },
  { value: "hidden-gem", label: "Hidden Gem" },
  { value: "family", label: "Family" },
  { value: "weekend", label: "Weekend" },
  { value: "sunset", label: "Sunset" },
  { value: "sunrise", label: "Sunrise" },
  { value: "camping", label: "Camping" },
];

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  overdue: "bg-danger/10 text-danger",
  pending_review: "bg-warning/10 text-warning",
  pending_payment: "bg-warning/10 text-warning",
  rejected: "bg-danger/10 text-danger",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Payment paid",
  pending: "Payment pending",
  overdue: "Payment overdue",
  pending_review: "Review required",
  pending_payment: "Awaiting payment",
  rejected: "Rejected",
};

function formatPrice(amount?: number, currency?: string) {
  if (!amount) return null;
  return `${currency ?? "IDR"} ${amount.toLocaleString("id-ID")}`;
}

function isoToDate(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

type EditForm = {
  placement: string;
  image_url: string;
  target_url: string;
  category: string;
  start_at: string;
  end_at: string;
  weight: string;
  price_amount: string;
  price_currency: string;
};

const EMPTY_EDIT: EditForm = {
  placement: "homepage_hero_aicard",
  image_url: "",
  target_url: "",
  category: "",
  start_at: "",
  end_at: "",
  weight: "1",
  price_amount: "",
  price_currency: "IDR",
};

export default function AdCampaignsPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<AdCampaign[]>([]);
  const [filtered, setFiltered] = useState<AdCampaign[]>([]);
  const [search, setSearch] = useState("");
  const [placementFilter, setPlacementFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentBySubject, setPaymentBySubject] = useState<Record<string, string>>({});

  // Edit modal state
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  useEffect(() => {
    if (all.length === 0) return;
    all.forEach((c) => {
      fetch(`/api/payments?subject_type=ad_campaign&subject_external_id=${c.id}`)
        .then((r) => r.json())
        .then((d) => {
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

  function openEdit(c: AdCampaign) {
    setEditingCampaign(c);
    setEditForm({
      placement:      c.placement ?? "homepage_hero_aicard",
      image_url:      c.image_url ?? "",
      target_url:     c.target_url ?? "",
      category:       c.category ?? "",
      start_at:       isoToDate(c.start_at),
      end_at:         isoToDate(c.end_at),
      weight:         String(c.weight ?? 1),
      price_amount:   String(c.price_amount ?? ""),
      price_currency: c.price_currency ?? "IDR",
    });
  }

  function closeEdit() {
    setEditingCampaign(null);
    setEditForm(EMPTY_EDIT);
  }

  async function saveEdit() {
    if (!editingCampaign) return;
    if (!editForm.image_url || !editForm.target_url) {
      showToast("Missing fields", "Image URL and Target URL are required", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/ad-campaigns/${editingCampaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placement:      editForm.placement,
          image_url:      editForm.image_url,
          target_url:     editForm.target_url,
          category:       editForm.category || undefined,
          start_at:       editForm.start_at ? new Date(editForm.start_at).toISOString() : undefined,
          end_at:         editForm.end_at ? new Date(editForm.end_at).toISOString() : undefined,
          weight:         Number(editForm.weight) || 1,
          price_amount:   Number(editForm.price_amount) || 0,
          price_currency: editForm.price_currency || "IDR",
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json().catch(() => null);
      const updatedData: AdCampaign = updated?.data ?? { ...editingCampaign, ...editForm };
      setAll((prev) => prev.map((c) => (c.id === editingCampaign.id ? updatedData : c)));
      showToast("Saved", "Campaign updated successfully", "success");
      closeEdit();
    } catch {
      showToast("Error", "Failed to update campaign", "error");
    } finally {
      setSaving(false);
    }
  }

  const placements = Array.from(new Set(all.map((c) => c.placement).filter(Boolean)));
  const f = <K extends keyof EditForm>(key: K, val: string) =>
    setEditForm((p) => ({ ...p, [key]: val }));

  async function approveCampaign(c: AdCampaign) {
    if (!window.confirm(`Approve review for "${c.business_name ?? c.partner_name}" and open payment?`)) return;
    try {
      const res = await fetch(`/api/ad-campaigns/${c.id}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Save failed");
      setAll((prev) =>
        prev.map((x) =>
          x.id === c.id ? { ...x, payment_status: "pending_payment" } : x
        )
      );
      showToast("Approved", "Payment opened and owner notified by email", "success");
    } catch {
      showToast("Error", "Failed to approve campaign", "error");
    }
  }

  async function rejectCampaign(c: AdCampaign) {
    const reason = window.prompt(
      `Alasan penolakan untuk "${c.business_name ?? c.partner_name}" (akan dikirim ke owner lewat email):`
    );
    if (reason === null) return;
    if (!reason.trim()) {
      showToast("Error", "Reason is required to reject", "error");
      return;
    }
    try {
      const res = await fetch(`/api/ad-campaigns/${c.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      if (!res.ok) throw new Error("Save failed");
      setAll((prev) =>
        prev.map((x) =>
          x.id === c.id ? { ...x, payment_status: "rejected" } : x
        )
      );
      showToast("Rejected", "Campaign rejected and owner notified by email", "success");
    } catch {
      showToast("Error", "Failed to reject campaign", "error");
    }
  }

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

        {/* Filters */}
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
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition font-medium"
            />
          </div>
          <select value={placementFilter} onChange={(e) => setPlacementFilter(e.target.value)}
            className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Placements</option>
            {placements.map((p) => <option key={p} value={p}>{PLACEMENT_NAMES[p] ?? p}</option>)}
          </select>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Payment Status</option>
            <option value="pending_review">Review required</option>
            <option value="pending_payment">Awaiting payment</option>
            <option value="pending">Payment Pending</option>
            <option value="paid">Payment Paid</option>
            <option value="overdue">Payment Overdue</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* List */}
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
              <div key={c.id}
                className="bg-white rounded-card border border-border shadow-soft overflow-hidden hover:border-primary/20 hover:shadow-premium transition-premium flex flex-col">
                <div className="relative h-40 bg-gray-100 flex-shrink-0">
                  {c.image_url ? (
                    <Image src={c.image_url} alt={c.business_name ?? c.partner_name} fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Megaphone className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 text-[10px] font-bold text-primary bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-lg shadow-sm">
                    {PLACEMENT_NAMES[c.placement] ?? c.placement}
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
                    <div className="flex items-center gap-1">
                      {c.payment_status === "pending_review" && (
                        <>
                          <button onClick={() => approveCampaign(c)}
                            className="p-1.5 hover:bg-success/10 rounded-lg transition-colors cursor-pointer" title="Approve review & open payment">
                            <CheckCircle className="w-3.5 h-3.5 text-success" />
                          </button>
                          <button onClick={() => rejectCampaign(c)}
                            className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors cursor-pointer" title="Reject campaign">
                            <XCircle className="w-3.5 h-3.5 text-danger" />
                          </button>
                        </>
                      )}
                      <button onClick={() => openEdit(c)}
                        className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer" title="Edit campaign">
                        <Pencil className="w-3.5 h-3.5 text-primary" />
                      </button>
                      <button onClick={() => deleteCampaign(c.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete campaign">
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </button>
                    </div>
                  </div>

                  {c.category && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit capitalize">{c.category}</span>
                  )}

                  {formatPrice(c.price_amount, c.price_currency) && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-gray-800">{formatPrice(c.price_amount, c.price_currency)}</span>
                      {(() => {
                        const status = c.payment_status ?? "pending";
                        if (status === "paid") {
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PAYMENT_STATUS_STYLES.paid}`}>
                              {PAYMENT_STATUS_LABELS.paid}
                            </span>
                          );
                        }
                        if (status === "pending_review") {
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PAYMENT_STATUS_STYLES.pending_review}`}>
                              {PAYMENT_STATUS_LABELS.pending_review}
                            </span>
                          );
                        }
                        if (status === "rejected") {
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PAYMENT_STATUS_STYLES.rejected}`}>
                              {PAYMENT_STATUS_LABELS.rejected}
                            </span>
                          );
                        }
                        return (
                          <SnapCheckoutButton
                            subjectType="ad_campaign"
                            subjectExternalId={c.id}
                            amount={c.price_amount ?? 0}
                            itemName={`Ad Campaign: ${c.business_name ?? c.partner_name}`}
                            customerName={c.business_name ?? c.partner_name}
                            onPaid={() => {
                              setPaymentBySubject((prev) => ({ ...prev, [c.id]: "paid" }));
                              showToast("Invoice dikirim", "Status akan diperbarui setelah webhook Midtrans dikonfirmasi", "info");
                            }}
                          />
                        );
                      })()}
                    </div>
                  )}

                  {(c.payment_status ?? "") === "rejected" && c.rejection_reason && (
                    <div className="flex items-start gap-1.5 text-[10px] text-danger bg-danger/5 border border-danger/20 rounded-lg px-2.5 py-1.5">
                      <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>
                        <strong>Rejected:</strong> {c.rejection_reason}
                        {c.rejected_by && <span className="text-gray-400"> — by {c.rejected_by}</span>}
                      </span>
                    </div>
                  )}

                  {c.approved_by && (
                    <div className="text-[10px] text-gray-400">
                      Approved by {c.approved_by}
                      {c.approved_at ? ` · ${new Date(c.approved_at).toLocaleString()}` : ""}
                    </div>
                  )}

                  <div className="text-[10px] text-gray-400 space-y-1.5 border-t border-border pt-3 mt-auto">
                    {(c.start_at || c.end_at) && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="text-gray-600 font-medium">
                          {c.start_at ? new Date(c.start_at).toLocaleDateString() : "No start"} —{" "}
                          {c.end_at ? new Date(c.end_at).toLocaleDateString() : "No end"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" /> {c.impressions ?? 0} impressions</span>
                      <span className="flex items-center gap-1.5"><MousePointerClick className="w-3 h-3" /> {c.clicks ?? 0} clicks</span>
                    </div>
                  </div>

                  <button onClick={() => toggleActive(c)}
                    className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      c.is_active
                        ? "border-border hover:bg-red-50 hover:border-red-200 text-gray-500 hover:text-red-600"
                        : "border-success/30 bg-success/10 hover:bg-success/20 text-success"
                    }`}>
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

      {/* ── Edit Modal ── */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-display">Edit Campaign</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{editingCampaign.business_name ?? editingCampaign.partner_name}</p>
              </div>
              <button onClick={closeEdit} className="p-1.5 rounded-xl hover:bg-bg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-6">
              {/* Placement + Target URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Placement</label>
                  <select value={editForm.placement} onChange={(e) => f("placement", e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
                    {PLACEMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Category</label>
                  <select value={editForm.category} onChange={(e) => f("category", e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
                    {CATEGORIES.map((cat) => <option key={cat.value || "all"} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Target URL</label>
                <input value={editForm.target_url} onChange={(e) => f("target_url", e.target.value)}
                  placeholder="https://partner-website.com/promo"
                  className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Start Date</label>
                  <input type="date" value={editForm.start_at} onChange={(e) => f("start_at", e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">End Date</label>
                  <input type="date" value={editForm.end_at} onChange={(e) => f("end_at", e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Weight</label>
                  <input type="number" min={1} value={editForm.weight} onChange={(e) => f("weight", e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Flat Fee</label>
                  <input type="number" min={0} value={editForm.price_amount} onChange={(e) => f("price_amount", e.target.value)}
                    placeholder="0"
                    className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Currency</label>
                  <input value={editForm.price_currency} onChange={(e) => f("price_currency", e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                </div>
              </div>

              {/* Image */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Creative Image</label>
                <CoverImageUpload
                  value={editForm.image_url}
                  onChange={(url) => f("image_url", url)}
                  label="Upload new creative"
                  folder="explore-jogja/ad-campaigns"
                  aspectClassName={editForm.placement === "listing_native" ? "aspect-[3/4]" : "aspect-[16/6]"}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-bg rounded-b-2xl">
              <button onClick={closeEdit}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving || !editForm.image_url || !editForm.target_url}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
