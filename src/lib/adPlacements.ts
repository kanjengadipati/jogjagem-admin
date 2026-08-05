export interface AdPlacementInfo {
  name: string;
  description: string;
  sellable: boolean;
  /** Catatan tambahan kalau sellable-nya gak seragam di semua tempat placement ini kepake. */
  notes?: string;
  imageSpec: { width: number; height: number; label: string };
}

export const AD_PLACEMENTS: Record<string, AdPlacementInfo> = {
  homepage_hero_aicard: {
    name: "Hero — AI Pick",
    description:
      'Kartu coin-flip 50:50 di dalam section Hero homepage, gantian sama rekomendasi AI organik. Badge tampil "SPONSORED"/"DISPONSORI" kalau menang, bukan badge AI Pick.',
    sellable: true,
    imageSpec: { width: 1600, height: 500, label: "16:5 — 1600×500px" },
  },
  homepage_hero_trending: {
    name: "Hero — Trending Now",
    description:
      "Carousel Trending, masih di dalam section Hero (bukan section terpisah). Disisipkan di posisi ke-3 & ke-8 di antara destinasi/event organik.",
    sellable: true,
    imageSpec: { width: 480, height: 360, label: "native card — 480×360px" },
  },
  homepage_category_banner: {
    name: "Homepage — Banner Kategori",
    description:
      "Banner di homepage, tepat di bawah filter kategori, sebelum grid Destinasi Populer. Terpisah dari Hero, tanpa mekanisme coin-flip.",
    sellable: true,
    // NOTE: spec ini belum dicek apakah 1600×500 cocok untuk posisi banner di bawah filter
    // kategori (konteks visual beda dari kartu besar di dalam Hero). Verifikasi ke desain dulu.
    imageSpec: { width: 1600, height: 500, label: "16:5 — 1600×500px" },
  },
  listing_top: {
    name: "Destinasi Populer Grid",
    description:
      'Menempatkan bisnis Anda di grid "Destinasi Populer" homepage, di posisi ke-5 dan ke-14 — bukan hasil pencarian umum, spesifik ke grid ini saja.',
    sellable: true,
    imageSpec: { width: 800, height: 300, label: "native card — 800×300px" },
  },
  listing_native: {
    name: "Native Ad — Festival & Destinasi",
    description: "Tayang bergantian di carousel Festival & Event.",
    sellable: true,
    notes:
      "Di halaman Destinations, placement ini House-Ad-only — TIDAK dijual di situ, cuma diisi konten Jogjagem sendiri.",
    imageSpec: { width: 480, height: 360, label: "native card — 480×360px" },
  },
  destination_detail: {
    name: "Destination Detail Sponsorship",
    description: "Banner di halaman detail destinasi, fallback ke House Ad kalau kosong.",
    sellable: true,
    imageSpec: { width: 1200, height: 375, label: "16:5 wide — 1200×375px" },
  },
};

export const PLACEMENT_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(AD_PLACEMENTS).map(([key, info]) => [key, info.name])
);

export const PLACEMENT_DESCRIPTIONS: Record<string, string> = Object.fromEntries(
  Object.entries(AD_PLACEMENTS).map(([key, info]) => [key, info.description])
);

export const SELLABLE_PLACEMENTS = Object.entries(AD_PLACEMENTS)
  .filter(([, info]) => info.sellable)
  .map(([key]) => key);
