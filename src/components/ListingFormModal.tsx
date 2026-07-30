"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save, Send, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/Toast";
import type { Partner } from "@/types";

const CATEGORIES = ["Kuliner", "Hotel & Penginapan", "Wisata & Destinasi", "Oleh-oleh", "Jasa", "Lainnya"];
const LOCATIONS = ["Yogyakarta", "Sleman", "Bantul", "Gunung Kidul", "Kulon Progo"];

interface ListingFormModalProps {
  open: boolean;
  onClose: () => void;
  listing?: Partner | null;
  onSaved: () => void;
}

export default function ListingFormModal({ open, onClose, listing, onSaved }: ListingFormModalProps) {
  const { showToast } = useToast();
  const isEdit = !!listing;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [price, setPrice] = useState("");

  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (open) {
      setName(listing?.name ?? "");
      setCategory(listing?.category ?? "");
      setLocation(listing?.location ?? "");
      setDescription(listing?.description ?? "");
      setAddress(listing?.address ?? "");
      setImage(listing?.image ?? "");
      setPhone(listing?.phone ?? "");
      setWebsite(listing?.website ?? "");
      setPrice(listing?.price ?? "");
    }
  }, [open, listing]);

  if (!open) return null;

  function reset() {
    onClose();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { description, address, image, phone, website, price };
      if (!isEdit) {
        payload.name = name;
        payload.category = category;
        payload.location = location;
      }
      const url = isEdit ? `/api/partners/me/${listing!.id}` : "/api/partners";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.status === "success") {
        showToast("Saved", "Listing saved successfully", "success");
        onSaved();
        reset();
      } else {
        showToast("Error", data?.message || "Failed to save listing", "error");
      }
    } catch {
      showToast("Error", "Failed to save listing", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitForReview() {
    if (!description.trim() || !address.trim()) {
      showToast("Validation", "Description and address are required to submit for review", "warning");
      return;
    }
    setSaving(true);
    try {
      const saveRes = await fetch(`/api/partners/me/${listing!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, address, image, phone, website, price }),
      });
      const saveData = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok || saveData?.status !== "success") {
        showToast("Error", saveData?.message || "Failed to save before submitting", "error");
        setSaving(false);
        return;
      }

      const submitRes = await fetch(`/api/partners/me/${listing!.id}/submit-for-review`, { method: "POST" });
      const submitData = await submitRes.json().catch(() => ({}));
      if (submitRes.ok && submitData?.status === "success") {
        showToast("Submitted", "Listing submitted for review", "success");
        onSaved();
        reset();
      } else {
        showToast("Error", submitData?.message || "Failed to submit for review", "error");
      }
    } catch {
      showToast("Error", "Failed to submit for review", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={reset} />
      <div className="relative bg-white rounded-card border border-border shadow-premium w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-extrabold font-display text-gray-900 tracking-tight">
            {isEdit ? "Edit Listing" : "Add New Listing"}
          </h3>
          <button onClick={reset} className="p-1.5 hover:bg-bg rounded-lg cursor-pointer">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!isEdit && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Bakpia Pathok 25" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location *</label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                    <option value="">Select location</option>
                    {LOCATIONS.map((l) => (<option key={l} value={l}>{l}</option>))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description {isEdit ? "(required for review)" : ""}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y" placeholder="Describe your business, what makes it unique..." />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Address {isEdit ? "(required for review)" : ""}</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Full street address" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Image URL</label>
            <div className="flex gap-2">
              <input value={image} onChange={(e) => setImage(e.target.value)} className="flex-1 px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://example.com/photo.jpg" />
              {image && (
                <button onClick={() => setShowPreview(!showPreview)} className="px-3 py-2.5 border border-border rounded-xl hover:bg-bg text-gray-500 cursor-pointer">
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
            {showPreview && image && (
              <div className="mt-2 rounded-xl overflow-hidden border border-border h-40 bg-gray-50">
                <img src={image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0812-3456-7890" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Website</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://example.com" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Price Range</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Rp 10,000 - Rp 50,000" />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <button onClick={reset} className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-bg rounded-xl transition cursor-pointer">
            Cancel
          </button>
          {isEdit && (
            <button
              onClick={handleSubmitForReview}
              disabled={saving || !description.trim() || !address.trim()}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-primary hover:bg-primary-dark text-white rounded-xl shadow-premium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit for Review
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || (!isEdit && (!name.trim() || !category.trim()))}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-primary hover:bg-primary-dark text-white rounded-xl shadow-premium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isEdit ? "Save Draft" : "Create Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}
