"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { parseImages } from "@/lib/images";
import { ArrowLeft, Sparkles, ImagePlus, Trash2, Loader2, Calendar, Link2, Unlink, Search, ExternalLink, Link as LinkIcon } from "lucide-react";
import type { Destination, Event } from "@/types";

const CLOUDINARY_CLOUD = "wdsepioa";
// For signed upload without a preset, we use the API key directly:
const CLOUDINARY_API_KEY = "738718397121653";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

const CATEGORIES = ["Temple", "Beach", "Nature", "Heritage", "Cultural", "Culinary", "Shopping"];

function normalizeCategory(val: string): string {
  if (!val) return "";
  const lower = val.toLowerCase();
  const found = CATEGORIES.find((c) => c.toLowerCase() === lower);
  return found ?? val;
}
const REGIONS = ["Sleman", "Bantul", "Yogyakarta", "Gunungkidul", "Kulon Progo"];

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? "";
}

type Tab = "overview" | "gallery" | "facilities" | "seo" | "events";

type FormState = {
  name: string;
  name_en: string;
  category: string;
  sub_region: string;
  tagline: string;
  tagline_en: string;
  location: string;
  description: string;
  description_en: string;
  story: string;
  story_en: string;
  ticket_price: string;
  opening_hours: string;
  best_time: string;
  best_time_en: string;
  latitude: string;
  longitude: string;
  video_url: string;
  seo_title: string;
  seo_title_en: string;
  seo_keywords: string;
  seo_keywords_en: string;
  seo_description: string;
  seo_description_en: string;
  og_image_url: string;
};

const EMPTY_FORM: FormState = {
  name: "", name_en: "", category: "", sub_region: "", tagline: "", tagline_en: "", location: "",
  description: "", description_en: "", story: "", story_en: "", ticket_price: "", opening_hours: "", best_time: "", best_time_en: "",
  latitude: "", longitude: "", video_url: "", seo_title: "", seo_title_en: "", seo_keywords: "", seo_keywords_en: "", seo_description: "", seo_description_en: "", og_image_url: "",
};

