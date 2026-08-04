"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import CoverImageUpload from "@/components/CoverImageUpload";
import { useToast } from "@/components/Toast";
import { ArrowLeft, CheckCircle, ExternalLink, Loader2, Megaphone } from "lucide-react";
import type { Business } from "@/types";

const PLACEMENTS = [
  { value: "homepage_hero_aicard", label: "Homepage Hero AIPick Card (hero pick card 50:50)" },
  { value: "homepage_hero_trending", label: "Homepage Hero Trending (carousel #3 & #8)" },
  { value: "homepage_category_banner", label: "Homepage Category Banner (below category filters)" },
  { value: "listing_top", label: "Listing Top Banner" },
  { value: "listing_native", label: "Listing Native Card (inline in grid)" },
  { value: "destination_detail", label: "Destination Detail Page" },
];

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "Temple", label: "Temple" },
  { value: "Beach", label: "Beach" },
  { value: "Nature", label: "Nature" },
  { value: "Heritage", label: "Heritage" },
  { value: "Cultural", label: "Cultural" },
  { value: "Culinary", label: "Culinary" },
  { value: "Shopping", label: "Shopping" },
  { value: "Adventure", label: "Adventure" },
  { value: "hidden-gem", label: "Hidden Gem" },
  { value: "family", label: "Family" },
  { value: "weekend", label: "Weekend" },
  { value: "sunset", label: "Sunset" },
  { value: "sunrise", label: "Sunrise" },
  { value: "camping", label: "Camping" },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CreateAdCampaignPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(true);
  const [form, setForm] = useState({
    business_id: "",
    placement: "homepage_hero_aicard",
    image_url: "",
    target_url: "",
    category: "",
    start_at: "",
    end_at: "",
    weight: "1",
    price_amount: "",
    price_currency: "IDR",
  });

  const selectedBusiness = businesses.find((b) => (b.external_id || b.id) === form.business_id);

  useEffect(() => {
    fetch("/api/businesses")
      .then((r) => r.json())
      .then((d) => setBusinesses((d?.data ?? []).filter((b: Business) => b.status === "approved")))
      .catch(() => showToast("Error", "Failed to load businesses", "error"))
      .finally(() => setBusinessesLoading(false));
  }, [showToast]);

  function set<K extends keyof typeof form>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.business_id || !selectedBusiness || !form.image_url || !form.target_url) {
      showToast("Missing fields", "Business, image URL, and target URL are required", "error");
      return;
    }

    setSaving(true);
    try {
      const bizExtId = selectedBusiness.external_id || selectedBusiness.id;
      const externalId = `${slugify(selectedBusiness.name)}-${Date.now().toString(36)}`;
      const res = await fetch("/api/ad-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: externalId,
          business_external_id: bizExtId,
          // partner_name is still NOT NULL in the DB during the migration
          // transition; auto-filled from the selected business until Phase 4
          // step 4 drops the column.
          partner_name: selectedBusiness.name,
          placement: form.placement,
          image_url: form.image_url,
          target_url: form.target_url,
          category: form.category || undefined,
          start_at: form.start_at ? new Date(form.start_at).toISOString() : undefined,
          end_at: form.end_at ? new Date(form.end_at).toISOString() : undefined,
          weight: Number(form.weight) || 1,
          price_amount: Number(form.price_amount) || 0,
          price_currency: form.price_currency || "IDR",
          payment_status: "pending",
          is_active: true,
        }),
      });

      if (res.ok) {
        showToast("Created", "Ad campaign added successfully", "success");
        router.push("/ad-campaigns");
      } else {
        showToast("Error", "Failed to create ad campaign", "error");
      }
    } catch {
      showToast("Error", "Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header activeId="ad-campaigns" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/ad-campaigns"
            className="p-2.5 rounded-xl border border-border hover:bg-bg text-gray-500 transition-premium"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-primary font-display uppercase tracking-widest bg-primary/5 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Partner ads
            </span>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">New Ad Campaign</h2>
          </div>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <h4 className="text-sm font-bold text-gray-800 font-display">Campaign Details</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                    Business
                  </label>
                  {businessesLoading ? (
                    <div className="w-full bg-bg flex items-center gap-2 text-xs px-4 py-3 rounded-xl border border-transparent text-gray-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading businesses...
                    </div>
                  ) : businesses.length === 0 ? (
                    <div className="w-full bg-bg text-xs px-4 py-3 rounded-xl border border-transparent text-danger">
                      No approved businesses yet — create one first.
                    </div>
                  ) : (
                    <select
                      value={form.business_id}
                      onChange={(e) => set("business_id", e.target.value)}
                      className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer"
                    >
                      <option value="">Select a business...</option>
                      {businesses.map((b) => {
                        const val = b.external_id || b.id;
                        return (
                          <option key={val} value={val}>{b.name}</option>
                        );
                      })}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                    Placement
                  </label>
                  <select
                    value={form.placement}
                    onChange={(e) => set("placement", e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer"
                  >
                    {PLACEMENTS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                  Target URL
                </label>
                <input
                  value={form.target_url}
                  onChange={(e) => set("target_url", e.target.value)}
                  placeholder="https://partner-website.com/promo"
                  className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.value || "all"} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.start_at}
                    onChange={(e) => set("start_at", e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.end_at}
                    onChange={(e) => set("end_at", e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <h4 className="text-sm font-bold text-gray-800 font-display">Creative</h4>
              <CoverImageUpload
                value={form.image_url}
                onChange={(url) => set("image_url", url)}
                label="Creative Image"
                folder="explore-jogja/ad-campaigns"
                aspectClassName={form.placement === "listing_native" ? "aspect-[3/4]" : "aspect-[16/6]"}
              />
            </div>

            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <h4 className="text-sm font-bold text-gray-800 font-display">Pricing & Rotation</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                    Weight
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.weight}
                    onChange={(e) => set("weight", e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                    Flat Fee
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.price_amount}
                    onChange={(e) => set("price_amount", e.target.value)}
                    placeholder="0"
                    className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display block">
                    Currency
                  </label>
                  <input
                    value={form.price_currency}
                    onChange={(e) => set("price_currency", e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400">
                Flat fee for this campaign period. Payment status starts as pending and is updated manually from the list.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Publish</h4>
              <button
                type="submit"
                disabled={saving || !form.business_id || !form.image_url || !form.target_url}
                className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-3 rounded-xl text-xs font-semibold shadow-premium transition-premium cursor-pointer disabled:cursor-not-allowed"
              >
                {saving ? "Creating..." : "Create Campaign"}
              </button>
              <Link href="/ad-campaigns" className="block w-full text-center border border-border text-gray-600 hover:bg-bg py-3 rounded-xl text-xs font-semibold transition-premium">
                Cancel
              </Link>
            </div>

            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Preview</h4>
                <span className="flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                  <Megaphone className="w-3 h-3" /> Sponsored
                </span>
              </div>
              <div className={`relative w-full overflow-hidden rounded-xl bg-bg border border-border ${
                form.placement === "listing_native" ? "aspect-[3/4]" : "aspect-[16/6]"
              }`}>
                {form.image_url ? (
                  <Image src={form.image_url} alt="Campaign preview" fill className="object-cover" sizes="360px" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    <Megaphone className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 font-display leading-snug">
                  {selectedBusiness?.name || "Business name"}
                </h3>
                {form.target_url && (
                  <a href={form.target_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" /> Open target
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Summary</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Placement</span>
                  <span className="font-semibold text-gray-700 text-right">{PLACEMENTS.find((p) => p.value === form.placement)?.label}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Category</span>
                  <span className="font-semibold text-gray-700 text-right">
                    {CATEGORIES.find((category) => category.value === form.category)?.label ?? "All Categories"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Price</span>
                  <span className="font-semibold text-gray-700">
                    {form.price_currency || "IDR"} {(Number(form.price_amount) || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Payment</span>
                  <span className="flex items-center gap-1 font-semibold text-warning">
                    <CheckCircle className="w-3.5 h-3.5" /> Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
