// ─── Auth ─────────────────────────────────────────────────────────────────────
export type AdminRole = "admin" | "superadmin";

export interface AdminUser {
  name: string;
  role: string;
  email: string;
  avatar: string;
}

// ─── Backend entities ─────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  email_verified?: boolean;
  last_login_at?: string;
}

export interface DestinationImage {
  url: string;
  credit?: string;
}

export interface Destination {
  id: string;
  name: string;
  name_en?: string;
  category?: string;
  sub_region?: string;
  location?: string;
  description?: string;
  description_en?: string;
  story?: string;
  story_en?: string;
  tagline?: string;
  tagline_en?: string;
  ticket_price?: string;
  opening_hours?: string;
  best_time?: string;
  best_time_en?: string;
  latitude?: string | number;
  longitude?: string | number;
  rating?: number;
  review_count?: number;
  images?: DestinationImage[] | string[] | string;
  facilities?: string[] | string;
  travel_tips?: string[] | string;
  faqs?: string[] | string | { q: string; a: string }[];
  weather?: Record<string, unknown>;
  seo_title?: string;
  seo_title_en?: string;
  seo_keywords?: string;
  seo_keywords_en?: string;
  seo_description?: string;
  seo_description_en?: string;
  og_image_url?: string;
  video_url?: string;
  google_maps_url?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Partner {
  id: string;
  name: string;
  description?: string;
  category?: string;
  location?: string;
  address?: string;
  image?: string;
  rating?: number;
  price?: string;
  distance?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  is_sponsored?: boolean;
  sponsor_tier?: number;
  sponsor_start_at?: string;
  sponsor_end_at?: string;
  target_dest_ids?: string[];
  impression_count?: number;
  click_count?: number;
  sponsor_price?: number;
  sponsor_price_currency?: string;
  sponsor_payment_status?: string;
  status?: string;
  owner_user_id?: string;
  rejection_reason?: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface Business {
  id: string;
  external_id?: string;
  name: string;
  description?: string;
  category: string;
  phone?: string;
  email?: string;
  website?: string;
  avatar_url?: string;
  status?: string;
  legacy_partner_external_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdCampaign {
  id: string;
  partner_name: string;
  business_external_id?: string;
  business_name?: string;
  placement: string;
  image_url: string;
  target_url: string;
  category?: string;
  start_at?: string;
  end_at?: string;
  weight?: number;
  impressions?: number;
  clicks?: number;
  is_active?: boolean;
  price_amount?: number;
  price_currency?: string;
  payment_status?: string;
}

export interface HouseAd {
  id: string;
  placement: string;
  headline: string;
  subline?: string;
  cta_label: string;
  image_url?: string;
  target_url: string;
  is_enabled?: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  description?: string;
  location?: string;
  address?: string;
  stars?: number;
  price_per_night?: string;
  images?: unknown[];
  amenities?: unknown[];
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  review_count?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  location?: string;
  address?: string;
  cuisine_type?: string;
  price_range?: string;
  images?: unknown[];
  opening_hours?: string;
  phone?: string;
  rating?: number;
  review_count?: number;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  image_url?: string;
  images?: { url: string; credit?: string }[] | string[] | string;
  category?: string;
  status?: string;
  ticket_price?: string;
  organizer?: string;
  max_attendees?: number;
  video_url?: string;
  destination_id?: string;
  title_en?: string;
  description_en?: string;
  seo_title?: string;
  seo_title_en?: string;
  seo_description?: string;
  seo_description_en?: string;
  seo_keywords?: string;
  seo_keywords_en?: string;
  og_image_url?: string;
  highlights?: unknown[];
  badge?: string;
  badges?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Guide {
  id: string;
  name: string;
  bio?: string;
  specialization?: string;
  phone?: string;
  email?: string;
  rating?: number;
  review_count?: number;
  languages?: unknown[];
  price_per_day?: string;
  avatar?: string;
}

export interface Souvenir {
  id: string;
  name: string;
  description?: string;
  location?: string;
  address?: string;
  images?: unknown[];
  product_types?: unknown[];
  price_range?: string;
  phone?: string;
  rating?: number;
}

export interface Rental {
  id: string;
  name: string;
  description?: string;
  location?: string;
  address?: string;
  vehicle_types?: unknown[];
  price_per_day?: string;
  images?: unknown[];
  phone?: string;
  rating?: number;
}

export interface Story {
  id: string;
  user_id?: string;
  title: string;
  content?: string;
  images?: unknown[];
  destination_ids?: unknown[];
  likes?: number;
  status?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  title_en?: string;
  excerpt?: string;
  excerpt_en?: string;
  content?: string;
  content_en?: string;
  cover_image?: string;
  category?: string;
  tags?: string[];
  author?: string;
  status?: string;
  published_at?: string;
  seo_title?: string;
  seo_title_en?: string;
  seo_description?: string;
  seo_description_en?: string;
  seo_keywords?: string;
  seo_keywords_en?: string;
  og_image?: string;
  read_time_minutes?: number;
}

export interface Role {
  id: string | number;
  name: string;
  // BE returns role_permissions as {id, permission}[] but we normalise to string[]
  permissions?: string[] | { permission: string }[] | string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export interface NavItem {
  name: string;
  icon: string;
  path: string;
  activeId: string;
  badge?: string;
  badgeColor?: string;
  roles?: AdminRole[];
}

export interface MenuGroup {
  title: string;
  items: NavItem[];
}

// ─── API response wrappers ────────────────────────────────────────────────────
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiResponse<T = unknown> {
  status: string;
  message?: string;
  data?: T;
}

export interface ApiListResponse<T = unknown> {
  status: string;
  message?: string;
  data?: T[];
  meta?: PaginationMeta;
}

// ─── AI ───────────────────────────────────────────────────────────────────────
export interface ReviewSummary {
  summary: string;
  sentiment: string;
  tags: string[];
}

export interface DescriptionResult {
  description: string;
  seoKeywords: string;
}

// ─── Payments ────────────────────────────────────────────────────────────────
export interface PaymentTransaction {
  id: string;
  order_id: string;
  subject_type: "ad_campaign" | "partner_sponsorship";
  subject_external_id: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "expired" | "failed" | "refunded";
  midtrans_token?: string;
  payment_type?: string;
  transaction_id?: string;
  paid_at?: string;
  expires_at?: string;
  created_at?: string;
}

// ─── Site Config ─────────────────────────────────────────────────────────────
export interface SiteSeoConfig {
  site_title: string;
  site_description: string;
  site_keywords: string;
  og_default_image: string;
  twitter_handle: string;
  landing_hero_title: string;
  landing_hero_subtitle: string;
  landing_cta_text: string;
}