function FieldInput({ label, value, onChange, mono = false }: {
  label: string; value: string; onChange: (v: string) => void; mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium${mono ? " font-mono" : ""}`}
      />
    </div>
  );
}

/** Upload a single File directly to Cloudinary from the browser and return the secure URL. */
async function uploadToCloudinary(file: File): Promise<string> {
  // Get a signed params from our API route (secret never exposed)
  const sigRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: "explore-jogja" }),
  });
  const { signature, timestamp, folder } = await sigRes.json();

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", CLOUDINARY_API_KEY);
  fd.append("timestamp", String(timestamp));
  fd.append("folder", folder);
  fd.append("signature", signature);

  const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Upload failed");
  return data.secure_url as string;
}

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dest, setDest] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [lang, setLang] = useState<"id" | "en">("id");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [galleryImgs, setGalleryImgs] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [urlPreviewError, setUrlPreviewError] = useState(false);
  const [urlResolved, setUrlResolved] = useState("");
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [linkingEvent, setLinkingEvent] = useState<string | null>(null);
  const [eventSearch, setEventSearch] = useState("");

  function setField(key: keyof FormState, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  useEffect(() => {
    fetch(`/api/destinations/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const data: Destination = d?.data ?? null;
        setDest(data);
        if (data) {
          setForm({
            name: data.name ?? "",
            name_en: data.name_en ?? "",
            category: normalizeCategory(data.category ?? ""),
            sub_region: data.sub_region ?? "",
            tagline: data.tagline ?? "",
            tagline_en: data.tagline_en ?? "",
            location: data.location ?? "",
            description: data.description ?? "",
            description_en: data.description_en ?? "",
            story: data.story ?? "",
            story_en: data.story_en ?? "",
            ticket_price: data.ticket_price ?? "",
            opening_hours: data.opening_hours ?? "",
            best_time: data.best_time ?? "",
            best_time_en: data.best_time_en ?? "",
            latitude: String(data.latitude ?? ""),
            longitude: String(data.longitude ?? ""),
            video_url: data.video_url ?? "",
            seo_title: data.seo_title ?? "",
            seo_title_en: data.seo_title_en ?? "",
            seo_keywords: data.seo_keywords ?? "",
            seo_keywords_en: data.seo_keywords_en ?? "",
            seo_description: data.seo_description ?? "",
            seo_description_en: data.seo_description_en ?? "",
            og_image_url: data.og_image_url ?? "",
          });
          setGalleryImgs(parseImages(data.images));
        }
      })
      .catch(() => showToast("Error", "Failed to load destination", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Fetch all events for relation mapping ──────────────────────────────────
  async function loadEvents() {
    setEventsLoading(true);
    try {
      const all: Event[] = [];
      let p = 1;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const res = await fetch(`/api/events?page=${p}&limit=100`);
        const json = await res.json();
        const batch: Event[] = json?.data ?? [];
        all.push(...batch);
        const meta = json?.meta;
        if (!meta || p >= meta.total_pages) break;
        p++;
      }
      setAllEvents(all);
    } catch {
      showToast("Error", "Failed to load events", "error");
    } finally {
      setEventsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-resolve Wikipedia file page URLs to direct image URLs for preview
  useEffect(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) { setUrlResolved(""); return; }
    if (/wikipedia\.org\/wiki\/(Berkas|File):/i.test(trimmed)) {
      resolveWikipediaImageUrl(trimmed).then(setUrlResolved).catch(() => setUrlResolved(trimmed));
    } else {
      setUrlResolved(trimmed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlInput]);

  async function linkEvent(eventId: string) {
    setLinkingEvent(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination_id: id }),
      });
      if (res.ok) {
        setAllEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, destination_id: id } : e))
        );
        showToast("Linked", "Event linked to this destination", "success");
      } else {
        showToast("Error", "Failed to link event", "error");
      }
    } catch {
      showToast("Error", "Network error", "error");
    } finally {
      setLinkingEvent(null);
    }
  }

  async function unlinkEvent(eventId: string) {
    setLinkingEvent(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination_id: "" }),
      });
      if (res.ok) {
        setAllEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, destination_id: "" } : e))
        );
        showToast("Unlinked", "Event unlinked from this destination", "success");
      } else {
        showToast("Error", "Failed to unlink event", "error");
      }
    } catch {
      showToast("Error", "Network error", "error");
    } finally {
      setLinkingEvent(null);
    }
  }

  const linkedEvents = allEvents.filter((e) => e.destination_id === id);
  const unlinkedEvents = allEvents.filter((e) => {
    if (e.destination_id === id) return false;
    if (!eventSearch) return true;
    const q = eventSearch.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      (e.location ?? "").toLowerCase().includes(q) ||
      (e.category ?? "").toLowerCase().includes(q)
    );
  });

  async function save() {
    setSaving(true);
    try {
      const images = galleryImgs.map((url) => ({ url, credit: "Admin" }));
      const res = await fetch(`/api/destinations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images }),
      });
      if (res.ok) {
        showToast("Saved", "Destination updated successfully", "success");
      } else {
        showToast("Error", "Save failed", "error");
      }
    } catch {
      showToast("Error", "Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/destinations/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Deleted", "Destination deleted successfully", "success");
        router.push("/destinations");
      } else {
        showToast("Error", "Delete failed", "error");
      }
    } catch {
      showToast("Error", "Network error", "error");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function generateAI() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationName: form.name, category: form.category, region: form.sub_region }),
      });
      const data = await res.json();
      if (data.description) { setField("description", data.description); showToast("AI", "Description generated", "success"); }
      if (data.seoTitle) setField("seo_title", data.seoTitle);
      if (data.seoDescription) setField("seo_description", data.seoDescription);
      if (data.seoKeywords) setField("seo_keywords", data.seoKeywords);
      if (data.descriptionEn) setField("description_en", data.descriptionEn);
      if (data.seoTitleEn) setField("seo_title_en", data.seoTitleEn);
      if (data.seoDescriptionEn) setField("seo_description_en", data.seoDescriptionEn);
      if (data.seoKeywordsEn) setField("seo_keywords_en", data.seoKeywordsEn);
    } catch {
      showToast("AI Error", "Generation failed", "error");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    showToast("Uploading", `Uploading ${files.length} image${files.length > 1 ? "s" : ""}…`, "info");

    const uploaded: string[] = [];
    for (const file of files) {
      try {
        const url = await uploadToCloudinary(file);
        uploaded.push(url);
      } catch (err) {
        showToast("Upload failed", err instanceof Error ? err.message : "Unknown error", "error");
      }
    }

    if (uploaded.length) {
      setGalleryImgs((prev) => [...prev, ...uploaded]);
      showToast("Uploaded", `${uploaded.length} image${uploaded.length > 1 ? "s" : ""} added`, "success");
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /** Convert a Wikipedia file page URL to the direct Wikimedia image URL via the API. */
  async function resolveWikipediaImageUrl(url: string): Promise<string> {
    // Matches both /wiki/Berkas:... (id) and /wiki/File:... (en) on any *.wikipedia.org
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

  async function addImageByUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch { showToast("Invalid URL", "Please enter a valid image URL", "error"); return; }

    // Resolve Wikipedia file pages to direct image URLs
    let resolved = trimmed;
    if (/wikipedia\.org\/wiki\/(Berkas|File):/i.test(trimmed)) {
      try {
        resolved = await resolveWikipediaImageUrl(trimmed);
      } catch {
        // fall through with original URL
      }
    }

    if (galleryImgs.includes(resolved)) { showToast("Duplicate", "This image is already in the gallery", "info"); return; }
    setGalleryImgs((prev) => [...prev, resolved]);
    setUrlInput("");
    setUrlPreviewError(false);
    setUrlResolved("");
    showToast("Added", "Image added from URL", "success");
  }

  function removeImage(index: number) {
    setGalleryImgs((prev) => prev.filter((_, i) => i !== index));
    showToast("Removed", "Image removed", "info");
  }

  function setCover(index: number) {
    if (index === 0) return;
    setGalleryImgs((prev) => {
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
    showToast("Cover set", "Image moved to cover position", "success");
  }

  const facs: string[] = dest
    ? Array.isArray(dest.facilities)
      ? (dest.facilities as string[])
      : JSON.parse((dest.facilities as string) || "[]")
    : [];

  const score = Math.round((dest?.rating ?? 0) * 20);
  const TABS: Tab[] = ["overview", "gallery", "facilities", "seo", "events"];
  const tabLabel = (t: Tab) => {
    if (t === "seo") return "SEO & AI";
    if (t === "events") return `Events (${linkedEvents.length})`;
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  if (loading) {
    return (
      <>
        <Header activeId="destinations" />
        <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-semibold text-sm">Loading destination…</span>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header activeId="destinations" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/destinations" className="p-2.5 rounded-xl border border-border hover:bg-bg text-gray-500 transition-premium">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-bold text-primary font-display uppercase tracking-widest bg-primary/5 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Destination detail CMS
              </span>
              <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">{form.name || "Destination"}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left */}
          <div className="lg:col-span-3 space-y-6">

            {/* Tabs */}
            <div className="border-b border-border flex items-center gap-2 overflow-x-auto pb-px">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`py-3 px-4 text-xs font-bold font-display border-b-2 transition-premium cursor-pointer whitespace-nowrap ${
                    tab === t ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-text"
                  }`}>
                  {tabLabel(t)}
                  {t === "gallery" && galleryImgs.length > 0 && (
                    <span className="ml-1.5 bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {galleryImgs.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Overview */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-800 font-display">General Information</h4>
                    <div className="flex items-center bg-bg rounded-lg border border-border p-0.5">
                      <button onClick={() => setLang("id")}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${lang === "id" ? "bg-primary text-white" : "text-gray-500 hover:text-gray-700"}`}>
                        ID
                      </button>
                      <button onClick={() => setLang("en")}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${lang === "en" ? "bg-primary text-white" : "text-gray-500 hover:text-gray-700"}`}>
                        EN
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FieldInput label={lang === "id" ? "Nama Destinasi" : "Destination Name"} value={lang === "id" ? form.name : form.name_en} onChange={(v) => setField(lang === "id" ? "name" : "name_en", v)} />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Category</label>
                        <select value={form.category} onChange={(e) => setField("category", e.target.value)}
                          className="w-full bg-bg focus:bg-white text-xs px-3.5 py-3.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700">
                          <option value="">— Select —</option>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Region</label>
                        <select value={form.sub_region} onChange={(e) => setField("sub_region", e.target.value)}
                          className="w-full bg-bg focus:bg-white text-xs px-3.5 py-3.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700">
                          <option value="">— Select —</option>
                          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FieldInput label={lang === "id" ? "Tagline" : "Tagline (EN)"} value={lang === "id" ? form.tagline : form.tagline_en} onChange={(v) => setField(lang === "id" ? "tagline" : "tagline_en", v)} />
                    <FieldInput label="Location / Address" value={form.location} onChange={(v) => setField("location", v)} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                        {lang === "id" ? "Deskripsi Editorial" : "Editorial Description (EN)"}
                      </label>
                      <button onClick={generateAI} disabled={aiLoading}
                        className="flex items-center gap-1.5 text-primary hover:text-primary-dark text-xs font-bold cursor-pointer disabled:opacity-60 transition">
                        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {aiLoading ? "Generating…" : "AI Generate"}
                      </button>
                    </div>
                    <textarea value={lang === "id" ? form.description : form.description_en} onChange={(e) => setField(lang === "id" ? "description" : "description_en", e.target.value)} rows={6}
                      className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium leading-relaxed" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                      {lang === "id" ? "Cerita / Editorial" : "Story / Editorial (EN)"}
                    </label>
                    <textarea value={lang === "id" ? form.story : form.story_en} onChange={(e) => setField(lang === "id" ? "story" : "story_en", e.target.value)} rows={4}
                      className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium leading-relaxed" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
                  <h4 className="text-sm font-bold text-gray-800 font-display">Practical Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FieldInput label="Ticket Price" value={form.ticket_price} onChange={(v) => setField("ticket_price", v)} />
                    <FieldInput label="Opening Hours" value={form.opening_hours} onChange={(v) => setField("opening_hours", v)} />
                    <FieldInput label={lang === "id" ? "Waktu Terbaik" : "Best Time to Visit (EN)"} value={lang === "id" ? form.best_time : form.best_time_en} onChange={(v) => setField(lang === "id" ? "best_time" : "best_time_en", v)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FieldInput label="Latitude" value={form.latitude} onChange={(v) => setField("latitude", v)} mono />
                    <FieldInput label="Longitude" value={form.longitude} onChange={(v) => setField("longitude", v)} mono />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Video URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={form.video_url}
                          onChange={(e) => setField("video_url", e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(form.name + " Yogyakarta")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap"
                          title="Search YouTube for this destination"
                        >
                          <Search className="w-3.5 h-3.5" />
                          Find Video
                        </a>
                      </div>
                    </div>
                    {form.video_url && (
                      <div className="relative rounded-xl overflow-hidden aspect-video border border-border">
                        {form.video_url.includes("youtube.com") || form.video_url.includes("youtu.be") ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${extractYouTubeId(form.video_url)}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : form.video_url.includes("vimeo.com") ? (
                          <iframe
                            src={`https://player.vimeo.com/video/${form.video_url.split("vimeo.com/")[1]?.split("?")[0]}`}
                            className="w-full h-full"
                            allow="autoplay; fullscreen"
                            allowFullScreen
                          />
                        ) : (
                          <video src={form.video_url} controls className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Gallery */}
            {tab === "gallery" && (
              <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-800 font-display">Gallery & Visual Assets</h4>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {galleryImgs.length} image{galleryImgs.length !== 1 ? "s" : ""} · Save Changes to persist
                  </span>
                </div>

                {/* Hidden native file picker */}
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryImgs.map((img, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden aspect-square group border border-border">
                      <Image src={img} alt={`gallery-${i}`} fill unoptimized className="object-cover" sizes="200px" />

                      {/* Cover badge */}
                      {i === 0 && (
                        <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 shadow">
                          Cover
                        </span>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
                        {i !== 0 && (
                          <button
                            onClick={() => setCover(i)}
                            className="flex items-center gap-1.5 bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-primary-dark transition shadow"
                            title="Set as cover"
                          >
                            ★ Set Cover
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(i)}
                          className="flex items-center gap-1.5 bg-danger text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition shadow"
                          title="Remove image"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Upload tile */}
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center aspect-square hover:bg-bg hover:border-primary/30 cursor-pointer transition-premium p-4 disabled:opacity-60 disabled:cursor-not-allowed">
                    {uploading
                      ? <><Loader2 className="w-7 h-7 text-primary animate-spin mb-2" /><span className="text-[10px] font-bold text-primary font-display">Uploading…</span></>
                      : <><ImagePlus className="w-7 h-7 text-gray-400 mb-2" /><span className="text-[10px] font-bold text-gray-500 font-display text-center">Add Visual Asset</span><span className="text-[9px] text-gray-400 mt-1">PNG · JPG · WebP</span></>
                    }
                  </button>
                </div>

                {galleryImgs.length === 0 && !uploading && (
                  <p className="text-xs text-gray-400 text-center py-2">No images yet — click &ldquo;Add Visual Asset&rdquo; to upload.</p>
                )}

                {/* Find Images / Add by URL */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">Add Image from URL</label>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://unsplash.com/s/photos/${encodeURIComponent(form.name + " Yogyakarta")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
                        title="Search Unsplash for this destination"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Unsplash
                      </a>
                      <a
                        href={`https://www.pexels.com/search/${encodeURIComponent(form.name + " Yogyakarta")}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
                        title="Search Pexels for this destination"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Pexels
                      </a>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(form.name + " Yogyakarta")}&tbm=isch`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                        title="Search Google Images for this destination"
                      >
                        <Search className="w-3 h-3" />
                        Find Images
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-bg rounded-xl border border-transparent focus-within:border-border px-3 py-2">
                      <LinkIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => { setUrlInput(e.target.value); setUrlPreviewError(false); setUrlResolved(""); }}
                        onKeyDown={(e) => e.key === "Enter" && addImageByUrl()}
                        placeholder="Paste image URL here…"
                        className="flex-1 bg-transparent text-xs outline-none font-mono text-gray-700 placeholder:text-gray-400"
                      />
                      {urlInput && (
                        <button
                          onClick={() => { setUrlInput(""); setUrlPreviewError(false); setUrlResolved(""); }}
                          className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                        >✕</button>
                      )}
                    </div>
                    <button
                      onClick={addImageByUrl}
                      disabled={!urlInput.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-premium cursor-pointer whitespace-nowrap"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      Add Image
                    </button>
                  </div>

                  {/* URL preview */}
                  {urlInput.trim() && !urlPreviewError && (
                    <div className="flex items-start gap-3 p-3 bg-bg rounded-xl border border-border">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-border shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={urlResolved || urlInput.trim()}
                          alt="preview"
                          className="w-full h-full object-cover"
                          onError={() => setUrlPreviewError(true)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Preview</p>
                        <p className="text-[11px] text-gray-600 truncate font-mono">{urlResolved || urlInput.trim()}</p>
                        {urlResolved && urlResolved !== urlInput.trim() && (
                          <p className="text-[10px] text-green-600 font-semibold mt-0.5">✓ Wikipedia URL resolved to direct image</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">Press Enter or click &ldquo;Add Image&rdquo; to add to gallery</p>
                      </div>
                    </div>
                  )}
                  {urlInput.trim() && urlPreviewError && (
                    <p className="text-[11px] text-danger font-semibold">Could not load image preview — check the URL is a direct image link.</p>
                  )}
                </div>
              </div>
            )}

            {/* Facilities */}
            {tab === "facilities" && (
              <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
                <h4 className="text-sm font-bold text-gray-800 font-display">Physical Facilities & Amenities</h4>
                {facs.length === 0
                  ? <p className="text-xs text-gray-400">No facilities data available.</p>
                  : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {facs.map((f) => (
                        <label key={f} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-bg cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary w-4 h-4" />
                          <span className="text-xs font-semibold text-gray-700">{f}</span>
                        </label>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {/* SEO */}
            {tab === "seo" && (
              <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-800 font-display">SEO & AI Translation</h4>
                  <button onClick={generateAI} disabled={aiLoading}
                    className="flex items-center gap-1.5 text-primary text-xs font-bold cursor-pointer disabled:opacity-60">
                    <Sparkles className="w-4 h-4" />Generate SEO Tags
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldInput label="Meta Title (ID)" value={form.seo_title} onChange={(v) => setField("seo_title", v)} />
                  <FieldInput label="Meta Title (EN)" value={form.seo_title_en} onChange={(v) => setField("seo_title_en", v)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldInput label="Meta Keywords (ID)" value={form.seo_keywords} onChange={(v) => setField("seo_keywords", v)} />
                  <FieldInput label="Meta Keywords (EN)" value={form.seo_keywords_en} onChange={(v) => setField("seo_keywords_en", v)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Meta Description (ID)</label>
                    <textarea value={form.seo_description} onChange={(e) => setField("seo_description", e.target.value)} rows={3}
                      className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Meta Description (EN)</label>
                    <textarea value={form.seo_description_en} onChange={(e) => setField("seo_description_en", e.target.value)} rows={3}
                      className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">OG Image URL</label>
                  <input type="text" value={form.og_image_url} onChange={(e) => setField("og_image_url", e.target.value)}
                    placeholder="Leave empty to use first gallery image"
                    className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                  {form.og_image_url && (
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-border mt-2">
                      <img src={form.og_image_url} alt="OG Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400">Used for social media sharing (Facebook, Twitter, WhatsApp). Leave empty to use the first gallery image.</p>
                </div>
              </div>
            )}

            {/* Events */}
            {tab === "events" && (
              <div className="space-y-6">
                {/* Linked Events */}
                <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-800 font-display">
                      Linked Events ({linkedEvents.length})
                    </h4>
                  </div>
                  {eventsLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs font-semibold">Loading events…</span>
                    </div>
                  ) : linkedEvents.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4">No events linked to this destination yet.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {linkedEvents.map((ev) => (
                        <div key={ev.id} className="flex items-center gap-3 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {ev.image_url ? (
                              <img src={ev.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link href={`/events/${ev.id}`} className="text-xs font-bold text-gray-800 hover:text-primary truncate block">
                              {ev.title}
                            </Link>
                            <span className="text-[10px] text-gray-400 truncate block">
                              {ev.location || "-"} {ev.start_date ? `· ${ev.start_date}` : ""}
                            </span>
                          </div>
                          <button
                            onClick={() => unlinkEvent(ev.id)}
                            disabled={linkingEvent === ev.id}
                            className="p-1.5 rounded-lg border border-border hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition cursor-pointer disabled:opacity-50 flex-shrink-0"
                            title="Unlink event"
                          >
                            {linkingEvent === ev.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Unlink className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Events */}
                <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-800 font-display">
                      Available Events ({unlinkedEvents.length})
                    </h4>
                    <div className="relative">
                      <Search className="absolute inset-y-0 left-2.5 my-auto w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <input
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        placeholder="Search events…"
                        className="w-48 bg-bg focus:bg-white text-[11px] pl-8 pr-3 py-1.5 rounded-lg border border-transparent focus:border-border outline-none font-medium"
                      />
                    </div>
                  </div>
                  {eventsLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs font-semibold">Loading events…</span>
                    </div>
                  ) : unlinkedEvents.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4">All events are already linked.</p>
                  ) : (
                    <div className="divide-y divide-border max-h-96 overflow-y-auto">
                      {unlinkedEvents.map((ev) => (
                        <div key={ev.id} className="flex items-center gap-3 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {ev.image_url ? (
                              <img src={ev.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-gray-800 truncate block">{ev.title}</span>
                            <span className="text-[10px] text-gray-400 truncate block">
                              {ev.location || "-"} {ev.start_date ? `· ${ev.start_date}` : ""}
                            </span>
                          </div>
                          <button
                            onClick={() => linkEvent(ev.id)}
                            disabled={linkingEvent === ev.id}
                            className="p-1.5 rounded-lg border border-border hover:bg-primary/5 hover:border-primary/20 text-gray-400 hover:text-primary transition cursor-pointer disabled:opacity-50 flex-shrink-0"
                            title="Link event to this destination"
                          >
                            {linkingEvent === ev.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Link2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <button onClick={save} disabled={saving}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-bold shadow-premium transition-premium cursor-pointer flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>

            <button onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-white hover:bg-red-50 border border-red-200 text-red-600 py-3 rounded-xl text-xs font-bold transition-premium cursor-pointer flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Destination
            </button>

            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Status</h4>
              {["Published", "Draft"].map((s) => (
                <label key={s} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${s === "Published" ? "border-primary/20 bg-primary/5" : "border-border hover:bg-bg"}`}>
                  <span className={`text-xs font-bold ${s === "Published" ? "text-primary" : "text-gray-800"}`}>{s}</span>
                  <input type="radio" name="pub-status" defaultChecked={s === "Published"} value={s} className="text-primary focus:ring-primary w-4 h-4" />
                </label>
              ))}
            </div>

            {galleryImgs.length > 0 && (
              <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Cover Image</h4>
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-border">
                  <Image src={galleryImgs[0]} alt="cover" fill unoptimized className="object-cover" sizes="300px" />
                </div>
                <p className="text-[10px] text-gray-400">First gallery image is used as cover.</p>
              </div>
            )}

            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">AI Quality Score</h4>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-mono font-extrabold text-xl ${score >= 80 ? "border-success text-success" : score >= 60 ? "border-warning text-warning" : "border-danger text-danger"}`}>
                  {score}
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block">{score >= 80 ? "EXCELLENT" : score >= 60 ? "GOOD" : "NEEDS WORK"}</span>
                  <span className="text-[10px] text-gray-400">Rating: {(dest?.rating ?? 0).toFixed(1)}/5.0</span>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Reviews</span>
                <span className="text-lg font-bold text-gray-800 font-display">{dest?.review_count ?? 0} reviews</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Coordinates</h4>
              <div className="space-y-2 font-mono text-xs text-gray-600">
                <div className="flex justify-between"><span>Lat</span><span>{form.latitude || "N/A"}</span></div>
                <div className="flex justify-between"><span>Lng</span><span>{form.longitude || "N/A"}</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Delete Destination?</h3>
                <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone. All data will be permanently removed.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-gray-700 hover:bg-bg transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2">
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
