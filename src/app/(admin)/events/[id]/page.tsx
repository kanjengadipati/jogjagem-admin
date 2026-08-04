"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import OgImageUploader from "@/components/OgImageUploader";
import { parseImages } from "@/lib/images";
import {
  ArrowLeft, ImagePlus, Trash2, Loader2, Search,
  ExternalLink, Link as LinkIcon, Link2, Unlink, MapPin, Sparkles,
} from "lucide-react";
import type { Event, Destination } from "@/types";

const CLOUDINARY_CLOUD = "wdsepioa";
const CLOUDINARY_API_KEY = "738718397121653";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

const EVENT_CATEGORIES = ["Festival","Cultural","Music","Food","Sport","Art","Exhibition","Workshop","Tour","Other"];

function normalizeEventCategory(val: string): string {
  if (!val) return "";
  const lower = val.toLowerCase();
  const found = EVENT_CATEGORIES.find((c) => c.toLowerCase() === lower);
  return found ?? val;
}
const EVENT_STATUSES   = ["upcoming","active","popular","limited","completed","cancelled"];

type Tab = "overview" | "gallery" | "seo" | "destination";

type FormState = {
  title: string; title_en: string; description: string; description_en: string; location: string;
  start_date: string; end_date: string; category: string; status: string;
  ticket_price: string; organizer: string; video_url: string;
  max_attendees: string; latitude: string; longitude: string;
  seo_title: string; seo_title_en: string; seo_keywords: string; seo_keywords_en: string; seo_description: string; seo_description_en: string; og_image_url: string;
};

const EMPTY_FORM: FormState = {
  title: "", title_en: "", description: "", description_en: "", location: "", start_date: "", end_date: "",
  category: "", status: "upcoming", ticket_price: "", organizer: "",
  video_url: "", max_attendees: "", latitude: "", longitude: "",
  seo_title: "", seo_title_en: "", seo_keywords: "", seo_keywords_en: "", seo_description: "", seo_description_en: "", og_image_url: "",
};

function extractYouTubeId(url: string): string {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? "";
}

