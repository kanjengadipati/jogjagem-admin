"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { parseImages } from "@/lib/images";
import { ArrowLeft, Sparkles, ImagePlus, Trash2, Loader2, Calendar, Link2, Unlink, Search } from "lucide-react";
import type { Destination, Event } from "@/types";

const CLOUDINARY_CLOUD = "wdsepioa";
// For signed upload without a preset, we use the API key directly:
const CLOUDINARY_API_KEY = "738718397121653";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

const CATEGORIES = ["Temple", "Beach", "Nature", "Heritage", "Cultural", "Culinary", "Shopping"];
const REGIONS = ["Sleman", "Bantul", "Yogyakarta", "Gunungkidul", "Kulon Progo"];

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? "";
}

type Tab = "overview" | "gallery" | "facilities" | "seo" | "events";

type FormState = {
  name: string;
  category: string;
  sub_region: string;
  tagline: string;
  location: string;
  description: string;
  story: string;
  ticket_price: string;
  opening_hours: string;
  best_time: string;
  latitude: string;
  longitude: string;
  video_url: string; // Add this
  seo_title: string;
  seo_keywords: string;
  seo_description: string;
  og_image_url: string;
};

const EMPTY_FORM: FormState = {
  name: "", category: "", sub_region: "", tagline: "", location: "",
  description: "", story: "", ticket_price: "", opening_hours: "", best_time: "",
  latitude: "", longitude: "", video_url: "", seo_title: "", seo_keywords: "", seo_description: "", og_image_url: "",
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
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dest, setDest] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [galleryImgs, setGalleryImgs] = useState<string[]>([]);
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
            category: data.category ?? "",
            sub_region: data.sub_region ?? "",
            tagline: data.tagline ?? "",
            location: data.location ?? "",
            description: data.description ?? "",
            story: data.story ?? "",
            ticket_price: data.ticket_price ?? "",
            opening_hours: data.opening_hours ?? "",
            best_time: data.best_time ?? "",
            latitude: String(data.latitude ?? ""),
            longitude: String(data.longitude ?? ""),
            video_url: data.video_url ?? "",
            seo_title: data.seo_title ?? "",
            seo_keywords: data.seo_keywords ?? "",
            seo_description: data.seo_description ?? "",
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
      const res = await fetch("/api/events?limit=100");
      const json = await res.json();
      setAllEvents(json?.data ?? []);
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
      if (data.seoKeywords) setField("seo_keywords", data.seoKeywords);
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
          <button onClick={save} disabled={saving}
            className="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition-premium cursor-pointer flex items-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
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
                  <h4 className="text-sm font-bold text-gray-800 font-display">General Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FieldInput label="Destination Name" value={form.name} onChange={(v) => setField("name", v)} />
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
                    <FieldInput label="Tagline" value={form.tagline} onChange={(v) => setField("tagline", v)} />
                    <FieldInput label="Location / Address" value={form.location} onChange={(v) => setField("location", v)} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Editorial Description</label>
                      <button onClick={generateAI} disabled={aiLoading}
                        className="flex items-center gap-1.5 text-primary hover:text-primary-dark text-xs font-bold cursor-pointer disabled:opacity-60 transition">
                        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {aiLoading ? "Generating…" : "AI Generate"}
                      </button>
                    </div>
                    <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={6}
                      className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium leading-relaxed" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Story / Editorial</label>
                    <textarea value={form.story} onChange={(e) => setField("story", e.target.value)} rows={4}
                      className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium leading-relaxed" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
                  <h4 className="text-sm font-bold text-gray-800 font-display">Practical Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FieldInput label="Ticket Price" value={form.ticket_price} onChange={(v) => setField("ticket_price", v)} />
                    <FieldInput label="Opening Hours" value={form.opening_hours} onChange={(v) => setField("opening_hours", v)} />
                    <FieldInput label="Best Time to Visit" value={form.best_time} onChange={(v) => setField("best_time", v)} />
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
                      <Image src={img} alt={`gallery-${i}`} fill className="object-cover" sizes="200px" />

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
                  <FieldInput label="Meta Title" value={form.seo_title} onChange={(v) => setField("seo_title", v)} />
                  <FieldInput label="Meta Keywords" value={form.seo_keywords} onChange={(v) => setField("seo_keywords", v)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Meta Description</label>
                  <textarea value={form.seo_description} onChange={(e) => setField("seo_description", e.target.value)} rows={3}
                    className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
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
                  <Image src={galleryImgs[0]} alt="cover" fill className="object-cover" sizes="300px" />
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
    </>
  );
}
