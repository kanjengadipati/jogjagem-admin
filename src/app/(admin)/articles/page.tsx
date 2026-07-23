"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  FileText, Plus, Pencil, Trash2, Search, Loader2,
  Sparkles, X, Eye, EyeOff, ChevronDown,
} from "lucide-react";
import type { Article } from "@/types";

const CATEGORIES = ["panduan", "itinerary", "kuliner", "budaya", "alam", "tips", "lainnya"];
const STATUS_OPTIONS = ["draft", "published", "archived"];

const statusColor = (s?: string) =>
  s === "published" ? "bg-success/10 text-success" :
  s === "archived"  ? "bg-gray-100 text-gray-400" :
                      "bg-warning/10 text-warning";

// ─── Slugify helper ────────────────────────────────────────────────────────────
function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ─── Empty article template ────────────────────────────────────────────────────
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

// ─── ArticleModal ──────────────────────────────────────────────────────────────
function ArticleModal({
  article, onClose, onSaved,
}: {
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

  const set = (key: keyof Article, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // Auto-slug from title
  const handleTitleChange = (v: string) => {
    setForm(prev => ({ ...prev, title: v, slug: prev.slug || slugify(v) }));
  };

  async function generateAI(lang: "id" | "en") {
    if (!form.title) { showToast("Validation", "Enter a title first", "error"); return; }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, category: form.category, language: lang }),
      });
      const json = await res.json();
      if (lang === "id") {
        setForm(prev => ({
          ...prev,
          content: json.content ?? prev.content,
          excerpt: json.excerpt ?? prev.excerpt,
          seo_description: json.seoDescription ?? prev.seo_description,
          seo_keywords: json.seoKeywords ?? prev.seo_keywords,
        }));
        setTab("id");
      } else {
        setForm(prev => ({
          ...prev,
          content_en: json.content ?? prev.content_en,
          excerpt_en: json.excerpt ?? prev.excerpt_en,
          seo_description_en: json.seoDescription ?? prev.seo_description_en,
          seo_keywords_en: json.seoKeywords ?? prev.seo_keywords_en,
        }));
        setTab("en");
      }
      showToast("AI", `Content generated in ${lang === "id" ? "Indonesian" : "English"}`, "success");
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
      const payload = { ...form };
      const url = isEdit ? `/api/articles/${form.id}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Base fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Title (ID)</label>
              <input value={form.title ?? ""} onChange={e => handleTitleChange(e.target.value)}
                className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition"
                placeholder="Judul artikel dalam Bahasa Indonesia" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Slug</label>
              <input value={form.slug ?? ""} onChange={e => set("slug", e.target.value)}
                className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition font-mono"
                placeholder="url-friendly-slug" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Title (EN)</label>
              <input value={form.title_en ?? ""} onChange={e => set("title_en", e.target.value)}
                className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition"
                placeholder="Article title in English" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Category</label>
              <div className="relative">
                <select value={form.category ?? "panduan"} onChange={e => set("category", e.target.value)}
                  className="w-full appearance-none text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition cursor-pointer">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Status</label>
              <div className="relative">
                <select value={form.status ?? "draft"} onChange={e => set("status", e.target.value)}
                  className="w-full appearance-none text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition cursor-pointer">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Author</label>
              <input value={form.author ?? ""} onChange={e => set("author", e.target.value)}
                className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition"
                placeholder="Jogjagem Team" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Read Time (minutes)</label>
              <input type="number" min={1} max={60} value={form.read_time_minutes ?? 5} onChange={e => set("read_time_minutes", +e.target.value)}
                className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Cover Image URL</label>
              <input value={form.cover_image ?? ""} onChange={e => set("cover_image", e.target.value)}
                className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition"
                placeholder="https://..." />
            </div>
          </div>

          {/* Language tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1 bg-bg rounded-xl p-1">
                {(["id", "en", "seo"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${tab === t ? "bg-white shadow text-primary" : "text-gray-400 hover:text-gray-700"}`}>
                    {t === "seo" ? "SEO" : t.toUpperCase()}
                  </button>
                ))}
              </div>
              {tab !== "seo" && (
                <button onClick={() => generateAI(tab)} disabled={aiLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition cursor-pointer disabled:opacity-50">
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Generate with AI ({tab.toUpperCase()})
                </button>
              )}
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
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Content (ID) — HTML</label>
                  <textarea rows={12} value={form.content ?? ""} onChange={e => set("content", e.target.value)}
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition resize-y"
                    placeholder="<h2>Judul Bagian</h2>\n<p>Konten artikel...</p>" />
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
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Content (EN) — HTML</label>
                  <textarea rows={12} value={form.content_en ?? ""} onChange={e => set("content_en", e.target.value)}
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition resize-y"
                    placeholder="<h2>Section Title</h2>\n<p>Article content...</p>" />
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
                  <textarea rows={2} value={form.seo_description ?? ""} onChange={e => set("seo_description", e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border focus:border-primary outline-none bg-bg focus:bg-white transition resize-none"
                    placeholder="Meta description Bahasa Indonesia..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">SEO Description (EN)</label>
                  <textarea rows={2} value={form.seo_description_en ?? ""} onChange={e => set("seo_description_en", e.target.value)}
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-bg/40">
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
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
        <ArticleModal
          article={modal}
          onClose={() => setModal(false)}
          onSaved={handleSaved}
        />
      )}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Page header */}
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
