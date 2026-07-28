"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { ArrowLeft, Sparkles } from "lucide-react";

const CATEGORIES = ["Temple","Beach","Nature","Heritage","Cultural","Culinary","Shopping"];
const REGIONS = ["Sleman","Bantul","Yogyakarta","Gunungkidul","Kulon Progo"];

export default function CreateDestinationPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "Temple", sub_region: "Sleman", tagline: "",
    location: "", description: "", story: "", ticket_price: "",
    opening_hours: "", best_time: "", latitude: "", longitude: "",
    seo_title: "", seo_title_en: "", seo_keywords: "", seo_keywords_en: "", seo_description: "", seo_description_en: "",
    status: "draft",
  });

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

  async function generateAI() {
    if (!form.name) { showToast("Required", "Enter a destination name first", "warning"); return; }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationName: form.name, category: form.category, region: form.sub_region }),
      });
      const data = await res.json();
      if (data.description) { set("description", data.description); showToast("AI", "Description generated", "success"); }
      if (data.seoTitle) set("seo_title", data.seoTitle);
      if (data.seoDescription) set("seo_description", data.seoDescription);
      if (data.seoKeywords) set("seo_keywords", data.seoKeywords);
      if (data.descriptionEn) set("description_en", data.descriptionEn);
      if (data.seoTitleEn) set("seo_title_en", data.seoTitleEn);
      if (data.seoDescriptionEn) set("seo_description_en", data.seoDescriptionEn);
      if (data.seoKeywordsEn) set("seo_keywords_en", data.seoKeywordsEn);
    } catch { showToast("AI Error", "Generation failed", "error"); }
    finally { setAiLoading(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast("Created", "Destination added successfully", "success");
        router.push("/destinations");
      } else {
        const d = await res.json();
        showToast("Error", d?.message ?? "Failed to create destination", "error");
      }
    } catch { showToast("Error", "Network error", "error"); }
    finally { setSaving(false); }
  }

  const field = (label: string, key: string, placeholder = "") => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">{label}</label>
      <input
        value={form[key as keyof typeof form]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
      />
    </div>
  );

  return (
    <>
      <Header activeId="destinations" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/destinations" className="p-2.5 rounded-xl border border-border hover:bg-bg text-gray-500 transition-premium">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-primary font-display uppercase tracking-widest bg-primary/5 px-2.5 py-0.5 rounded-full inline-block mb-1">New destination</span>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Create Destination</h2>
          </div>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <h4 className="text-sm font-bold text-gray-800 font-display">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {field("Destination Name", "name", "e.g. Prambanan Temple")}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Category</label>
                    <select value={form.category} onChange={e => set("category", e.target.value)} className="w-full bg-bg focus:bg-white text-xs px-3.5 py-3 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Region</label>
                    <select value={form.sub_region} onChange={e => set("sub_region", e.target.value)} className="w-full bg-bg focus:bg-white text-xs px-3.5 py-3 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {field("Tagline", "tagline", "Short memorable phrase")}
                {field("Location / Address", "location", "Full address")}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Description</label>
                  <button type="button" onClick={generateAI} disabled={aiLoading} className="flex items-center gap-1.5 text-primary hover:text-primary-dark text-xs font-bold cursor-pointer transition disabled:opacity-60">
                    <Sparkles className="w-4 h-4" />{aiLoading ? "Generating…" : "AI Generate"}
                  </button>
                </div>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={6} placeholder="Enter description or use AI Generate..." className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium leading-relaxed" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Story / Editorial</label>
                <textarea value={form.story} onChange={e => set("story", e.target.value)} rows={4} className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium leading-relaxed" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <h4 className="text-sm font-bold text-gray-800 font-display">Practical Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {field("Ticket Price", "ticket_price", "e.g. Rp 50,000")}
                {field("Opening Hours", "opening_hours", "e.g. 06:00–18:00")}
                {field("Best Time to Visit", "best_time", "e.g. Sunrise")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {field("Latitude", "latitude")}
                {field("Longitude", "longitude")}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Status</h4>
              {(["draft", "published"] as const).map((s) => (
                <label key={s} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${form.status === s ? "border-primary/20 bg-primary/5" : "border-border hover:bg-bg"}`}>
                  <span className={`text-xs font-bold ${form.status === s ? "text-primary" : "text-gray-800"}`}>{s === "published" ? "Published" : "Draft"}</span>
                  <input type="radio" name="pub-status" checked={form.status === s} onChange={() => set("status", s)} className="text-primary focus:ring-primary w-4 h-4" />
                </label>
              ))}
            </div>
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Publish</h4>
              <button type="submit" disabled={saving || !form.name} className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-3 rounded-xl text-xs font-semibold shadow-premium transition-premium cursor-pointer">
                {saving ? "Creating…" : "Create Destination"}
              </button>
              <Link href="/destinations" className="block w-full text-center border border-border text-gray-600 hover:bg-bg py-3 rounded-xl text-xs font-semibold transition-premium">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