function FieldInput({ label, value, onChange, mono = false }: {
  label: string; value: string; onChange: (v: string) => void; mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium${mono ? " font-mono" : ""}`} />
    </div>
  );
}

async function uploadToCloudinary(file: File): Promise<string> {
  const sigRes = await fetch("/api/upload", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: "explore-jogja/events" }),
  });
  const { signature, timestamp, folder } = await sigRes.json();
  const fd = new FormData();
  fd.append("file", file); fd.append("api_key", CLOUDINARY_API_KEY);
  fd.append("timestamp", String(timestamp)); fd.append("folder", folder); fd.append("signature", signature);
  const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Upload failed");
  return data.secure_url as string;
}

async function resolveWikipediaImageUrl(url: string): Promise<string> {
  const m = url.match(/^https?:\/\/([a-z]+)\.wikipedia\.org\/wiki\/(Berkas|File):(.+)$/i);
  if (!m) return url;
  const apiUrl = `https://${m[1]}.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(decodeURIComponent(m[3]))}&prop=imageinfo&iiprop=url&format=json&origin=*`;
  const res = await fetch(apiUrl);
  if (!res.ok) return url;
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0] as { imageinfo?: { url: string }[] };
  return page?.imageinfo?.[0]?.url ?? url;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [event, setEvent]         = useState<Event | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab]             = useState<Tab>("overview");
  const [lang, setLang]           = useState<"id" | "en">("id");
  const [form, setForm]           = useState<FormState>(EMPTY_FORM);
  const [galleryImgs, setGalleryImgs] = useState<string[]>([]);
  const [urlInput, setUrlInput]   = useState("");
  const [urlPreviewError, setUrlPreviewError] = useState(false);
  const [urlResolved, setUrlResolved] = useState("");

  // Destination linking
  const [allDests, setAllDests]         = useState<Destination[]>([]);
  const [destsLoading, setDestsLoading] = useState(false);
  const [linkingDest, setLinkingDest]   = useState(false);
  const [destSearch, setDestSearch]     = useState("");
  const [linkedDestId, setLinkedDestId] = useState<string>("");

  function setField(key: keyof FormState, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  // Auto-resolve Wikipedia URLs for preview
  useEffect(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) { setUrlResolved(""); return; }
    if (/wikipedia\.org\/wiki\/(Berkas|File):/i.test(trimmed)) {
      resolveWikipediaImageUrl(trimmed).then(setUrlResolved).catch(() => setUrlResolved(trimmed));
    } else { setUrlResolved(trimmed); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlInput]);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const data: Event = d?.data ?? null;
        setEvent(data);
        if (data) {
          const cat = normalizeEventCategory(data.category ?? "");
          setForm({
            title: data.title ?? "", title_en: data.title_en ?? "",
            description: data.description ?? "", description_en: data.description_en ?? "",
            location: data.location ?? "", start_date: data.start_date ?? "",
            end_date: data.end_date ?? "", category: cat,
            status: data.status ?? "upcoming", ticket_price: data.ticket_price ?? "",
            organizer: data.organizer ?? "", video_url: data.video_url ?? "",
            max_attendees: String(data.max_attendees ?? ""),
            latitude: "", longitude: "",
            seo_title: data.seo_title ?? "", seo_title_en: data.seo_title_en ?? "",
            seo_keywords: data.seo_keywords ?? "", seo_keywords_en: data.seo_keywords_en ?? "",
            seo_description: data.seo_description ?? "", seo_description_en: data.seo_description_en ?? "",
            og_image_url: data.og_image_url ?? "",
          });
          setLinkedDestId(data.destination_id ?? "");
          const imgs = parseImages(data.images as never);
          if (imgs.length > 0) setGalleryImgs(imgs);
          else if (data.image_url) setGalleryImgs([data.image_url]);
        }
      })
      .catch(() => showToast("Error", "Failed to load event", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Load all destinations for linking
  async function loadDests() {
    setDestsLoading(true);
    try {
      const all: Destination[] = [];
      let p = 1;
      while (true) {
        const res = await fetch(`/api/destinations?page=${p}&limit=100`);
        const json = await res.json();
        const batch: Destination[] = json?.data ?? [];
        all.push(...batch);
        const meta = json?.meta;
        if (!meta || p >= meta.total_pages) break;
        p++;
      }
      setAllDests(all);
    } catch { showToast("Error", "Failed to load destinations", "error"); }
    finally { setDestsLoading(false); }
  }

  useEffect(() => { loadDests(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function linkDest(destId: string) {
    setLinkingDest(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination_id: destId }),
      });
      if (res.ok) { setLinkedDestId(destId); showToast("Linked", "Destination linked to this event", "success"); }
      else showToast("Error", "Failed to link destination", "error");
    } catch { showToast("Error", "Network error", "error"); }
    finally { setLinkingDest(false); }
  }

  async function unlinkDest() {
    setLinkingDest(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination_id: "" }),
      });
      if (res.ok) { setLinkedDestId(""); showToast("Unlinked", "Destination unlinked from this event", "success"); }
      else showToast("Error", "Failed to unlink destination", "error");
    } catch { showToast("Error", "Network error", "error"); }
    finally { setLinkingDest(false); }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    showToast("Uploading", `Uploading ${files.length} image${files.length > 1 ? "s" : ""}…`, "info");
    const uploaded: string[] = [];
    for (const file of files) {
      try { uploaded.push(await uploadToCloudinary(file)); }
      catch (err) { showToast("Upload failed", err instanceof Error ? err.message : "Unknown error", "error"); }
    }
    if (uploaded.length) {
      setGalleryImgs((prev) => [...prev, ...uploaded]);
      showToast("Uploaded", `${uploaded.length} image${uploaded.length > 1 ? "s" : ""} added`, "success");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function addImageByUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch { showToast("Invalid URL", "Please enter a valid image URL", "error"); return; }
    let resolved = trimmed;
    if (/wikipedia\.org\/wiki\/(Berkas|File):/i.test(trimmed)) {
      try { resolved = await resolveWikipediaImageUrl(trimmed); } catch { /* fall through */ }
    }
    if (galleryImgs.includes(resolved)) { showToast("Duplicate", "Already in gallery", "info"); return; }
    setGalleryImgs((prev) => [...prev, resolved]);
    setUrlInput(""); setUrlPreviewError(false); setUrlResolved("");
    showToast("Added", "Image added from URL", "success");
  }

  function removeImage(i: number) {
    setGalleryImgs((prev) => prev.filter((_, idx) => idx !== i));
    showToast("Removed", "Image removed", "info");
  }
  function setCover(i: number) {
    if (i === 0) return;
    setGalleryImgs((prev) => { const n = [...prev]; const [p] = n.splice(i, 1); n.unshift(p); return n; });
    showToast("Cover set", "Image moved to cover position", "success");
  }

  async function save() {
    setSaving(true);
    try {
      const images = galleryImgs.map((url) => ({ url, credit: "Admin" }));
      const payload = {
        ...form,
        images,
        image_url: galleryImgs[0] ?? "",
        max_attendees: Number(form.max_attendees) || 0,
        destination_id: linkedDestId,
      };
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { showToast("Saved", "Event updated successfully", "success"); }
      else showToast("Error", "Save failed", "error");
    } catch { showToast("Error", "Network error", "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Deleted", "Event deleted successfully", "success");
        router.push("/events");
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
    if (!form.title) { showToast("Required", "Enter a title first", "warning"); return; }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventTitle: form.title,
          category: form.category,
          location: form.location,
        }),
      });
      const data = await res.json();
      if (data.title) setField("title", data.title);
      if (data.title_en) setField("title_en", data.title_en);
      if (data.description) setField("description", data.description);
      if (data.description_en) setField("description_en", data.description_en);
      if (data.organizer) setField("organizer", data.organizer);
      if (data.ticket_price) setField("ticket_price", data.ticket_price);
      if (data.start_date) setField("start_date", data.start_date);
      if (data.end_date) setField("end_date", data.end_date);
      if (data.max_attendees) setField("max_attendees", data.max_attendees);
      if (data.latitude) setField("latitude", data.latitude);
      if (data.longitude) setField("longitude", data.longitude);
      if (data.seo_title) setField("seo_title", data.seo_title);
      if (data.seo_title_en) setField("seo_title_en", data.seo_title_en);
      if (data.seo_description) setField("seo_description", data.seo_description);
      if (data.seo_description_en) setField("seo_description_en", data.seo_description_en);
      if (data.seo_keywords) setField("seo_keywords", data.seo_keywords);
      if (data.seo_keywords_en) setField("seo_keywords_en", data.seo_keywords_en);

      showToast("AI", "Event content generated", "success");
    } catch {
      showToast("AI Error", "Generation failed", "error");
    } finally {
      setAiLoading(false);
    }
  }

  const linkedDest = allDests.find((d) => d.id === linkedDestId) ?? null;
  const filteredDests = allDests.filter((d) => {
    if (d.id === linkedDestId) return false;
    if (!destSearch) return true;
    const q = destSearch.toLowerCase();
    return d.name.toLowerCase().includes(q) || (d.location ?? "").toLowerCase().includes(q);
  });

  const TABS: Tab[] = ["overview", "gallery", "seo", "destination"];
  const tabLabel = (t: Tab) => {
    if (t === "destination") return linkedDestId ? "Destination (1)" : "Destination";
    if (t === "seo") return "SEO";
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  if (loading) {
    return (
      <>
        <Header activeId="events" />
        <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-semibold text-sm">Loading event…</span>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header activeId="events" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/events" className="p-2.5 rounded-xl border border-border hover:bg-bg text-gray-500 transition-premium">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-bold text-primary font-display uppercase tracking-widest bg-primary/5 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Event detail CMS
              </span>
              <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">{form.title || "Event"}</h2>
            </div>
          </div>
          <button type="button" onClick={generateAI} disabled={aiLoading} className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition-premium cursor-pointer">
            <Sparkles className="w-4 h-4" />{aiLoading ? "Generating..." : "AI Generate"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left — tabs + content */}
          <div className="lg:col-span-3 space-y-6">

            {/* Tab bar */}
            <div className="border-b border-border flex items-center gap-2 overflow-x-auto pb-px">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`py-3 px-4 text-xs font-bold font-display border-b-2 transition-premium cursor-pointer whitespace-nowrap ${
                    tab === t ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-text"
                  }`}>
                  {tabLabel(t)}
                  {t === "gallery" && galleryImgs.length > 0 && (
                    <span className="ml-1.5 bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">{galleryImgs.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
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
                  <FieldInput label={lang === "id" ? "Title" : "Title (EN)"} value={lang === "id" ? form.title : form.title_en} onChange={(v) => setField(lang === "id" ? "title" : "title_en", v)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Category</label>
                      <select value={form.category} onChange={(e) => setField("category", e.target.value)}
                        className="w-full bg-bg focus:bg-white text-xs px-3.5 py-3.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700">
                        <option value="">— Select —</option>
                        {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        {form.category && !EVENT_CATEGORIES.includes(form.category) && (
                          <option value={form.category}>{form.category} (Raw)</option>
                        )}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Status</label>
                      <select value={form.status} onChange={(e) => setField("status", e.target.value)}
                        className="w-full bg-bg focus:bg-white text-xs px-3.5 py-3.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700">
                        {EVENT_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <FieldInput label="Location / Venue" value={form.location} onChange={(v) => setField("location", v)} />
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                      {lang === "id" ? "Description" : "Description (EN)"}
                    </label>
                  </div>
                  <textarea value={lang === "id" ? form.description : form.description_en} onChange={(e) => setField(lang === "id" ? "description" : "description_en", e.target.value)} rows={5}
                    className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium leading-relaxed" />

                  </div>
                </div>

                <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
                  <h4 className="text-sm font-bold text-gray-800 font-display">Practical Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FieldInput label="Start Date" value={form.start_date} onChange={(v) => setField("start_date", v)} />
                    <FieldInput label="End Date"   value={form.end_date}   onChange={(v) => setField("end_date", v)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FieldInput label="Ticket Price"   value={form.ticket_price}   onChange={(v) => setField("ticket_price", v)} />
                    <FieldInput label="Organizer"      value={form.organizer}      onChange={(v) => setField("organizer", v)} />
                    <FieldInput label="Max Attendees"  value={form.max_attendees}  onChange={(v) => setField("max_attendees", v)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FieldInput label="Latitude"  value={form.latitude}  onChange={(v) => setField("latitude", v)}  mono />
                    <FieldInput label="Longitude" value={form.longitude} onChange={(v) => setField("longitude", v)} mono />
                  </div>
                  {/* Video URL */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Video URL</label>
                    <div className="flex gap-2">
                      <input type="url" value={form.video_url} onChange={(e) => setField("video_url", e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                      <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(form.title + " " + form.location)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap">
                        <Search className="w-3.5 h-3.5" /> Find Video
                      </a>
                    </div>
                  </div>
                  {form.video_url && (
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-border">
                      {form.video_url.includes("youtube.com") || form.video_url.includes("youtu.be") ? (
                        <iframe src={`https://www.youtube.com/embed/${extractYouTubeId(form.video_url)}`}
                          className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      ) : form.video_url.includes("vimeo.com") ? (
                        <iframe src={`https://player.vimeo.com/video/${form.video_url.split("vimeo.com/")[1]?.split("?")[0]}`}
                          className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
                      ) : (
                        <video src={form.video_url} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── GALLERY ── */}
            {tab === "gallery" && (
              <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-800 font-display">Gallery & Visual Assets</h4>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {galleryImgs.length} image{galleryImgs.length !== 1 ? "s" : ""} · Save Changes to persist
                  </span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryImgs.map((img, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden aspect-square group border border-border">
                      <Image src={img} alt={`gallery-${i}`} fill unoptimized className="object-cover" sizes="200px" />
                      {i === 0 && (
                        <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 shadow">Cover</span>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
                        {i !== 0 && (
                          <button onClick={() => setCover(i)}
                            className="flex items-center gap-1.5 bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-primary-dark transition shadow">
                            ★ Set Cover
                          </button>
                        )}
                        <button onClick={() => removeImage(i)}
                          className="flex items-center gap-1.5 bg-danger text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition shadow">
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
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
                {/* Add by URL */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">Add Image from URL</label>
                    <div className="flex items-center gap-2">
                      <a href={`https://unsplash.com/s/photos/${encodeURIComponent(form.title + " Yogyakarta")}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                        <ExternalLink className="w-3 h-3" /> Unsplash
                      </a>
                      <a href={`https://www.pexels.com/search/${encodeURIComponent(form.title + " Yogyakarta")}/`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                        <ExternalLink className="w-3 h-3" /> Pexels
                      </a>
                      <a href={`https://www.google.com/search?q=${encodeURIComponent(form.title + " Yogyakarta")}&tbm=isch`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">
                        <Search className="w-3 h-3" /> Find Images
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-bg rounded-xl border border-transparent focus-within:border-border px-3 py-2">
                      <LinkIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <input type="url" value={urlInput}
                        onChange={(e) => { setUrlInput(e.target.value); setUrlPreviewError(false); setUrlResolved(""); }}
                        onKeyDown={(e) => e.key === "Enter" && addImageByUrl()}
                        placeholder="Paste image URL here…"
                        className="flex-1 bg-transparent text-xs outline-none font-mono text-gray-700 placeholder:text-gray-400" />
                      {urlInput && (
                        <button onClick={() => { setUrlInput(""); setUrlPreviewError(false); setUrlResolved(""); }}
                          className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer">✕</button>
                      )}
                    </div>
                    <button onClick={addImageByUrl} disabled={!urlInput.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-premium cursor-pointer whitespace-nowrap">
                      <ImagePlus className="w-3.5 h-3.5" /> Add Image
                    </button>
                  </div>
                  {urlInput.trim() && !urlPreviewError && (
                    <div className="flex items-start gap-3 p-3 bg-bg rounded-xl border border-border">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-border shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={urlResolved || urlInput.trim()} alt="preview" className="w-full h-full object-cover" onError={() => setUrlPreviewError(true)} />
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

            {/* ── SEO ── */}
            {tab === "seo" && (
              <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
                <h4 className="text-sm font-bold text-gray-800 font-display">SEO</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldInput label="Meta Title"    value={form.seo_title}    onChange={(v) => setField("seo_title", v)} />
                  <FieldInput label="Meta Keywords" value={form.seo_keywords} onChange={(v) => setField("seo_keywords", v)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Meta Description</label>
                  <textarea value={form.seo_description} onChange={(e) => setField("seo_description", e.target.value)} rows={3}
                    className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                </div>
                <OgImageUploader value={form.og_image_url} onChange={(v) => setField("og_image_url", v)} />
              </div>
            )}

            {/* ── DESTINATION ── */}
            {tab === "destination" && (
              <div className="space-y-6">
                {/* Linked destination */}
                <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
                  <h4 className="text-sm font-bold text-gray-800 font-display">Linked Destination</h4>
                  {linkedDest ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {linkedDest.images && parseImages(linkedDest.images)[0] ? (
                          <Image src={parseImages(linkedDest.images)[0]} alt="" width={48} height={48} unoptimized className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/destinations/${linkedDest.id}`}
                          className="text-xs font-bold text-gray-800 hover:text-primary truncate block">{linkedDest.name}</Link>
                        <span className="text-[10px] text-gray-400 truncate block">{linkedDest.location || "-"}</span>
                        {linkedDest.category && (
                          <span className="inline-block mt-1 bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full">{linkedDest.category}</span>
                        )}
                      </div>
                      <button onClick={unlinkDest} disabled={linkingDest}
                        className="p-1.5 rounded-lg border border-border hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition cursor-pointer disabled:opacity-50 shrink-0">
                        {linkingDest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No destination linked yet. Search below to link one.</p>
                  )}
                </div>

                {/* Search & link */}
                <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-800 font-display">
                      Available Destinations ({filteredDests.length})
                    </h4>
                    <div className="relative">
                      <Search className="absolute inset-y-0 left-2.5 my-auto w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <input value={destSearch} onChange={(e) => setDestSearch(e.target.value)}
                        placeholder="Search destinations…"
                        className="w-48 bg-bg focus:bg-white text-[11px] pl-8 pr-3 py-1.5 rounded-lg border border-transparent focus:border-border outline-none font-medium" />
                    </div>
                  </div>
                  {destsLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs font-semibold">Loading destinations…</span>
                    </div>
                  ) : filteredDests.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4">No destinations found.</p>
                  ) : (
                    <div className="divide-y divide-border max-h-96 overflow-y-auto">
                      {filteredDests.map((dest) => (
                        <div key={dest.id} className="flex items-center gap-3 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {parseImages(dest.images)[0] ? (
                              <Image src={parseImages(dest.images)[0]} alt="" width={40} height={40} unoptimized className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-gray-800 truncate block">{dest.name}</span>
                            <span className="text-[10px] text-gray-400 truncate block">{dest.location || "-"}</span>
                          </div>
                          <button onClick={() => linkDest(dest.id)} disabled={linkingDest}
                            className="p-1.5 rounded-lg border border-border hover:bg-primary/5 hover:border-primary/20 text-gray-400 hover:text-primary transition cursor-pointer disabled:opacity-50 shrink-0">
                            {linkingDest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="space-y-6">
            <button onClick={save} disabled={saving}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-bold shadow-premium transition-premium cursor-pointer flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>

            <button onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-white hover:bg-red-50 border border-red-200 text-red-600 py-3 rounded-xl text-xs font-bold transition-premium cursor-pointer flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Event
            </button>

            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Status</h4>
              {EVENT_STATUSES.map((s) => (
                <label key={s} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${form.status === s ? "border-primary/20 bg-primary/5" : "border-border hover:bg-bg"}`}>
                  <span className={`text-xs font-bold capitalize ${form.status === s ? "text-primary" : "text-gray-800"}`}>{s}</span>
                  <input type="radio" name="event-status" checked={form.status === s} onChange={() => setField("status", s)} className="text-primary focus:ring-primary w-4 h-4" />
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

            {linkedDest && (
              <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Destination</h4>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-bold text-gray-800">{linkedDest.name}</span>
                </div>
                {linkedDest.location && <p className="text-[10px] text-gray-400">{linkedDest.location}</p>}
              </div>
            )}

            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Dates</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between"><span className="text-gray-400">Start</span><span className="font-semibold">{form.start_date || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">End</span><span className="font-semibold">{form.end_date || "—"}</span></div>
              </div>
            </div>

            {(form.latitude || form.longitude) && (
              <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Coordinates</h4>
                <div className="space-y-2 font-mono text-xs text-gray-600">
                  <div className="flex justify-between"><span>Lat</span><span>{form.latitude}</span></div>
                  <div className="flex justify-between"><span>Lng</span><span>{form.longitude}</span></div>
                </div>
              </div>
            )}
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
                <h3 className="text-sm font-bold text-gray-900">Delete Event?</h3>
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
