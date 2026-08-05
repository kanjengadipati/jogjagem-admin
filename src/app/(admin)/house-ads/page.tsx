"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import CoverImageUpload from "@/components/CoverImageUpload";
import { useToast } from "@/components/Toast";
import {
  Megaphone, Loader2, PanelTop, Plus, Save, Trash2,
  Globe, Eye, EyeOff, Pencil, X, ChevronDown,
} from "lucide-react";
import type { HouseAd } from "@/types";
import { AD_PLACEMENTS } from "@/lib/adPlacements";

const PLACEMENTS: { value: string; label: string; desc: string }[] =
  Object.entries(AD_PLACEMENTS).map(([value, info]) => ({
    value,
    label: info.name,
    desc: info.description + (info.notes ? ` (${info.notes})` : ""),
  }));

const PLACEMENT_MAP = Object.fromEntries(PLACEMENTS.map((p) => [p.value, p.label]));

const EMPTY_FORM: Omit<HouseAd, "id"> = {
  placement: "homepage_hero_aicard",
  headline: "",
  headline_en: "",
  subline: "",
  subline_en: "",
  cta_label: "",
  cta_label_en: "",
  image_url: "",
  target_url: "",
  is_enabled: true,
};

// ─── Live Preview ──────────────────────────────────────────────────────────
function LivePreview({ form, locale }: { form: Omit<HouseAd, "id">; locale: "id" | "en" }) {
  const hasImage = Boolean(form.image_url);
  const headline = (locale === "en" && form.headline_en) ? form.headline_en : form.headline;
  const subline  = (locale === "en" && form.subline_en)  ? form.subline_en  : form.subline;
  const cta      = (locale === "en" && form.cta_label_en)? form.cta_label_en: form.cta_label;

  return (
    <div className="sticky top-6">
      {/* Browser chrome */}
      <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-white">
        <div className="h-7 bg-stone-50 border-b border-stone-200 flex items-center gap-1.5 px-3">
          <div className="w-2 h-2 rounded-full bg-red-300" />
          <div className="w-2 h-2 rounded-full bg-yellow-300" />
          <div className="w-2 h-2 rounded-full bg-green-300" />
          <div className="flex-1 mx-3 h-4 bg-stone-200 rounded-full text-[9px] text-stone-400 flex items-center px-2">
            jogjagem.com
          </div>
        </div>

        {/* Ad preview */}
        <div className="p-3 bg-[#F5F0E8]">
          <div className={`relative flex flex-col justify-center gap-2 w-full aspect-[16/5] overflow-hidden rounded-xl bg-stone-200 text-left px-5`}>
            {hasImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/40 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-stone-700 to-stone-500" />
            )}
            <div className="relative max-w-xs">
              <p className="font-bold text-sm text-white leading-tight">
                {headline || <span className="opacity-40">Headline Iklan…</span>}
              </p>
              {subline && (
                <p className="mt-1 text-xs text-white/70 leading-snug">{subline}</p>
              )}
              <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold bg-white text-stone-900">
                <Megaphone className="h-3 w-3" />
                {cta || <span className="opacity-40">CTA Label</span>}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Locale toggle */}
      <p className="text-[10px] text-stone-400 text-center mt-2">
        Preview: <span className="font-bold text-stone-600">{locale === "id" ? "🇮🇩 Bahasa Indonesia" : "🇬🇧 English"}</span>
      </p>
    </div>
  );
}

