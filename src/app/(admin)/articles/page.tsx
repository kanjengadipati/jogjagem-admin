"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import CoverImageUpload from "@/components/CoverImageUpload";
import { useToast } from "@/components/Toast";
import {
  FileText, Plus, Pencil, Trash2, Search, Loader2,
  Sparkles, X, Eye, EyeOff, ChevronDown,
  ExternalLink, ImagePlus, Link2, Link as LinkIcon,
} from "lucide-react";
import type { Article } from "@/types";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { ssr: false });

const CATEGORIES = ["panduan", "itinerary", "kuliner", "budaya", "alam", "tips", "lainnya"];
const STATUS_OPTIONS = ["draft", "published", "archived"];

const statusColor = (s?: string) =>
  s === "published" ? "bg-success/10 text-success" :
  s === "archived"  ? "bg-gray-100 text-gray-400" :
                      "bg-warning/10 text-warning";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const emptyArticle = (): Partial<Article> => ({
  slug: "", title: "", title_en: "",
  excerpt: "", excerpt_en: "",
  content: "", content_en: "",
  cover_image: "", category: "panduan", author: "Jogjagem Team",
  status: "draft", read_time_minutes: 5,
  seo_title: "", seo_title_en: "",
  seo_description: "", seo_description_en: "",
  seo_keywords: "", seo_keywords_en: "",
});

