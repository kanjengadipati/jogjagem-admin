export interface AdPlacementInfo {
  name: string;
  description: string;
  sellable: boolean;
  /** Harga flat per bulan (IDR) untuk self-service. Nilai 0 = tidak dijual self-service. */
  price: number;
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
    price: 300000,
    imageSpec: { width: 1600, height: 500, label: "16:5 — 1600×500px" },
  },
  homepage_hero_trending: {
    name: "Hero — Trending Now",
    description:
      "Carousel Trending, masih di dalam section Hero (bukan section terpisah). Disisipkan di posisi ke-3 & ke-8 di antara destinasi/event organik.",
    sellable: true,
    price: 250000,
    imageSpec: { width: 480, height: 360, label: "native card — 480×360px" },
  },
  homepage_category_banner: {
    name: "Homepage — Banner Kategori",
    description:
      "Banner di homepage, tepat di bawah filter kategori, sebelum grid Destinasi Populer. Terpisah dari Hero, tanpa mekanisme coin-flip.",
    sellable: true,
    price: 350000,
    // NOTE: spec ini belum dicek apakah 1600×500 cocok untuk posisi banner di bawah filter
    // kategori (konteks visual beda dari kartu besar di dalam Hero). Verifikasi ke desain dulu.
    imageSpec: { width: 1600, height: 500, label: "16:5 — 1600×500px" },
  },
  listing_top: {
    name: "Destinasi Populer Grid",
    description:
      'Menempatkan bisnis Anda di grid "Destinasi Populer" homepage, di posisi ke-5 dan ke-14 — bukan hasil pencarian umum, spesifik ke grid ini saja.',
    sellable: true,
    price: 250000,
    imageSpec: { width: 800, height: 300, label: "native card — 800×300px" },
  },
  listing_native: {
    name: "Native Ad — Festival & Destinasi",
    description: "Tayang bergantian di carousel Festival & Event.",
    sellable: true,
    price: 200000,
    notes:
      "Di halaman Destinations, placement ini House-Ad-only — TIDAK dijual di situ, cuma diisi konten Jogjagem sendiri.",
    imageSpec: { width: 480, height: 360, label: "native card — 480×360px" },
  },
  destination_detail: {
    name: "Destination Detail Sponsorship",
    description: "Banner di halaman detail destinasi, fallback ke House Ad kalau kosong.",
    sellable: true,
    price: 400000,
    imageSpec: { width: 1200, height: 375, label: "16:5 wide — 1200×375px" },
  },
  ecosystem_stay: {
    name: "Rel Rekomendasi — Menginap",
    description:
      "Kartu sponsor di rel 'Rekomendasi Kebutuhan Traveler' tab Menginap (hotel) halaman destinasi. Memakai data listing hotel milik bisnis yang dipilih.",
    sellable: true,
    price: 300000,
    notes: "Wajib pilih listing hotel milik bisnis; target destinasi opsional (kosong = semua).",
    imageSpec: { width: 400, height: 400, label: "kartu native — pakai foto listing" },
  },
  ecosystem_eat: {
    name: "Rel Rekomendasi — Kuliner",
    description:
      "Kartu sponsor di rel 'Rekomendasi Kebutuhan Traveler' tab Kuliner (restoran/kafe) halaman destinasi.",
    sellable: true,
    price: 250000,
    notes: "Wajib pilih listing restoran milik bisnis; target destinasi opsional (kosong = semua).",
    imageSpec: { width: 400, height: 400, label: "kartu native — pakai foto listing" },
  },
  ecosystem_experience: {
    name: "Rel Rekomendasi — Vibe & Aktivitas",
    description:
      "Kartu sponsor di rel 'Rekomendasi Kebutuhan Traveler' tab Vibe & Aktivitas (rental/agen) halaman destinasi.",
    sellable: true,
    price: 250000,
    notes: "Wajib pilih listing rental milik bisnis; target destinasi opsional (kosong = semua).",
    imageSpec: { width: 400, height: 400, label: "kartu native — pakai foto listing" },
  },
  ecosystem_shop: {
    name: "Rel Rekomendasi — Belanja",
    description:
      "Kartu sponsor di rel 'Rekomendasi Kebutuhan Traveler' tab Belanja (souvenir) halaman destinasi.",
    sellable: true,
    price: 200000,
    notes: "Wajib pilih listing souvenir milik bisnis; target destinasi opsional (kosong = semua).",
    imageSpec: { width: 400, height: 400, label: "kartu native — pakai foto listing" },
  },
  ecosystem_move: {
    name: "Rel Rekomendasi — Transport",
    description:
      "Kartu sponsor di rel 'Rekomendasi Kebutuhan Traveler' tab Transport (rental/transport) halaman destinasi.",
    sellable: true,
    price: 200000,
    notes: "Wajib pilih listing rental milik bisnis; target destinasi opsional (kosong = semua).",
    imageSpec: { width: 400, height: 400, label: "kartu native — pakai foto listing" },
  },
  ecosystem_guide: {
    name: "Rel Rekomendasi — Guide Lokal",
    description:
      "Kartu sponsor di rel 'Rekomendasi Kebutuhan Traveler' tab Guide Lokal halaman destinasi.",
    sellable: true,
    price: 200000,
    notes: "Wajib pilih listing guide milik bisnis; target destinasi opsional (kosong = semua).",
    imageSpec: { width: 400, height: 400, label: "kartu native — pakai foto avatar guide" },
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

/**
 * Harga flat untuk periode kampanye: tarif bulanan × jumlah bulan yang dicakup
 * (bulan pecahan dibulatkan ke atas, minimal 1 bulan). Disarankan MIRIP dengan
 * logika PriceFor() di jogjagem-api/internal/modules/adcampaign/pricing.go —
 * backend tetap sumber kebenaran harga; ini hanya untuk display di form.
 */
export function computePrice(
  placement: string,
  start?: string,
  end?: string
): number {
  const monthly = AD_PLACEMENTS[placement]?.price ?? 0;
  if (!start || !end) return monthly;
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) {
    return monthly;
  }
  const days = Math.floor((endMs - startMs) / 86400000) + 1;
  if (days <= 0) return monthly;
  const months = Math.max(1, Math.ceil(days / 30));
  return monthly * months;
}

export function formatPrice(amount?: number): string {
  if (!amount) return "";
  return "Rp " + amount.toLocaleString("id-ID");
}