// ─── Bilingual Field ───────────────────────────────────────────────────────
function BilingualField({
  label,
  idValue,
  enValue,
  onIdChange,
  onEnChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  idValue: string;
  enValue: string;
  onIdChange: (v: string) => void;
  onEnChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const inputClass =
    "w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition placeholder:text-stone-300 resize-none";

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-stone-600">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
            <span>🇮🇩</span> ID
          </div>
          {multiline ? (
            <textarea
              rows={2}
              value={idValue}
              onChange={(e) => onIdChange(e.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />
          ) : (
            <input
              type="text"
              value={idValue}
              onChange={(e) => onIdChange(e.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
            <span>🇬🇧</span> EN
          </div>
          {multiline ? (
            <textarea
              rows={2}
              value={enValue}
              onChange={(e) => onEnChange(e.target.value)}
              placeholder={placeholder ? `${placeholder} (English)` : undefined}
              className={inputClass}
            />
          ) : (
            <input
              type="text"
              value={enValue}
              onChange={(e) => onEnChange(e.target.value)}
              placeholder={placeholder ? `${placeholder} (English)` : undefined}
              className={inputClass}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function HouseAdsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<HouseAd[]>([]);
  const [form, setForm] = useState<Omit<HouseAd, "id">>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<"id" | "en">("id");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/house-ads");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load house ads");
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      showToast("Error", err instanceof Error ? err.message : "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  function startEdit(item: HouseAd) {
    setEditingId(item.id);
    setForm({
      placement:   item.placement,
      headline:    item.headline,
      headline_en: item.headline_en ?? "",
      subline:     item.subline ?? "",
      subline_en:  item.subline_en ?? "",
      cta_label:   item.cta_label,
      cta_label_en:item.cta_label_en ?? "",
      image_url:   item.image_url ?? "",
      target_url:  item.target_url,
      is_enabled:  item.is_enabled ?? true,
    });
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  async function save() {
    if (!form.headline.trim() || !form.cta_label.trim() || !form.target_url.trim()) {
      showToast("Validasi", "Headline, CTA Label, dan Target URL wajib diisi", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/house-ads/${editingId}` : "/api/house-ads",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to save");
      showToast("Tersimpan", editingId ? "House ad diperbarui" : "House ad dibuat", "success");
      resetForm();
      load();
    } catch (err) {
      showToast("Error", err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: HouseAd) {
    if (!confirm(`Hapus house ad untuk slot "${PLACEMENT_MAP[item.placement] || item.placement}"?`)) return;
    const res = await fetch(`/api/house-ads/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      showToast("Dihapus", "House ad dihapus", "success");
    } else {
      showToast("Error", "Gagal menghapus house ad", "error");
    }
  }

  async function toggleEnabled(item: HouseAd) {
    const res = await fetch(`/api/house-ads/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_enabled: !item.is_enabled }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, is_enabled: !x.is_enabled } : x))
      );
    }
  }

  const f = (field: keyof Omit<HouseAd, "id">, val: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  return (
    <>
      <Header activeId="house-ads" />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 font-display flex items-center gap-2">
              <PanelTop className="w-5 h-5 text-amber-600" />
              House Ads
            </h1>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">
              Iklan fallback platform — tampil saat tidak ada kampanye berbayar aktif
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Buat Baru
          </button>
        </div>

        {/* ── Form panel (slide-in style) ── */}
        {showForm && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            {/* Form header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="text-sm font-bold text-stone-900">
                {editingId ? "Edit House Ad" : "Buat House Ad Baru"}
              </h2>
              <button onClick={resetForm} className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-0">
              {/* Left: form fields */}
              <div className="p-6 space-y-6 border-r border-stone-100">

                {/* Placement */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-stone-600">Placement</p>
                  <div className="relative">
                    <select
                      value={form.placement}
                      onChange={(e) => f("placement", e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 font-semibold text-stone-800 pr-8 cursor-pointer"
                    >
                      {PLACEMENTS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label} — {p.desc}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Bilingual content */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-amber-600" />
                    <p className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">Konten Bilingual</p>
                  </div>

                  <BilingualField
                    label="Headline *"
                    idValue={form.headline}
                    enValue={form.headline_en ?? ""}
                    onIdChange={(v) => f("headline", v)}
                    onEnChange={(v) => f("headline_en", v)}
                    placeholder="Judul iklan"
                  />
                  <BilingualField
                    label="Subline"
                    idValue={form.subline ?? ""}
                    enValue={form.subline_en ?? ""}
                    onIdChange={(v) => f("subline", v)}
                    onEnChange={(v) => f("subline_en", v)}
                    placeholder="Sub-headline (opsional)"
                    multiline
                  />
                  <BilingualField
                    label="CTA Label *"
                    idValue={form.cta_label}
                    enValue={form.cta_label_en ?? ""}
                    onIdChange={(v) => f("cta_label", v)}
                    onEnChange={(v) => f("cta_label_en", v)}
                    placeholder="Teks tombol"
                  />
                </div>

                {/* Target URL */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-stone-600">Target URL *</p>
                  <input
                    type="url"
                    value={form.target_url}
                    onChange={(e) => f("target_url", e.target.value)}
                    placeholder="https://... atau /path/relatif"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 font-mono transition placeholder:text-stone-300"
                  />
                </div>

                {/* Image */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-stone-600">Gambar (opsional)</p>
                  <CoverImageUpload
                    value={form.image_url ?? ""}
                    onChange={(url) => f("image_url", url)}
                    label="Upload gambar iklan"
                    folder="explore-jogja/ads"
                  />
                </div>

                {/* Enabled toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => f("is_enabled", !form.is_enabled)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${form.is_enabled ? "bg-amber-500" : "bg-stone-300"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.is_enabled ? "translate-x-4" : ""}`} />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">
                    {form.is_enabled ? "Aktif — akan ditampilkan" : "Nonaktif — disembunyikan"}
                  </span>
                </label>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {editingId ? "Simpan Perubahan" : "Buat House Ad"}
                  </button>
                </div>
              </div>

              {/* Right: live preview */}
              <div className="p-6 bg-stone-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Live Preview</p>
                  <div className="flex rounded-xl overflow-hidden border border-stone-200 text-[10px] font-bold">
                    {(["id", "en"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setPreviewLocale(l)}
                        className={`px-3 py-1.5 cursor-pointer transition-colors ${previewLocale === l ? "bg-amber-500 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
                      >
                        {l === "id" ? "🇮🇩 ID" : "🇬🇧 EN"}
                      </button>
                    ))}
                  </div>
                </div>
                <LivePreview form={form} locale={previewLocale} />
              </div>
            </div>
          </div>
        )}

        {/* ── House ads list ── */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center text-stone-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-stone-400">
              <PanelTop className="w-10 h-10 text-stone-300" />
              <p className="text-sm font-semibold">Belum ada house ad</p>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
              >
                Buat yang pertama →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {items.map((item) => {
                const placement = PLACEMENTS.find((p) => p.value === item.placement);
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50/60 transition-colors">
                    {/* Thumbnail */}
                    <div className="h-14 w-20 rounded-xl bg-stone-100 overflow-hidden shrink-0 relative">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <PanelTop className="w-5 h-5 text-stone-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          {placement?.label ?? item.placement}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.is_enabled
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-stone-100 text-stone-500 border border-stone-200"
                        }`}>
                          {item.is_enabled ? "Aktif" : "Nonaktif"}
                        </span>
                        {item.headline_en && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" /> Bilingual
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-stone-900 truncate">{item.headline}</p>
                      {item.headline_en && (
                        <p className="text-xs text-stone-400 truncate italic">{item.headline_en}</p>
                      )}
                      {placement?.desc && (
                        <p className="text-[10px] text-stone-400">{placement.desc}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleEnabled(item)}
                        title={item.is_enabled ? "Nonaktifkan" : "Aktifkan"}
                        className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                      >
                        {item.is_enabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className="p-2 rounded-xl hover:bg-amber-50 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => remove(item)}
                        className="p-2 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </>
  );
}
