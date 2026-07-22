"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Event } from "@/types";

type FormState = {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  category: string;
  status: string;
  ticket_price: string;
  organizer: string;
  video_url: string;
};

const EMPTY_FORM: FormState = {
  title: "", description: "", location: "", start_date: "", end_date: "",
  category: "", status: "upcoming", ticket_price: "", organizer: "", video_url: "",
};

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? "";
}

function FieldInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
      />
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function setField(key: keyof FormState, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const data: Event = d?.data ?? null;
        if (data) {
          setForm({
            title: data.title ?? "",
            description: data.description ?? "",
            location: data.location ?? "",
            start_date: data.start_date ?? "",
            end_date: data.end_date ?? "",
            category: data.category ?? "",
            status: data.status ?? "upcoming",
            ticket_price: data.ticket_price ?? "",
            organizer: data.organizer ?? "",
            video_url: data.video_url ?? "",
          });
        }
      })
      .catch(() => showToast("Error", "Failed to load event", "error"))
      .finally(() => setLoading(false));
  }, [id, showToast]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast("Saved", "Event updated successfully", "success");
        router.push("/events");
      } else {
        showToast("Error", "Save failed", "error");
      }
    } catch {
      showToast("Error", "Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Header activeId="events" />;

  return (
    <>
      <Header activeId="events" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/events" className="p-2.5 rounded-xl border border-border hover:bg-bg text-gray-500 transition-premium">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Edit Event</h2>
          </div>
          <button onClick={save} disabled={saving}
            className="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition-premium cursor-pointer flex items-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
            <FieldInput label="Title" value={form.title} onChange={(v) => setField("title", v)} />
            <div className="grid grid-cols-2 gap-5">
                <FieldInput label="Start Date" value={form.start_date} onChange={(v) => setField("start_date", v)} />
                <FieldInput label="End Date" value={form.end_date} onChange={(v) => setField("end_date", v)} />
            </div>
            <FieldInput label="Location" value={form.location} onChange={(v) => setField("location", v)} />
            <FieldInput label="Video URL" value={form.video_url} onChange={(v) => setField("video_url", v)} />
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
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">Description</label>
                <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={4}
                    className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-medium leading-relaxed" />
            </div>
        </div>
      </main>
    </>
  );
}