function ArticleModal({ article, onClose, onSaved }: {
  article: Partial<Article> | null;
  onClose: () => void;
  onSaved: (a: Article) => void;
}) {
  const { showToast } = useToast();
  const isEdit = !!article?.id;
  const [form, setForm] = useState<Partial<Article>>(article ?? emptyArticle());
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"id" | "en" | "seo">("id");
  const [aiLoading, setAiLoading] = useState(false);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [coverUrlResolved, setCoverUrlResolved] = useState("");
  const [coverUrlPreviewError, setCoverUrlPreviewError] = useState(false);

  const set = (key: keyof Article, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleTitleChange = (v: string) =>
    setForm(prev => ({ ...prev, title: v, slug: prev.slug || slugify(v) }));

  /** Convert a Wikipedia file page URL to the direct Wikimedia image URL via the API. */
  async function resolveWikipediaImageUrl(url: string): Promise<string> {
    const wikiMatch = url.match(/^https?:\/\/([a-z]+)\.wikipedia\.org\/wiki\/(Berkas|File):(.+)$/i);
    if (!wikiMatch) return url;
    const lang = wikiMatch[1];
    const filename = decodeURIComponent(wikiMatch[3]);
    const apiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const res = await fetch(apiUrl);
    if (!res.ok) return url;
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0] as { imageinfo?: { url: string }[] };
    return page?.imageinfo?.[0]?.url ?? url;
  }

  async function setCoverByUrl() {
    const trimmed = coverUrlInput.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch { showToast("Invalid URL", "Please enter a valid image URL", "error"); return; }

    let resolved = trimmed;
    if (/wikipedia\.org\/wiki\/(Berkas|File):/i.test(trimmed)) {
      try { resolved = await resolveWikipediaImageUrl(trimmed); } catch { /* fall through */ }
    }

    set("cover_image", resolved);
    setCoverUrlInput("");
    setCoverUrlPreviewError(false);
    setCoverUrlResolved("");
    showToast("Cover set", "Cover image applied from URL", "success");
  }

  async function generateAI() {
    if (!form.title) { showToast("Validation", "Enter a title first", "error"); return; }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, category: form.category }),
      });
      const json = await res.json();
      setForm(prev => ({
        ...prev,
        // Indonesian
        title:            json.title            ?? prev.title,
        content:          json.content          ?? prev.content,
        excerpt:          json.excerpt          ?? prev.excerpt,
        seo_title:        json.seoTitle         ?? prev.seo_title,
        seo_description:  json.seoDescription   ?? prev.seo_description,
        seo_keywords:     json.seoKeywords      ?? prev.seo_keywords,
        // English
        title_en:           json.titleEn          ?? prev.title_en,
        content_en:         json.contentEn        ?? prev.content_en,
        excerpt_en:         json.excerptEn        ?? prev.excerpt_en,
        seo_title_en:       json.seoTitleEn       ?? prev.seo_title_en,
        seo_description_en: json.seoDescriptionEn ?? prev.seo_description_en,
        seo_keywords_en:    json.seoKeywordsEn    ?? prev.seo_keywords_en,
      }));
      showToast("AI", "All fields generated — ID, EN & SEO", "success");
    } catch {
      showToast("AI Error", "Failed to generate content", "error");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave() {
    if (!form.title?.trim()) { showToast("Validation", "Title is required", "error"); return; }
    if (!form.slug?.trim()) { showToast("Validation", "Slug is required", "error"); return; }
    setSaving(true);
    try {
      const url = isEdit ? `/api/articles/${form.id}` : "/api/articles";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? "Save failed");
      onSaved(json.data as Article);
      showToast("Saved", isEdit ? "Article updated" : "Article created", "success");
    } catch (e) {
      showToast("Error", e instanceof Error ? e.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-extrabold font-display text-gray-900 text-lg">
              {isEdit ? "Edit Article" : "New Article"}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg text-gray-400 hover:text-gray-700 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body — 2 column */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] divide-y lg:divide-y-0 lg:divide-x divide-border min-h-full">

            {/* LEFT — editor */}
            <div className="p-6 space-y-5">
              {/* Titles */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Title (ID) *</label>
                  <input value={form.title ?? ""} onChange={e => handleTitleChange(e.target.value)}
                    className="w-full text-base font-bold px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition"
                    placeholder="Judul artikel dalam Bahasa Indonesia" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Slug *</label>
                    <input value={form.slug ?? ""} onChange={e => set("slug", e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition font-mono"
                      placeholder="url-friendly-slug" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Title (EN)</label>
                    <input value={form.title_en ?? ""} onChange={e => set("title_en", e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition"
                      placeholder="Article title in English" />
                  </div>
                </div>
              </div>

              {/* AI Generate */}
              <button
                onClick={() => generateAI()}
                disabled={aiLoading || !form.title?.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold text-sm transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {aiLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating content...</>
                  : <><Sparkles className="w-4 h-4" /> Generate Content Using AI</>
                }
              </button>

              {/* Language tabs */}
              <div>
                <div className="flex items-center mb-3">
                  <div className="flex gap-1 bg-bg rounded-xl p-1">
                    {(["id", "en", "seo"] as const).map(t => (
                      <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${tab === t ? "bg-white shadow text-primary" : "text-gray-400 hover:text-gray-700"}`}>
                        {t === "seo" ? "SEO" : t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {tab === "id" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Excerpt (ID)</label>
                      <textarea rows={2} value={form.excerpt ?? ""} onChange={e => set("excerpt", e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition resize-none"
                        placeholder="Ringkasan singkat artikel..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Content (ID)</label>
                      <RichTextEditor
                        value={form.content ?? ""}
                        onChange={v => setForm(prev => ({ ...prev, content: v }))}
                        placeholder="Mulai menulis konten artikel dalam Bahasa Indonesia..."
                      />
                    </div>
                  </div>
                )}

                {tab === "en" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Excerpt (EN)</label>
                      <textarea rows={2} value={form.excerpt_en ?? ""} onChange={e => set("excerpt_en", e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition resize-none"
                        placeholder="Short article summary in English..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Content (EN)</label>
                      <RichTextEditor
                        value={form.content_en ?? ""}
                        onChange={v => setForm(prev => ({ ...prev, content_en: v }))}
                        placeholder="Start writing article content in English..."
                      />
                    </div>
                  </div>
                )}

                {tab === "seo" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">SEO Title (ID)</label>
                      <input value={form.seo_title ?? ""} onChange={e => set("seo_title", e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition"
                        placeholder="SEO title Bahasa Indonesia" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">SEO Title (EN)</label>
                      <input value={form.seo_title_en ?? ""} onChange={e => set("seo_title_en", e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition"
                        placeholder="SEO title in English" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">SEO Description (ID)</label>
                      <textarea rows={3} value={form.seo_description ?? ""} onChange={e => set("seo_description", e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition resize-none"
                        placeholder="Meta description Bahasa Indonesia..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">SEO Description (EN)</label>
                      <textarea rows={3} value={form.seo_description_en ?? ""} onChange={e => set("seo_description_en", e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition resize-none"
                        placeholder="Meta description in English..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">SEO Keywords (ID)</label>
                      <input value={form.seo_keywords ?? ""} onChange={e => set("seo_keywords", e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition"
                        placeholder="kata kunci, dipisah koma" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">SEO Keywords (EN)</label>
                      <input value={form.seo_keywords_en ?? ""} onChange={e => set("seo_keywords_en", e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition"
                        placeholder="keywords, comma separated" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">OG Image URL</label>
                      <input value={form.og_image ?? ""} onChange={e => set("og_image", e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition"
                        placeholder="https://... (defaults to cover_image if empty)" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — sidebar */}
            <div className="p-6 space-y-5 bg-bg/30">
              <CoverImageUpload
                value={form.cover_image ?? ""}
                onChange={url => setForm(prev => ({ ...prev, cover_image: url }))}
              />

              {/* Find Cover Image / Add by URL */}
              <div className="border-t border-border pt-4 space-y-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">Find Cover Image from URL</label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <a
                    href={`https://unsplash.com/s/photos/${encodeURIComponent((form.title ?? "Yogyakarta") + " Yogyakarta")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
                    title="Search Unsplash"
                  >
                    <ExternalLink className="w-2.5 h-2.5" /> Unsplash
                  </a>
                  <a
                    href={`https://www.pexels.com/search/${encodeURIComponent((form.title ?? "Yogyakarta") + " Yogyakarta")}/`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
                    title="Search Pexels"
                  >
                    <ExternalLink className="w-2.5 h-2.5" /> Pexels
                  </a>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent((form.title ?? "Yogyakarta") + " Yogyakarta")}&tbm=isch`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                    title="Search Google Images"
                  >
                    <Search className="w-2.5 h-2.5" /> Find Images
                  </a>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-bg rounded-xl border border-transparent focus-within:border-border px-3 py-2">
                    <LinkIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <input
                      type="url"
                      value={coverUrlInput}
                      onChange={(e) => { setCoverUrlInput(e.target.value); setCoverUrlPreviewError(false); setCoverUrlResolved(""); }}
                      onKeyDown={(e) => e.key === "Enter" && setCoverByUrl()}
                      placeholder="Paste image URL here…"
                      className="flex-1 bg-transparent text-xs outline-none font-mono text-gray-700 placeholder:text-gray-400"
                    />
                    {coverUrlInput && (
                      <button
                        onClick={() => { setCoverUrlInput(""); setCoverUrlPreviewError(false); setCoverUrlResolved(""); }}
                        className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                      >✕</button>
                    )}
                  </div>
                  <button
                    onClick={setCoverByUrl}
                    disabled={!coverUrlInput.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer whitespace-nowrap"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    Set
                  </button>
                </div>

                {coverUrlInput.trim() && !coverUrlPreviewError && (
                  <div className="flex items-start gap-3 p-3 bg-bg rounded-xl border border-border">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-border shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverUrlResolved || coverUrlInput.trim()}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={() => setCoverUrlPreviewError(true)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Preview</p>
                      <p className="text-[11px] text-gray-600 truncate font-mono">{coverUrlResolved || coverUrlInput.trim()}</p>
                      {coverUrlResolved && coverUrlResolved !== coverUrlInput.trim() && (
                        <p className="text-[10px] text-green-600 font-semibold mt-0.5">✓ Wikipedia URL resolved to direct image</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">Press Enter or click &ldquo;Set&rdquo; to apply as cover</p>
                    </div>
                  </div>
                )}
                {coverUrlInput.trim() && coverUrlPreviewError && (
                  <p className="text-[11px] text-red-500 font-semibold">Could not load image preview — check the URL is a direct image link.</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Category</label>
                <div className="relative">
                  <select value={form.category ?? "panduan"} onChange={e => set("category", e.target.value)}
                    className="w-full appearance-none text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-white transition cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Status</label>
                <div className="relative">
                  <select value={form.status ?? "draft"} onChange={e => set("status", e.target.value)}
                    className="w-full appearance-none text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-white transition cursor-pointer">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Author</label>
                <input value={form.author ?? ""} onChange={e => set("author", e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-white transition"
                  placeholder="Jogjagem Team" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Read Time (minutes)</label>
                <input type="number" min={1} max={60} value={form.read_time_minutes ?? 5}
                  onChange={e => set("read_time_minutes", +e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-white transition" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-bg/40 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-bg transition cursor-pointer">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition cursor-pointer disabled:opacity-60 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Article"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Article> | null | false>(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/articles?status=")
      .then(r => r.json())
      .then(d => { const list = d?.data ?? []; setAll(list); setFiltered(list); })
      .catch(() => showToast("Error", "Failed to load articles", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = all;
    if (search) list = list.filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.category ?? "").toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter) list = list.filter(a => a.status === statusFilter);
    if (categoryFilter) list = list.filter(a => a.category === categoryFilter);
    setFiltered(list);
  }, [search, statusFilter, categoryFilter, all]);

  async function deleteArticle(id: string, title: string) {
    if (!confirm(`Delete article "${title}"?`)) return;
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAll(prev => prev.filter(a => a.id !== id));
      showToast("Deleted", "Article removed", "success");
    } else {
      showToast("Error", "Delete failed", "error");
    }
  }

  async function togglePublish(article: Article) {
    const next = article.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/articles/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setAll(prev => prev.map(a => a.id === article.id ? { ...a, status: next } : a));
      showToast("Updated", `Article ${next}`, "success");
    } else {
      showToast("Error", "Update failed", "error");
    }
  }

  function handleSaved(a: Article) {
    setAll(prev => {
      const exists = prev.find(x => x.id === a.id);
      return exists ? prev.map(x => x.id === a.id ? a : x) : [a, ...prev];
    });
    setModal(false);
  }

  const published = all.filter(a => a.status === "published").length;
  const drafts = all.filter(a => a.status === "draft").length;

  return (
    <>
      <Header activeId="articles" />
      {modal !== false && (
        <ArticleModal article={modal} onClose={() => setModal(false)} onSaved={handleSaved} />
      )}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Blog Articles</h2>
            <p className="text-xs text-gray-500 mt-1">Manage SEO blog content for Jogjagem. Write in Indonesian and English with AI assistance.</p>
          </div>
          <button onClick={() => setModal(emptyArticle())}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition cursor-pointer shadow-soft">
            <Plus className="w-4 h-4" /> New Article
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: all.length, color: "text-gray-900" },
            { label: "Published", value: published, color: "text-success" },
            { label: "Drafts", value: drafts, color: "text-warning" },
            { label: "Categories", value: new Set(all.map(a => a.category)).size, color: "text-primary" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-card border border-border shadow-soft p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
              <p className={`text-2xl font-extrabold font-display mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-bg text-xs px-3.5 py-2.5 rounded-xl border border-transparent outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="w-full bg-bg text-xs px-3.5 py-2.5 rounded-xl border border-transparent outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Article</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-center">Read Time</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {loading ? (
                  <tr><td colSpan={5} className="py-16 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading…</span></div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2"><FileText className="w-8 h-8" /><span>No articles found</span></div>
                  </td></tr>
                ) : filtered.map(a => (
                  <tr key={a.id} className="hover:bg-bg/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-gray-900 font-display block max-w-xs truncate">{a.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono">/{a.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{a.category ?? "—"}</span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-500">{a.read_time_minutes ?? 5} min</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${statusColor(a.status)}`}>{a.status ?? "draft"}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => togglePublish(a)} title={a.status === "published" ? "Unpublish" : "Publish"}
                          className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 cursor-pointer transition">
                          {a.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setModal(a)}
                          className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 cursor-pointer transition">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteArticle(a.id, a.title)}
                          className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && (
            <div className="p-4 border-t border-border text-xs text-gray-400 font-semibold">
              Showing {filtered.length} of {all.length} articles
            </div>
          )}
        </div>
      </main>
    </>
  );
}
