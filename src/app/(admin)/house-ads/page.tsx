"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import CoverImageUpload from "@/components/CoverImageUpload";
import { useToast } from "@/components/Toast";
import { Megaphone, Loader2, PanelTop, Plus, Save, Trash2 } from "lucide-react";
import type { HouseAd } from "@/types";

const PLACEMENTS = ["homepage_hero", "listing_top", "listing_native", "destination_detail"];

function HouseAdPreview({ form }: { form: Omit<HouseAd, "id"> }) {
  const hasImage = Boolean(form.image_url);
  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 sticky top-8">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Live Preview</p>
      <div className={`relative flex flex-col justify-center gap-2 w-full aspect-[16/5] overflow-hidden rounded-2xl bg-stone-200 text-left px-5`}>
        {hasImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 to-transparent" />
          </>
        )}
        <div className={`relative max-w-sm ${hasImage ? 'text-white' : 'text-stone-900'}`}>
          <p className="font-bold text-sm leading-tight">{form.headline || "Headline Iklan"}</p>
          <p className={`mt-1 text-xs ${hasImage ? 'text-white/80' : 'text-stone-600'}`}>{form.subline || "Sub-headline atau deskripsi singkat"}</p>
          <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${hasImage ? 'bg-white text-stone-900' : 'bg-primary text-white'}`}>
             {form.cta_label || "CTA Button"}
          </span>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM: Omit<HouseAd, "id"> = {
  placement: "homepage_hero",
  headline: "",
  subline: "",
  cta_label: "Hubungi kami",
  image_url: "",
  target_url: "",
  is_enabled: true,
};

export default function HouseAdsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<HouseAd[]>([]);
  const [form, setForm] = useState<Omit<HouseAd, "id">>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/house-ads");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load house ads");
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      showToast("Error", err instanceof Error ? err.message : "Failed to load house ads", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function edit(item: HouseAd) {
    setEditingId(item.id);
    setForm({
      placement: item.placement,
      headline: item.headline,
      subline: item.subline ?? "",
      cta_label: item.cta_label,
      image_url: item.image_url ?? "",
      target_url: item.target_url,
      is_enabled: item.is_enabled ?? true,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/house-ads/${editingId}` : "/api/house-ads", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to save house ad");
      showToast("Saved", "House ad saved", "success");
      resetForm();
      load();
    } catch (err) {
      showToast("Error", err instanceof Error ? err.message : "Failed to save house ad", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: HouseAd) {
    if (!confirm(`Delete house ad for ${item.placement}?`)) return;
    const res = await fetch(`/api/house-ads/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(prev => prev.filter(existing => existing.id !== item.id));
      showToast("Deleted", "House ad deleted", "success");
    } else {
      showToast("Error", "Failed to delete house ad", "error");
    }
  }

  return (
    <>
      <Header activeId="house-ads" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">House Ads</h2>
            <p className="text-xs text-gray-500 mt-1">Manage platform-owned fallback ads shown only when no paid campaign is available.</p>
          </div>
          <button onClick={resetForm} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-semibold">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
          {/* Form Area */}
          <div className="bg-white rounded-card border border-border shadow-soft p-6 space-y-6">
            <h3 className="text-sm font-bold text-gray-900 font-display">{editingId ? `Edit: ${form.headline}` : "Create House Ad"}</h3>
            
            {/* Section 1 */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">1. Positioning</label>
                <select value={form.placement} onChange={e => setForm({...form, placement: e.target.value})} className="w-full bg-bg text-xs px-3.5 py-2.5 rounded-xl outline-none font-semibold">
                  {PLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">2. Content</label>
                {(["headline", "subline", "cta_label", "target_url"] as const).map(field => (
                  <input
                    key={field}
                    value={String(form[field] ?? "")}
                    onChange={e => setForm({...form, [field]: e.target.value})}
                    placeholder={field.replace(/_/g, " ")}
                    className="w-full bg-bg text-xs px-3.5 py-2.5 rounded-xl outline-none font-medium"
                  />
                ))}
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">3. Media</label>
                <CoverImageUpload 
                  value={form.image_url ?? ""} 
                  onChange={(url) => setForm({...form, image_url: url})}
                  label="Ad Image"
                  folder="explore-jogja/ads"
                />
            </div>
            
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <input type="checkbox" checked={!!form.is_enabled} onChange={e => setForm({...form, is_enabled: e.target.checked})} />
              Enabled
            </label>
            <div className="flex gap-3">
                {editingId && <button onClick={resetForm} className="flex-1 text-center py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>}
                <button onClick={save} disabled={saving} className="flex-[2] flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-xs font-semibold disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Update House Ad" : "Save House Ad"}
                </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="hidden xl:block">
            <HouseAdPreview form={form} />
          </div>
        </div>

        {/* List Items Area */}
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
              <PanelTop className="w-10 h-10" />
              <span className="text-sm font-semibold">No house ads yet</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map(item => (
                <div key={item.id} className="p-5 flex items-start gap-4">
                  <div className="h-16 w-24 rounded-xl bg-bg overflow-hidden shrink-0">
                    {item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <button onClick={() => edit(item)} className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.placement}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.is_enabled ? "bg-success/10 text-success" : "bg-gray-100 text-gray-500"}`}>
                        {item.is_enabled ? "Enabled" : "Hidden"}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-bold text-gray-900">{item.headline}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{item.subline}</p>
                  </button>
                  <button onClick={() => remove(item)} className="p-2 text-danger hover:bg-red-50 rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
