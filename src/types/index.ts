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
