// ─── Auth ─────────────────────────────────────────────────────────────────────
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
  category?: string;
  sub_region?: string;
  location?: string;
  description?: string;
  story?: string;
  tagline?: string;
  ticket_price?: string;
  opening_hours?: string;
  best_time?: string;
  latitude?: string | number;
  longitude?: string | number;
  rating?: number;
  review_count?: number;
  images?: DestinationImage[] | string[] | string;
  facilities?: string[] | string;
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
  category?: string;
  status?: string;
  ticket_price?: string;
  organizer?: string;
  max_attendees?: number;
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

export interface Role {
  id: string;
  name: string;
  permissions?: string[] | string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export interface NavItem {
  name: string;
  icon: string;
  path: string;
  activeId: string;
  badge?: string;
  badgeColor?: string;
}

export interface MenuGroup {
  title: string;
  items: NavItem[];
}

// ─── API response wrappers ────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  status: string;
  message?: string;
  data?: T;
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
