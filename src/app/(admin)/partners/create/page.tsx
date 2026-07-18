"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { ArrowLeft } from "lucide-react";

export default function CreatePartnerPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "Tourism", description: "",
    location: "", website: "", phone: "", price: "", image: "",
  });

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast("Created", "Partner added successfully", "success");
        router.push("/partners");
      } else {
        showToast("Error", "Failed to create partner", "error");
      }
    } catch { showToast("Error", "Network error", "error"); }
    finally { setSaving(false); }
  }

  const field = (label: string, key: string) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">{label}</label>
      <input
        value={form[key as keyof typeof form]}
        onChange={e => set(key, e.target.value)}
        className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
      />
    </div>
  );

  return (
    <>
      <Header activeId="partners" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/partners" className="p-2.5 rounded-xl border border-border hover:bg-bg text-gray-500 transition-premium">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Create Partner</h2>
        </div>

        <form onSubmit={submit} className="bg-white p-6 rounded-card border border-border shadow-soft max-w-2xl space-y-5">
          {field("Name", "name")}
          {field("Category", "category")}
          {field("Description", "description")}
          {field("Location", "location")}
          {field("Website", "website")}
          {field("Phone", "phone")}
          {field("Price", "price")}
          {field("Image URL", "image")}
          
          <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-xs font-semibold shadow-premium transition">
            {saving ? "Creating…" : "Create Partner"}
          </button>
        </form>
      </main>
    </>
  );
}
